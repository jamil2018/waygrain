// Diagnostic worker: no raw console text, URLs, bodies, input values or screenshots leave it.
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import process from 'node:process';
const root = '/private/tmp/waygrain-f-pilot-20261008';
const { openBrowser } = await import(process.env.WAYGRAIN_DIAGNOSTIC_HMR === '1' ? root + '/engine-diagnostic.mjs' : root + '/node_modules/waygrain/dist/browser/engine.js');
const config = JSON.parse(await readFile(root + '/private/config.json', 'utf8'));
const { alias, ...scope } = config.apps[0].scopes[0];
if (alias !== 'local-admin') throw new Error('INVALID_DIAGNOSTIC_SCOPE');
const errors = []; const failed = {}; const rejected = {}; let consoleErrors = 0; const requested = {};
let owned;
try {
 owned = await openBrowser({ session_id: randomUUID(), page_id: randomUUID(), scope }, () => {});
 owned.page.on('pageerror', (error) => {
  const message = error.message;
  errors.push(/chunk|module|script/i.test(message) ? 'script_or_module_error' : /websocket/i.test(message) ? 'websocket_error' : /hydrat/i.test(message) ? 'hydration_error' : 'unclassified_js_error');
 });
 owned.page.on('console', (entry) => { if (entry.type() === 'error') consoleErrors++; });
 owned.page.on('request', (request) => { const type=request.resourceType(); requested[type]=(requested[type]??0)+1; });
 owned.page.on('requestfailed', (request) => { const type = request.resourceType(); failed[type] = (failed[type] ?? 0) + 1; });
 owned.page.on('response', (response) => { if(response.status()>=400) { const key = response.request().resourceType()+':'+response.status(); rejected[key]=(rejected[key]??0)+1; } });
 await owned.page.goto(scope.origin + '/admin/categories', {waitUntil:'domcontentloaded',timeout:30000});
 await delay(5000);
 const scriptElements = await owned.page.locator('script').count();
 const bootstrap = await owned.page.evaluate(() => ({ready:document.readyState, flight_entries:Array.isArray(self.__next_f)?self.__next_f.length:0, flight_push_modified:Array.isArray(self.__next_f)&&self.__next_f.push!==Array.prototype.push, bootstrap_scripts:Array.isArray(self.__next_s)?self.__next_s.length:0, next_hydrated:!!self.__NEXT_HYDRATED, react_root:!!Object.keys(document).find(k=>k.startsWith('__reactContainer'))}));
 const beforeDialogs = await owned.page.getByRole('dialog').count();
 await owned.page.getByRole('button',{name:'Create',exact:true}).click({timeout:3000});
 await delay(1000);
 const afterDialogs = await owned.page.getByRole('dialog').count();
 process.stdout.write(JSON.stringify({status:'diagnostic_complete',bootstrap,errors,failed,rejected,requested,script_elements:scriptElements,console_errors:consoleErrors,before_dialogs:beforeDialogs,after_dialogs:afterDialogs})+'\n');
} catch {
 process.stdout.write(JSON.stringify({status:'diagnostic_failed',errors,failed,rejected,requested,console_errors:consoleErrors})+'\n');
 process.exitCode = 1;
} finally { if (owned) { try { await owned.browser.close(); } catch { process.stdout.write('{"status":"diagnostic_cleanup_failed"}\n'); process.exitCode=1; } } }
