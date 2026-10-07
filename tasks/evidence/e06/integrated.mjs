// Independent E06 synthetic checkpoint; optional installed package directory.
import assert from 'node:assert/strict';
import {execFileSync, spawn} from 'node:child_process';
import {mkdtemp,readFile,rm,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';
import {fixtureSettings,fixtureCapture,sensitive} from '../../../tests/fixtures/ui/index.mjs';
const runtime=resolve(process.env.E06_PACKAGE_DIR ?? '.','dist');
const {Store,initializeConfiguration,ingest,commit,query,evidence,changes,planRefresh}=await import(pathToFileURL(join(runtime,'index.js')));
const {contractJsonSchemas}=await import(pathToFileURL(join(runtime,'contracts/index.js')));
assert.deepEqual(JSON.parse(await readFile(join(runtime,'contracts/schemas.json'),'utf8')).tools,contractJsonSchemas());
const root=await mkdtemp('/private/tmp/waygrain-e06-integrated-');
const config=join(root,'private/config.json'),cli=join(runtime,'cli.js');
const now=Date.parse('2026-10-07T00:00:00Z');
let store;
const call=(command,input,extra=[])=>JSON.parse(execFileSync(process.execPath,[cli,command,'--config',config,...extra],{input:input===undefined?undefined:JSON.stringify(input),encoding:'utf8',timeout:15000}));
const hash=b=>createHash('sha256').update(b).digest('hex');
async function stdio(exercise){
 const child=spawn(process.execPath,[cli,'serve','--config',config],{stdio:['pipe','pipe','pipe']});
 const responses=new Map();let diagnostics='',malformed=false;
 child.stderr.on('data',b=>diagnostics+=b);
 const lines=createInterface({input:child.stdout});lines.on('line',l=>{try{const r=JSON.parse(l);responses.set(r.id,r);}catch{malformed=true;}});
 const exit=new Promise(r=>child.once('exit',(code,signal)=>r({code,signal})));
 const timer=setTimeout(()=>child.kill('SIGKILL'),20000);
 let sequence=0;
 async function send(method,params){const id=++sequence;child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');const deadline=Date.now()+5000;while(!responses.has(id)&&Date.now()<deadline&&!malformed&&child.exitCode===null)await new Promise(r=>setTimeout(r,10));assert(!malformed);assert(responses.has(id));return responses.get(id);}
 try{
  const init=await send('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'synthetic-e06',version:'1'}});assert.equal(init.result.serverInfo.name,'waygrain');
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
  const listed=await send('tools/list',{});assert.equal(listed.result.tools.length,13);
  await exercise(async(name,input)=>{const r=await send('tools/call',{name,arguments:input});assert.equal(r.result.isError,undefined);return r.result.structuredContent;});
  child.stdin.end();assert.deepEqual(await exit,{code:0,signal:null});assert.equal(diagnostics,'');
 }finally{clearTimeout(timer);lines.close();if(child.exitCode===null)child.kill('SIGKILL');await exit;}
}
try{
 await initializeConfiguration(config,fixtureSettings());store=await Store.open(config);
 const base={schema_version:1,project_id:store.location.configuration.project_id,app_id:store.location.configuration.apps[0].app_id};
 const request=(id,seq,options={})=>({...base,request_id:id,screen_ref:{kind:'new',name:'Members',view_key:'members'},capture:fixtureCapture({...options,seq})});
 const before=request('e06_before',1),after=request('e06_after',3);before.capture.captured_at=new Date(now-3000).toISOString();after.capture.captured_at=new Date(now-1000).toISOString();after.capture.tree.children[0].enabled=false;after.capture.tree.children[1].enabled=false;
 const a=ingest(store,before,now).data,b=ingest(store,after,now).data,scope=before.capture.scope;
 const existing=id=>({kind:'existing',id}),local=client_ref=>({kind:'local',client_ref});
 const write={...base,request_id:'e06_graph',expected_store_revision:2,operations:[
  {op:'create_action',client_ref:'action',state_id:existing(a.state_id),control_id:existing(a.control_ids[0]),verb:'click',input_schema:{kind:'none',required:false},preconditions:[]},
  {op:'record_action_event',client_ref:'event',event:{action_id:local('action'),before_capture_id:existing(a.capture_id),after_capture_id:existing(b.capture_id),trace_id:before.capture.trace_id,trace_seq:2,session_id:before.capture.session_id,tab_id:before.capture.tab_id,scope,occurred_at:new Date(now-2000).toISOString(),outcome:'success',error_code:null}},
  {op:'create_transition',client_ref:'transition',source_state_id:existing(a.state_id),action_id:local('action'),target_state_id:existing(b.state_id),before_capture_id:existing(a.capture_id),after_capture_id:existing(b.capture_id),action_event_id:local('event'),outcome:'success',guards:[],provenance:'observed'},
  {op:'create_flow',client_ref:'flow',name:'Members',transition_ids:[local('transition')],scope},
 ]};
 write.operations=JSON.parse(JSON.stringify(write.operations));
 const graph=commit(store,write,now);const ids=Object.fromEntries(graph.data.client_refs.map(r=>[r.client_ref,r.id]));
 const viewer=request('e06_viewer',4,{role:'viewer'});ingest(store,viewer,now);
 const search={...base,mode:'search',scope,filters:{},budget:{records:50,bytes:200000}};
 const path={...base,mode:'path',scope,source_state_id:a.state_id,target_state_id:b.state_id,budget:{records:50,bytes:200000}};
 const delta={...base,mode:'captures',before_capture_id:a.capture_id,after_capture_id:b.capture_id,budget:{records:50,bytes:200000}};
 assert.equal(changes(store,delta).data.status,'comparable');assert(changes(store,delta).data.changes.length>0);
 const plan={...base,target_ids:[ids.transition,ids.flow],scope};const rev=store.revision;
 assert(planRefresh(store,plan,now+200000000).data.steps.some(s=>s.minimum_observations==='before_action_after'));assert.equal(store.revision,rev);
 const expected=query(store,search,now).data,expectedPath=query(store,path,now).data;
 assert.equal(expectedPath.status,'complete');assert(expectedPath.records.some(r=>r.id===ids.transition));
 const viewerSearch={...search,scope:viewer.capture.scope};const other=query(store,viewerSearch,now).data;
 const storage=store.location.storageDirectory;store.close();
 const deleted=call('delete-scope',{...base,request_id:'e06_delete',expected_store_revision:rev,scope});
 store=await Store.open(config);assert.equal(query(store,search,now).data.status,'no_matches');assert.deepEqual(query(store,viewerSearch,now).data,other);store.close();
 call('undo-delete',{...base,request_id:'e06_undo',expected_store_revision:deleted.store_revision,deletion_batch:deleted.deletion_batch});
 store=await Store.open(config);assert.deepEqual(query(store,search,now).data,expected);assert.deepEqual(query(store,path,now).data,expectedPath);
 const cursors=[query(store,{...search,budget:{records:1,bytes:8192}},now).next_cursor,evidence(store,{...base,ids:[a.capture_id,b.capture_id],budget:{records:1,bytes:8192}},now).next_cursor,changes(store,{...delta,budget:{records:1,bytes:8192}}).next_cursor];assert(cursors.every(Boolean));
 const fullBefore=query(store,search,now),pathBefore=query(store,path,now);const savedRevision=store.revision;store.close();
 const saved=call('backup'),exported=call('export');assert.equal(saved.store_revision,savedRevision);
 const backupPath=join(storage,`backup-${saved.backup_id}.sqlite`),exportPath=join(storage,`export-${exported.export_id}.json`);
 const backupBytes=await readFile(backupPath),exportBytes=await readFile(exportPath);
 assert.equal(hash(backupBytes),saved.sha256);assert.equal(hash(exportBytes),exported.sha256);
 for(const p of [backupPath,exportPath])assert.equal((await stat(p)).mode&0o777,0o600);
 const archive=JSON.parse(exportBytes);assert.equal(archive.archival_only,true);assert.equal(archive.store_revision,savedRevision);assert.equal(archive.tables.captures.length,3);assert(archive.tables.graph_records.some(r=>r.id===ids.flow));
 for(const marker of Object.values(sensitive)){assert(!exportBytes.includes(Buffer.from(marker)));assert(!backupBytes.includes(Buffer.from(marker)));}
 const del=call('delete-scope',{...base,request_id:'e06_delete2',expected_store_revision:savedRevision,scope});
 const preview=call('purge-preview',{...base,scope});assert.equal(preview.record_count,del.record_count);assert.equal(preview.backups_retain_data,true);assert.equal(call('purge',{...base,scope,preview_token:preview.preview_token}).status,'purged');
 assert.equal(call('query',search).data.status,'no_matches');assert.equal(call('restore',undefined,['--backup',saved.backup_id,'--sha256',saved.sha256]).status,'restored');
 store=await Store.open(config);assert.equal(store.revision,savedRevision);assert.deepEqual(query(store,search,now),fullBefore);assert.deepEqual(query(store,path,now),pathBefore);assert.deepEqual(store.db.pragma('foreign_key_check'),[]);
 for(const [fn,input,cursor] of [[query,{...search,budget:{records:1,bytes:8192}},cursors[0]],[evidence,{...base,ids:[a.capture_id,b.capture_id],budget:{records:1,bytes:8192}},cursors[1]],[changes,{...delta,budget:{records:1,bytes:8192}},cursors[2]]])assert.throws(()=>fn(store,{...input,cursor},now),{code:'CURSOR_STALE'});
 // Obtain new cursors at this restored revision; restoring the same image must invalidate them too.
 const same=query(store,{...search,budget:{records:1,bytes:8192}},now).next_cursor;store.close();call('restore',undefined,['--backup',saved.backup_id,'--sha256',saved.sha256]);store=await Store.open(config);assert.equal(store.revision,savedRevision);assert.throws(()=>query(store,{...search,budget:{records:1,bytes:8192},cursor:same},now),{code:'CURSOR_STALE'});store.close();
 const cliRecall=call('query',path);assert.equal(cliRecall.data.status,'complete');assert.deepEqual(cliRecall.data.records.map(p=>p.id),expectedPath.records.map(p=>p.id));
 await stdio(async(tool)=>{
  assert.equal((await tool('wg_status',base)).store_revision,savedRevision);
  assert.equal((await tool('wg_ingest',before)).data.capture_id,a.capture_id);
  assert.deepEqual((await tool('wg_commit',write)).data,graph.data);
  assert.equal((await tool('wg_query',path)).data.status,'complete');
  const ev=await tool('wg_evidence',{...base,ids:[a.capture_id,b.capture_id],budget:{records:50,bytes:200000}});assert.equal(ev.data.status,'available');assert.equal(ev.data.items.length,2);assert.deepEqual(ev.data.items.map(i=>i.id).sort(),[a.capture_id,b.capture_id].sort());assert(Buffer.byteLength(JSON.stringify(ev))<=200000);
  assert.equal((await tool('wg_changes',delta)).data.status,'comparable');
  assert((await tool('wg_plan_refresh',plan)).data.steps.length>0);
 });
 console.log(JSON.stringify({status:'e06_integrated_passed',node:process.version,packed:!!process.env.E06_PACKAGE_DIR,revision:savedRevision,backup_sha256:saved.sha256,export_sha256:exported.sha256,checks:'graph_changes_refresh_scope_undo_backup_export_privacy_purge_restore_exact_queries_same_revision_cursor_fresh_CLI_MCP_seven_tools'}));
}finally{store?.close();await rm(root,{recursive:true,force:true});}
