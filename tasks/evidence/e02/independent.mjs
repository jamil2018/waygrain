import test from 'node:test';
import assert from 'node:assert/strict';
import { ingest, query, planRefresh } from '../../../dist/index.js';
import { storageFixture, fixtureNow } from '../../../tests/fixtures/storage.mjs';
import { traceFixture, local, existing } from '../../../tests/fixtures/graph.mjs';
import { randomUUID } from 'node:crypto';
import { probeStdio } from '../../../scripts/protocol-probe.mjs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ask=(f,id,now,scope)=>query(f.store,{...f.base,mode:'search',scope,filters:{ids:[id]},budget:{records:20,bytes:65536}},now).data.records[0];
test('independent freshness survives many partials, old arrivals and read/replay',async(t)=>{
 const f=await storageFixture(t);
 const r=f.request();r.capture.captured_at=new Date(fixtureNow-200000000).toISOString();
 const a=ingest(f.store,r,fixtureNow).data;
 for(let i=0;i<60;i++){const p=f.request();p.capture.coverage={kind:'partial',subtree:'root',reason:'truncated'};ingest(f.store,p,fixtureNow);}
 const s=ask(f,a.screen_id,fixtureNow,r.capture.scope);
 assert.equal(s.evidence.freshness.last_checked_at,r.capture.captured_at);
 assert.equal(Date.parse(s.evidence.freshness.observed_at),fixtureNow);
 assert.equal(s.evidence.freshness.status,'stale');
 assert.equal(s.evidence.freshness.application_version,null);
 const q={...f.base,target_ids:[a.state_id,a.screen_id],scope:r.capture.scope};
 const rev=f.store.revision;assert.equal(planRefresh(f.store,q,fixtureNow).data.steps.length,2);assert.equal(f.store.revision,rev);
 ingest(f.store,r,fixtureNow);assert.equal(ask(f,a.state_id,fixtureNow,r.capture.scope).evidence.freshness.last_checked_at,r.capture.captured_at);
 const fresh=f.request();ingest(f.store,fresh,fixtureNow);
 const old=f.request();old.capture.captured_at=new Date(fixtureNow-100000000).toISOString();ingest(f.store,old,fixtureNow);
 assert.equal(ask(f,a.state_id,fixtureNow,r.capture.scope).evidence.freshness.last_checked_at,fresh.capture.captured_at);
 assert.equal(planRefresh(f.store,q,fixtureNow).data.steps.length,0);
});
test('independent flow plans retain historical view and cannot refresh original trace',async(t)=>{
 const f=await traceFixture(t);
 const c=f.write([f.action,f.event,f.transition,{op:'create_flow',client_ref:'flow',name:'Members',transition_ids:[local('transition')],scope:f.scope}]);
 const ids=Object.fromEntries(c.data.client_refs.map(r=>[r.client_ref,r.id]));
 const later=fixtureNow+200000000;
 const newer=f.request({tab:'pending',modal:true});newer.capture.trace_seq=4;newer.capture.captured_at=new Date(later).toISOString();ingest(f.store,newer,later);
 const tr=ask(f,ids.transition,later,f.scope);assert.equal(tr.evidence.freshness.status,'stale');assert.equal(tr.evidence.freshness.last_checked_at,f.after.capture.captured_at);
 const flow=ask(f,ids.flow,later,f.scope);assert.equal(flow.evidence.freshness.last_checked_at,f.before.capture.captured_at);
 const q={...f.base,target_ids:[ids.flow,ids.transition],scope:f.scope};
 const rev=f.store.revision;const plan=planRefresh(f.store,q,later);assert.equal(plan.data.steps.length,1);
 assert.deepEqual(plan.data.steps[0].expected_view,f.before.capture.view);assert.equal(plan.data.steps[0].minimum_observations,'before_action_after');assert.equal(f.store.revision,rev);
 const capped=planRefresh(f.store,{...q,target_ids:[f.a.state_id,ids.transition,randomUUID()],step_budget:1},later);assert.equal(capped.data.complete,false);assert(capped.data.unresolved_ids.length);
 assert.throws(()=>planRefresh(f.store,{...q,scope:{...f.scope,role:'viewer'}},later),{code:'INCOMPATIBLE_CAPTURE'});
});
test('independent CLI and stdio return the same declarative plan',async(t)=>{
 const f=await storageFixture(t);const cli=fileURLToPath(new URL('../../../dist/cli.js',import.meta.url));let request;
 await probeStdio(cli,f.configPath,async(send)=>{const a=await send(10,'tools/call',{name:'wg_ingest',arguments:f.request()});request={...f.base,target_ids:[a.result.structuredContent.data.state_id],scope:f.request().capture.scope,max_age_seconds:0};const r=await send(11,'tools/call',{name:'wg_plan_refresh',arguments:request});assert.equal(r.result.structuredContent.data.steps.length,1);assert.equal(r.result.structuredContent.store_revision,1);assert.equal(r.result.structuredContent.data.steps[0].minimum_observations,'complete_state');});
 const output=JSON.parse(execFileSync(process.execPath,[cli,'refresh-plan','--config',f.configPath],{input:JSON.stringify(request),encoding:'utf8'}));assert.equal(output.data.steps.length,1);assert.equal(output.store_revision,1);
});

