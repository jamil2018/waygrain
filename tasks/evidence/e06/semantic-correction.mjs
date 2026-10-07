import test from 'node:test';
import assert from 'node:assert/strict';
import { ingest, changes } from '../../../dist/index.js';
import { storageFixture, fixtureNow } from '../../../tests/fixtures/storage.mjs';
import { traceFixture } from '../../../tests/fixtures/graph.mjs';

test('independent variant comparison is explicit without inventing application outcomes or bypassing budgets',async(t)=>{
 const f=await storageFixture(t);const a=f.request();a.capture.view.feature_variants=[{name:'members',variant:'active'}];const before=ingest(f.store,a,fixtureNow).data;const b=f.request();b.capture.view.feature_variants=[{name:'members',variant:'pending'}];const after=ingest(f.store,b,fixtureNow).data;
 const q={...f.base,mode:'captures',before_capture_id:before.capture_id,after_capture_id:after.capture_id};assert.deepEqual(changes(f.store,q).data,{status:'incomparable',reason:'coverage',changes:[],evidence_ids:[before.capture_id,after.capture_id]});
 const r={...f.base,mode:'revisions',scope:a.capture.scope,from_revision:1,to_revision:2};assert.equal(changes(f.store,r).data.reason,'coverage');for(const request of [q,r])assert.throws(()=>changes(f.store,{...request,budget:{records:1,bytes:1}}),{code:'BUDGET_EXCEEDED'});assert.equal(f.store.revision,2);
 const same=f.request();same.capture.view.feature_variants=[{name:'members',variant:'active'}];same.capture.tree.children[0].enabled=false;const current=ingest(f.store,same,fixtureNow).data;const comparable=changes(f.store,{...q,after_capture_id:current.capture_id});assert.equal(comparable.data.status,'comparable');assert(comparable.data.changes.some(c=>c.subject==='control'&&c.kind==='altered'));assert(comparable.data.changes.every(c=>c.subject!=='outcome'));
});
test('independent action-event revision changes retain observed outcome evidence',async(t)=>{
 const f=await traceFixture(t);f.write([f.action,f.event,f.transition]);const result=changes(f.store,{...f.base,mode:'revisions',scope:f.scope,from_revision:2,to_revision:3});assert.equal(result.data.status,'comparable');assert.equal(result.data.changes.length,1);assert.equal(result.data.changes[0].subject,'outcome');assert.deepEqual(result.data.changes[0].evidence_ids,[f.a.capture_id,f.b.capture_id]);assert.equal(f.store.revision,3);
});
