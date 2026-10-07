import { randomUUID } from 'node:crypto';
import type { ElementHandle, JSHandle } from 'playwright';
import { digest } from '../core/normalize.js';
import type { Requests, Responses } from '../contracts/index.js';
import { BrowserDriver } from './driver.js';
import { BrowserError } from './protocol.js';

type Action = Requests['wg_browser_act']['action'];
type Receipt = Responses['wg_browser_act']['data'];
type Snapshot = Responses['wg_browser_snapshot']['data'];
type Handle = ElementHandle<HTMLElement | SVGElement>;

type OptionState = { option: HTMLOptionElement; value: string };
async function inspect(handle: Handle, accessibleName: string) {
  // Fixed internal read-only policy; no values, cookies or caller JS are read.
  return handle.evaluate((element, accessibleName) => {
    const tag = element.tagName.toLowerCase();
    const input = element as HTMLInputElement;
    const type = tag === 'input' ? input.type : '';
    const identity =
      ['name', 'id', 'autocomplete', 'aria-label', 'placeholder']
        .map((k) => element.getAttribute(k) ?? '')
        .join(' ')
        .toLowerCase() +
      ' ' +
      accessibleName.toLowerCase() +
      ' ' +
      [...(input.labels ?? [])]
        .map((label) => label.textContent ?? '')
        .join(' ')
        .toLowerCase() +
      ' ' +
      (element.getAttribute('aria-labelledby') ?? '')
        .split(/\s+/)
        .map(
          (id) => element.ownerDocument.getElementById(id)?.textContent ?? '',
        )
        .join(' ')
        .toLowerCase();
    const credential =
      (tag === 'input' &&
        ['password', 'email', 'tel', 'url', 'file', 'hidden'].includes(type)) ||
      /password|passcode|secret|token|auth|username|login|email|otp|mfa|credit|card|payment|cvv|cvc|iban|credential|one[-_ ]?time|verification|\bcode\b|\bpin\b|\bcc[-_ ]/.test(
        identity,
      ) ||
      (['input', 'textarea', 'select'].includes(tag) &&
        !!input.form?.querySelector('input[type="password"]'));
    const options =
      tag === 'select'
        ? [...(element as HTMLSelectElement).options].map((o, index) => ({
            index,
            label: o.label.replace(/\s+/g, ' ').trim(),
            disabled: o.matches(':disabled'),
          }))
        : [];
    return {
      credential,
      enabled: !element.matches(':disabled'),
      fill:
        !credential &&
        !input.readOnly &&
        (tag === 'textarea' ||
          (tag === 'input' && ['text', 'search', 'number'].includes(type))),
      check: !credential && tag === 'input' && type === 'checkbox',
      select:
        !credential &&
        tag === 'select' &&
        !(element as HTMLSelectElement).multiple &&
        options.length <= 50,
      options,
    };
  }, accessibleName);
}
export class BrowserActions {
  private choices = new Map<
    string,
    {
      fingerprint: string;
      options: Map<string, { index: number; reference: JSHandle<OptionState> }>;
    }
  >();
  private prepared: { receipt: Receipt; action: Action } | undefined;
  constructor(private readonly driver: BrowserDriver) {}
  private async releaseChoices() {
    await Promise.all(
      [...this.choices.values()].flatMap((c) =>
        [...c.options.values()].map((o) =>
          o.reference.dispose().catch(() => undefined),
        ),
      ),
    );
    this.choices.clear();
  }
  async decorate(snapshot: Snapshot) {
    await this.releaseChoices();
    this.prepared = undefined;
    const deadline = Date.now() + 5000;
    const allowed = new Set(
      this.driver.app.redaction_profiles[0]!.allowed_labels.map((s) =>
        s.replace(/\s+/g, ' ').trim(),
      ),
    );
    for (const target of snapshot.targets) {
      if (Date.now() > deadline) throw new BrowserError('LIMIT_EXCEEDED');
      try {
        const handle = this.driver.cached(target.target_id);
        if (!handle) continue;
        const policy = await inspect(handle, target.name);
        if (policy.credential || !policy.enabled) continue;
        target.permitted_actions = ['click', 'scroll', 'key'];
        if (policy.fill) target.permitted_actions.push('fill');
        if (policy.check) target.permitted_actions.push('check', 'uncheck');
        if (policy.select) {
          const options = new Map<
            string,
            { index: number; reference: JSHandle<OptionState> }
          >();
          for (const option of policy.options)
            if (allowed.has(option.label) && !option.disabled)
              options.set(randomUUID(), {
                index: option.index,
                reference: await handle.evaluateHandle((element, index) => {
                  const option = (element as HTMLSelectElement).options[index]!;
                  return { option, value: option.value };
                }, option.index),
              });
          if (options.size) {
            target.permitted_actions.push('select');
            target.option_ids = [...options.keys()];
            this.choices.set(target.target_id, {
              fingerprint: digest(policy.options),
              options,
            });
          }
        }
      } catch (error) {
        if (!(
          error instanceof BrowserError &&
          ['AMBIGUOUS_TARGET', 'STALE_TARGET'].includes(error.code)
        ))
          throw error;
      }
    }
  }
  private async authorize(action: Action) {
    const resolved = await this.driver.resolve(
      action.session_id,
      action.page_id,
      action.snapshot_id,
      action.target_id,
    );
    const policy = await inspect(resolved.handle, resolved.descriptor.name);
    if (policy.credential) throw new BrowserError('CREDENTIAL_FIELD');
    if (!resolved.descriptor.permitted_actions.includes(action.kind))
      throw new BrowserError('ACTION_NOT_ALLOWED');
    if (
      (action.kind === 'fill' && !policy.fill) ||
      (['check', 'uncheck'].includes(action.kind) && !policy.check)
    )
      throw new BrowserError('ACTION_NOT_ALLOWED');
    let optionReference: JSHandle<OptionState> | undefined;
    if (action.kind === 'select') {
      const choice = this.choices.get(action.target_id);
      const selected = choice?.options.get(action.option_id);
      if (
        !policy.select ||
        !selected ||
        choice?.fingerprint !== digest(policy.options)
      )
        throw new BrowserError('STALE_TARGET');
      const current = await selected!.reference.evaluate(
        (saved) =>
          saved.option.isConnected && saved.option.value === saved.value,
      );
      const same = await resolved.handle.evaluate(
        (element, saved) =>
          (element as HTMLSelectElement).options[saved.option.index] ===
          saved.option,
        selected!.reference,
      );
      if (!current || !same) throw new BrowserError('STALE_TARGET');
      optionReference = selected!.reference;
    }
    return { ...resolved, optionReference };
  }
  async prepare(q: Requests['wg_browser_act']): Promise<Receipt> {
    await this.authorize(q.action);
    const receipt = this.driver.receipt(
      q.execution_id,
      q.action.snapshot_id,
      q.action.kind,
      q.action.target_id,
    );
    this.prepared = { receipt, action: q.action };
    return receipt;
  }
  async act(execution: string): Promise<Receipt> {
    const prepared = this.prepared;
    this.prepared = undefined;
    if (!prepared || prepared.receipt.execution_id !== execution)
      throw new BrowserError('EXECUTION_CONFLICT');
    let authorized;
    try {
      authorized = await this.authorize(prepared.action);
    } catch (error) {
      return {
        ...prepared.receipt,
        after_snapshot_id: null,
        state: 'not_started',
        dispatch: 'not_dispatched',
        error_code:
          error instanceof BrowserError ? error.code : 'APPLICATION_ERROR',
      };
    }
    // Invalidate public handles before dispatch; retain the single owned element
    // until its bounded operation completes. No locator silently retargets it.
    this.driver.consume();
    const { handle, optionReference } = authorized;
    const action = prepared.action;
    try {
      switch (action.kind) {
        case 'click':
          await handle.click({ timeout: 3000, noWaitAfter: true });
          break;
        case 'fill':
          await handle.fill(action.text, { timeout: 3000 });
          break;
        case 'select': {
          const optionElement = (
            await optionReference!.getProperty('option')
          ).asElement() as ElementHandle<HTMLOptionElement>;
          try {
            await handle.selectOption(optionElement, { timeout: 3000 });
          } finally {
            await optionElement.dispose().catch(() => undefined);
          }
          break;
        }
        case 'check':
          await handle.check({ timeout: 3000 });
          break;
        case 'uncheck':
          await handle.uncheck({ timeout: 3000 });
          break;
        case 'scroll':
          await handle.hover({ timeout: 3000 });
          await this.driver.page.mouse.wheel(
            action.axis === 'horizontal' ? action.delta : 0,
            action.axis === 'vertical' ? action.delta : 0,
          );
          break;
        case 'key':
          await handle.press(action.key, { timeout: 3000 });
          break;
      }
      return {
        ...prepared.receipt,
        state: 'succeeded',
        dispatch: 'dispatched',
        error_code: null,
      };
    } catch {
      // Errors/timeouts can occur after a partial application side effect.
      return {
        ...prepared.receipt,
        state: 'unknown',
        dispatch: 'uncertain',
        error_code: 'UNKNOWN_OUTCOME',
      };
    } finally {
      await this.releaseChoices();
      await this.driver.invalidate();
    }
  }
}
