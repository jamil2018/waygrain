import { html as baseHtml, settings, facts } from '../g07/fixture.mjs';
export { settings, facts };
export function html(options) {
  const rendered = baseHtml(options);
  return options.discrepancy &&
    options.screen === 'settings' &&
    options.role === 'viewer'
    ? rendered.replace(
        '<button disabled>Save</button>',
        '<button >Save</button>',
      )
    : rendered;
}
