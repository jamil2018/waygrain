// Actual ephemeral Codex host probe; no raw host logs, commands or invalid final text retained.
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
const root = '/private/tmp/waygrain-f-pilot-20261008';
const cli = '/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex';
const { z } = await import(root+'/node_modules/zod/index.js');
const config=JSON.parse(await readFile(root+'/private/config.json','utf8'));
const {alias: _alias,...scope}=config.apps[0].scopes[0];
const finalSchema=z.strictObject({feature_explanation:z.string().min(1).max(4000),evidence_ids:z.array(z.uuid()).min(1).max(30),observed_times:z.array(z.iso.datetime({offset:true})).min(1).max(30),scope:z.strictObject({environment:z.string(),origin:z.string(),role:z.string(),account_scope:z.string(),locale:z.string()}),provenance:z.enum(['observed','inferred','mixed']),coverage:z.literal('partial'),limitations:z.array(z.string().min(1).max(1000)).min(1).max(12),browser_opened:z.literal(false)});
const allowedTools=new Set(['wg_status','wg_query','wg_evidence','wg_changes','wg_plan_refresh','wg_browser_status']);
const allowedServers=new Set(['waygrain','plugin_waygrain_waygrain']);
const allowedItems=new Set(['reasoning','agent_message','todo_list','mcp_tool_call','command_execution']);
const allowedStatuses=new Set(['in_progress','completed','failed']);
const allowedRead='cat '+root+'/node_modules/waygrain/skills/understand-product/SKILL.md';
const run={run_id:randomUUID(),started_at:new Date().toISOString(),ephemeral:true,tools:[],events:{},stderr_bytes:0,final:null,exit:null,qualification_errors:[]};
const fail=code=>{if(!run.qualification_errors.includes(code))run.qualification_errors.push(code);};
let child,closed,timer,killTimer,lines;
async function stop(){
 if(!child||!closed)return;
 if(child.exitCode===null&&child.signalCode===null){child.kill('SIGTERM');killTimer=setTimeout(()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');},10000);}
 await closed;clearTimeout(killTimer);
}
function allowedCommand(command){
 if(typeof command!=='string')return false;
 if(command===allowedRead)return true;
 const m=/^\/bin\/(?:zsh|bash) -lc (.*)$/.exec(command);if(!m)return false;
 const s=m[1];return s===allowedRead||s==="'"+allowedRead+"'"||s==='"'+allowedRead+'"';
}
function returnedIds(result){
 const ids=new Set();let nodes=0;
 function visit(v){
  if(++nodes>10000){fail('RESULT_AUDIT_LIMIT_EXCEEDED');return;}
  if(typeof v==='string'){
   if(z.uuid().safeParse(v).success)ids.add(v);
   else if(v.length<250000&&/^[\s]*[\[{]/.test(v)){try{visit(JSON.parse(v));}catch{}}
  }else if(Array.isArray(v)){for(const item of v)visit(item);}
  else if(v&&typeof v==='object'){for(const item of Object.values(v))visit(item);}
 }
 visit(result);return [...ids].slice(0,200);
}
try{
 const prompt=await readFile(root+'/recall-prompt.txt','utf8');
 child=spawn(cli,['--no-daemon','--enable','plugins','exec','--ephemeral','--ignore-user-config','--skip-git-repo-check','--sandbox','read-only','--color','never','--json','-C',root,'-c','marketplaces.waygrain-pilot.source_type="local"','-c',`marketplaces.waygrain-pilot.source="${root}"`,'-c','plugins."waygrain@waygrain-pilot".enabled=true','-c','mcp_servers.waygrain.command="/Users/jamil/.nvm/versions/node/v24.20.0/bin/node"','-c',`mcp_servers.waygrain.args=["${root}/node_modules/waygrain/dist/cli.js","serve","--config","${root}/private/config.json"]`,'-c','mcp_servers.waygrain.enabled_tools=["wg_status","wg_query","wg_evidence","wg_changes","wg_plan_refresh","wg_browser_status"]','--output-schema',root+'/recall-schema.json','-'],{env:{...process.env,PATH:'/Users/jamil/.nvm/versions/node/v24.20.0/bin:'+root+'/node_modules/.bin:'+process.env.PATH,WAYGRAIN_CONFIG:root+'/private/config.json'},stdio:['pipe','pipe','pipe']});
 closed=new Promise(resolve=>{child.once('error',()=>{fail('HOST_START_FAILED');resolve({code:null,signal:null});});child.once('close',(code,signal)=>resolve({code,signal}));});
 child.stdin.on('error',()=>fail('HOST_INPUT_FAILED'));child.stdin.end(prompt);
 child.stderr.on('data',b=>{run.stderr_bytes+=b.length;const text=b.toString();run.startup_diagnostics??={};for(const [code,pattern] of [['mcp_diagnostic',/mcp/i],['plugin_diagnostic',/plugin/i],['config_env_missing',/WAYGRAIN_CONFIG/],['startup_failure',/failed|failure|error/i],['unknown_feature',/unknown feature/i]])if(pattern.test(text))run.startup_diagnostics[code]=true;});
 lines=createInterface({input:child.stdout});
 lines.on('line',line=>{
  try{
   const e=JSON.parse(line);if(typeof e.type==='string'&&/^[a-z._]{1,50}$/.test(e.type))run.events[e.type]=(run.events[e.type]??0)+1;
   if(e.type==='thread.started'&&z.uuid().safeParse(e.thread_id).success)run.thread_id=e.thread_id;
   const i=e.item;
   if(i&&(!allowedItems.has(i.type)))fail('PROHIBITED_HOST_ITEM');
   if(i?.type==='mcp_tool_call'){
    const tool=typeof i.tool==='string'&&/^[a-zA-Z0-9_]{1,120}$/.test(i.tool)?i.tool:'unclassified';
    const server=typeof i.server==='string'&&/^[a-zA-Z0-9_-]{1,120}$/.test(i.server)?i.server:'unclassified';
    const status=allowedStatuses.has(i.status)?i.status:'unclassified';
    if(!allowedTools.has(tool)||!allowedServers.has(server))fail('PROHIBITED_MCP_TOOL');
    if(status==='unclassified')fail('UNCLASSIFIED_TOOL_STATUS');
    if(run.tools.length<200)run.tools.push({event:e.type,server,tool,status,returned_ids:e.type==='item.completed'?returnedIds(i.result):[]});else fail('AUDIT_LIMIT_EXCEEDED');
   }
   if(i?.type==='command_execution'){
    const allowed=allowedCommand(i.command);if(!allowed)fail('PROHIBITED_SHELL_COMMAND');
    if(run.tools.length<200)run.tools.push({event:e.type,tool:'shell',command_class:allowed?'exact_packaged_skill_read':'prohibited',status:allowedStatuses.has(i.status)?i.status:'unclassified'});else fail('AUDIT_LIMIT_EXCEEDED');
   }
   if(e.type==='item.completed'&&i?.type==='agent_message'){
    run.final=null;
    try{
     const v=finalSchema.safeParse(JSON.parse(i.text));
     if(v.success&&isDeepStrictEqual(v.data.scope,scope))run.final=v.data;
    }catch{}
    if(!run.final)run.discarded_agent_messages=(run.discarded_agent_messages??0)+1;
   }
  }catch{fail('UNCLASSIFIED_HOST_EVENT');}
 });
 timer=setTimeout(()=>{fail('HOST_TIMEOUT');void stop();},300000);
 run.exit=await closed;
 if(!run.final)fail('NO_VALID_FINAL');
 if(run.final&&!run.final.evidence_ids.every(id=>run.tools.some(t=>t.returned_ids?.includes(id))))fail('FINAL_CITES_UNRETRIEVED_IDS');
 if(!['wg_status','wg_query','wg_evidence'].every(tool=>run.tools.some(t=>t.tool===tool&&t.status==='completed')))fail('REQUIRED_NATIVE_READS_MISSING');
 if(run.exit.code!==0)fail('HOST_NONZERO_EXIT');
}catch{fail('RECALL_HOST_PROBE_FAILED');await stop();}
finally{clearTimeout(timer);clearTimeout(killTimer);lines?.close();}
run.finished_at=new Date().toISOString();
if(run.qualification_errors.length)run.final=null;
try{await writeFile(root+'/recall-host-receipt-'+run.run_id+'.json',JSON.stringify(run,null,2)+'\n',{mode:0o600});process.stdout.write(JSON.stringify(run)+'\n');}catch{process.stdout.write('{"status":"RECALL_RECEIPT_FAILED"}\n');process.exitCode=1;}
if(run.qualification_errors.length)process.exitCode=1;
