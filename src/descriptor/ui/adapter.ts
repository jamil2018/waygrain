import type { EvidencePackage } from '../retrieval.js';

export interface DocumentationReader {
  read(targetId: string): Promise<EvidencePackage>;
}
export interface TargetMapping {
  target_id: string;
  target_key: string;
  status: 'resolved' | 'missing' | 'ambiguous' | 'needs_review';
}
export interface AdapterView {
  summary(targetId: string): void;
  details(targetId: string, trigger: HTMLElement): void;
  reset(): void;
}
/** Host code explicitly supplies elements and trusted read capability. Never discovers DOM or reads values. */
export function mountTargetAdapter(
  root: HTMLElement,
  initialReader: DocumentationReader,
  view: AdapterView,
) {
  if (root.closest('form,button,a,input,textarea,select'))
    throw new Error('INVALID_DOCUMENTATION_ROOT');
  const list = document.createElement('ul');
  list.setAttribute('aria-label', 'Documentation target mappings');
  root.append(list);
  const bindings = new Map<
    string,
    { key: string; element: HTMLElement | null }
  >();
  let mappings: TargetMapping[] = [],
    reader = initialReader,
    generation = 0,
    alive = true;
  let cleanups: (() => void)[] = [];
  const listen = (
    element: HTMLElement,
    event: string,
    callback: EventListener,
  ) => {
    element.addEventListener(event, callback);
    cleanups.push(() => element.removeEventListener(event, callback));
  };
  const state = (mapping: TargetMapping) => {
    const matches = [...bindings.values()].filter(
      (b) => b.key === mapping.target_key && b.element?.isConnected,
    );
    if (
      matches.length > 1 ||
      mappings.filter((m) => m.target_key === mapping.target_key).length > 1
    )
      return { status: 'ambiguous' as const, element: null };
    if (!matches.length || mapping.status === 'missing')
      return { status: 'missing' as const, element: null };
    if (mapping.status !== 'resolved')
      return { status: mapping.status, element: null };
    return { status: 'resolved' as const, element: matches[0]!.element };
  };
  const refresh = () => {
    if (!alive) return;
    cleanups.forEach((cleanup) => cleanup());
    cleanups = [];
    list.replaceChildren();
    generation++;
    view.reset();
    for (const mapping of mappings) {
      const resolved = state(mapping),
        item = document.createElement('li');
      item.textContent = `${mapping.target_key}: ${resolved.status}`;
      if (resolved.element) {
        const element = resolved.element,
          target = mapping.target_id,
          button = document.createElement('button');
        button.type = 'button';
        button.textContent = `Details for ${mapping.target_key}`;
        item.append(' ', button);
        const summary = (event: Event) => {
          if (event.type === 'focusin' && event.target !== event.currentTarget)
            return;
          if (alive && state(mapping).element === element) view.summary(target);
        };
        listen(element, 'pointerenter', summary);
        listen(element, 'focusin', summary);
        listen(button, 'focusin', summary);
        listen(button, 'click', () => {
          if (alive && state(mapping).element === element)
            view.details(target, button);
        });
      }
      list.append(item);
    }
  };
  return {
    register(key: string, element: HTMLElement | null) {
      if (!alive || bindings.size >= 256 || !key || key.length > 128)
        throw new Error('INVALID_REGISTRATION');
      const registration = String(++generation);
      bindings.set(registration, { key, element });
      refresh();
      return () => {
        bindings.delete(registration);
        refresh();
      };
    },
    update(next: TargetMapping[], nextReader: DocumentationReader = reader) {
      if (
        !alive ||
        next.length > 256 ||
        next.some(
          (m) => !m.target_id || !m.target_key || m.target_key.length > 128,
        )
      )
        throw new Error('INVALID_MAPPING');
      mappings = next.map((m) => ({ ...m }));
      reader = nextReader;
      refresh();
    },
    refresh,
    async describe(targetId: string): Promise<EvidencePackage | null> {
      if (
        !alive ||
        !mappings.some(
          (m) => m.target_id === targetId && state(m).status === 'resolved',
        )
      )
        return null;
      const current = generation,
        result = await reader.read(targetId);
      if (!alive || current !== generation) return null;
      if (result.target_id !== targetId)
        throw new Error('INVALID_DOCUMENTATION_RESPONSE');
      return result;
    },
    unmount() {
      if (!alive) return;
      alive = false;
      generation++;
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      bindings.clear();
      list.remove();
      view.reset();
    },
  };
}
export type TargetAdapter = ReturnType<typeof mountTargetAdapter>;