test('independent mixed ISO precision orders actual observation instants',async(t)=>{
 const f=await storageFixture(t);const old=f.request();const a=ingest(f.store,old,fixtureNow).data;
 const later=f.request();later.capture.captured_at=new Date(fixtureNow+500).toISOString();ingest(f.store,later,fixtureNow+1000);
 for(const id of [a.screen_id,a.state_id,a.control_ids[0]])assert.equal(Date.parse(ask(f,id,fixtureNow+1000,old.capture.scope).evidence.freshness.last_checked_at),fixtureNow+500);
});

test('independent test-verified flow refresh retains flow assertion requirements',async(t)=>{
 const f=await traceFixture(t);
 const c=f.write([f.action,f.event,f.transition,{op:'create_flow',client_ref:'flow',name:'Members',transition_ids:[local('transition')],scope:f.scope},{op:'record_test_run',run:{runner:'Members',runner_version:'Members',application_version:'Members',scope:f.scope,started_at:new Date(fixtureNow-4000).toISOString(),finished_at:new Date(fixtureNow).toISOString(),outcome:'passed',assertions:[{target_id:local('flow'),assertion:'Members',result:'passed',evidence_ids:[local('event')]}]}}]);
 const flow=c.data.client_refs.find(r=>r.client_ref==='flow').id;
 assert.equal(ask(f,flow,fixtureNow+200000000,f.scope).evidence.provenance,'test_verified');
 const plan=planRefresh(f.store,{...f.base,target_ids:[flow],scope:f.scope},fixtureNow+200000000);
 assert(plan.data.steps.some(s=>s.target_id===flow && s.minimum_observations==='passed_assertion'));
 const capped=planRefresh(f.store,{...f.base,target_ids:[flow],scope:f.scope,step_budget:1},fixtureNow+200000000);assert.equal(capped.data.complete,false);assert(capped.data.unresolved_ids.includes(flow));
 const annotation={target_id:existing(flow),kind:'description',value:'Members',author_type:'agent',evidence_ids:[existing(f.a.capture_id),existing(f.b.capture_id)],scope:f.scope,provenance:'observed'};
 f.write([{op:'add_annotation',annotation},{op:'add_annotation',annotation:{...annotation,value:'Fixture'}}]);
 const conflicted=planRefresh(f.store,{...f.base,target_ids:[flow],scope:f.scope},fixtureNow+200000000);assert(conflicted.data.steps.some(s=>s.target_id===flow && s.prerequisites.includes('resolve_conflicting_annotations')));
});
