import test from 'node:test';
import assert from 'node:assert/strict';
import { ingest, changes } from '../../../dist/index.js';
import { storageFixture, fixtureNow } from '../../../tests/fixtures/storage.mjs';
import { traceFixture, local, existing } from '../../../tests/fixtures/graph.mjs';
import { probeStdio } from '../../../scripts/protocol-probe.mjs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('independent CLI and stdio comparison agree with public core', async (t) => {
  const f = await storageFixture(t);
  const cli = fileURLToPath(new URL('../../../dist/cli.js', import.meta.url));
  let comparison;
  await probeStdio(cli, f.configPath, async (send) => {
    const a = await send(10, 'tools/call', {name:'wg_ingest',arguments:f.request()});
    const r = f.request(); r.capture.tree.children=[];
    const b = await send(11, 'tools/call', {name:'wg_ingest',arguments:r});
    comparison = {...f.base,mode:'captures',before_capture_id:a.result.structuredContent.data.capture_id,after_capture_id:b.result.structuredContent.data.capture_id};
    const c = await send(12,'tools/call',{name:'wg_changes',arguments:comparison});
    assert.deepEqual(c.result.structuredContent,changes(f.store,comparison));
    assert.equal(c.result.isError,undefined);
  });
  const output=JSON.parse(execFileSync(process.execPath,[cli,'changes','--config',f.configPath],{input:JSON.stringify(comparison),encoding:'utf8'}));
  assert.deepEqual(output,changes(f.store,comparison));
});

test('independent compatibility, complete/partial, ordered controls and revision budget', async (t) => {
  const f = await storageFixture(t);
  const before = f.request();
  const a = ingest(f.store, before, fixtureNow).data;
  const after = f.request();
  after.capture.tree.children.reverse();
  const b = ingest(f.store, after, fixtureNow).data;
  const q = {...f.base, mode: 'captures', before_capture_id: a.capture_id, after_capture_id: b.capture_id};
  const changed = changes(f.store, q);
  assert(changed.data.changes.some(c => c.kind === 'altered'));
  assert.equal(changed.data.complete, true);
  assert(changed.data.invalidated_ids.includes(a.state_id));
  assert.deepEqual(changes(f.store, {...q, after_capture_id:a.capture_id}).data.changes, []);
  const partial = f.request();
  partial.capture.coverage = {kind:'partial',subtree:'root',reason:'truncated'};
  partial.capture.tree.children=[];
  const p=ingest(f.store,partial,fixtureNow).data;
  const pc=changes(f.store,{...q,after_capture_id:p.capture_id});
  assert.equal(pc.data.complete,false);
  assert(pc.data.changes.some(c=>c.kind==='not_seen'));
  assert(pc.data.changes.every(c=>c.kind!=='removed'));
  // Synthetic legacy-normalizer fixture only; restore trigger after mutation.
  f.store.db.exec('DROP TRIGGER immutable_states');
  f.store.db.prepare('UPDATE states SET normalization_version=2 WHERE id=?').run(b.state_id);
  f.store.db.exec("CREATE TRIGGER immutable_states BEFORE UPDATE ON states BEGIN SELECT RAISE(ABORT,'immutable'); END;");
  assert.equal(changes(f.store,q).data.reason,'normalization_version');
  const revisions={...f.base,mode:'revisions',scope:before.capture.scope,from_revision:1,to_revision:2,budget:{records:1,bytes:1}};
  assert.throws(()=>changes(f.store,revisions),{code:'BUDGET_EXCEEDED'});
  assert.equal(f.store.revision,3);
});

test('independent graph invalidations, annotation history, cursor binding and bytes', async (t)=>{
  const f=await traceFixture(t);
  const result=f.write([f.action,f.event,f.transition,{op:'create_flow',client_ref:'flow',name:'Members',transition_ids:[local('transition')],scope:f.scope}]);
  const ids=Object.fromEntries(result.data.client_refs.map(r=>[r.client_ref,r.id]));
  const q={...f.base,mode:'captures',before_capture_id:f.a.capture_id,after_capture_id:f.b.capture_id};
  const c=changes(f.store,q);
  for(const id of [f.a.state_id,ids.action,ids.transition,ids.flow]) assert(c.data.invalidated_ids.includes(id));
  const from=f.store.revision;
  const annotation={target_id:existing(f.a.state_id),kind:'description',value:'Members',author_type:'agent',evidence_ids:[existing(f.a.capture_id)],scope:f.scope,provenance:'observed'};
  const first=f.write([{op:'add_annotation',client_ref:'annotation',annotation}]);
  const old=first.data.client_refs.find(r=>r.client_ref==='annotation').id;
  f.write([{op:'supersede_annotation',supersedes_id:existing(old),annotation:{...annotation,value:'Fixture'}}]);
  const r={...f.base,mode:'revisions',scope:f.scope,from_revision:from,to_revision:f.store.revision,budget:{records:1,bytes:8192}};
  const page=changes(f.store,r);
  assert.equal(page.data.changes[0].subject,'annotation');
  assert(page.next_cursor);
  const next=changes(f.store,{...r,cursor:page.next_cursor});
  assert.equal(next.data.changes[0].kind,'altered');
  assert.equal(next.data.changes[0].before_id,old);
  assert.throws(()=>changes(f.store,{...r,from_revision:from+1,cursor:page.next_cursor}),{code:'INVALID_INPUT'});
  for(const bytes of [1,100,400,8192]){
    try {const bounded=changes(f.store,{...q,budget:{records:1,bytes}});assert(Buffer.byteLength(JSON.stringify(bounded))<=bytes);}
    catch(error){assert.equal(error.code,'BUDGET_EXCEEDED');}
  }
  assert.equal(f.store.revision,r.to_revision);
});
