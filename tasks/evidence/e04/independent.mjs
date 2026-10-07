import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import { ingest, query, Store, deleteScope, undoDelete, previewPurge, purge, backup } from '../../../dist/index.js';
import { storageFixture, fixtureNow } from '../../../tests/fixtures/storage.mjs';
import { fixtureSettings, node } from '../../../tests/fixtures/ui/index.mjs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const ask=(f,scope)=>query(f.store,{...f.base,mode:'search',scope,filters:{},budget:{records:50,bytes:200000}},fixtureNow).data;

test('independent deletion histories replay safely; exclusive purge removes selected content and preserves other scope',async(t)=>{
 const marker='SYNTHETIC_PURGE_LABEL_517';const settings=fixtureSettings();settings.apps[0].redaction_profiles[0].allowed_labels.push(marker);
 const f=await storageFixture(t,settings);const a=f.request();a.capture.tree.children.push(node('button',marker));const first=ingest(f.store,a,fixtureNow);
 const viewer=f.request({role:'viewer'});ingest(f.store,viewer,fixtureNow);const other=ask(f,viewer.capture.scope);const original=ask(f,a.capture.scope);
 const saved=await backup(f.store);const deleteInput={...f.base,scope:a.capture.scope,request_id:'independent_delete1',expected_store_revision:f.store.revision};const d=deleteScope(f.store,deleteInput);assert.deepEqual(deleteScope(f.store,deleteInput),d);assert.equal(ask(f,a.capture.scope).status,'no_matches');assert.deepEqual(ask(f,viewer.capture.scope),other);assert.throws(()=>ingest(f.store,a,fixtureNow),{code:'NOT_FOUND'});
 const uInput={...f.base,request_id:'independent_undo1',expected_store_revision:f.store.revision,deletion_batch:d.deletion_batch};const u=undoDelete(f.store,uInput);assert.deepEqual(undoDelete(f.store,uInput),u);assert.deepEqual(ask(f,a.capture.scope),original);assert.deepEqual(ingest(f.store,a,fixtureNow),first);
 const d2=deleteScope(f.store,{...deleteInput,request_id:'independent_delete2',expected_store_revision:f.store.revision});const preview=previewPurge(f.store,{...f.base,scope:a.capture.scope});assert.equal(preview.record_count,d2.record_count);assert.equal(preview.backups_retain_data,true);
 await assert.rejects(Store.open(f.configPath,'maintenance'),{code:'STORE_BUSY'});const dir=f.store.location.storageDirectory;const dbPath=f.store.location.databasePath;f.store.close();const m=await Store.open(f.configPath,'maintenance');
 try{const result=purge(m,{...f.base,scope:a.capture.scope,preview_token:preview.preview_token});assert.equal(result.storage_reclaimed,true);assert.equal(result.record_count,d2.record_count);assert.deepEqual(m.db.pragma('foreign_key_check'),[]);assert.throws(()=>undoDelete(m,{...uInput,request_id:'afterpurge',expected_store_revision:m.revision,deletion_batch:d2.deletion_batch}),{code:'CONFLICT'});assert.throws(()=>ingest(m,a,fixtureNow),{code:'NOT_FOUND'});}
 finally{m.close();}
 for(const suffix of ['','-wal']){try{assert(!(await readFile(dbPath+suffix)).includes(Buffer.from(marker)));}catch(e){if(e.code!=='ENOENT')throw e;}}
 assert((await readFile(join(dir,`backup-${saved.backup_id}.sqlite`))).includes(Buffer.from(marker)));
 const live=await Store.open(f.configPath);try{const prior=f.store;f.store=live;assert.deepEqual(ask(f,viewer.capture.scope),other);f.store=prior;}finally{live.close();}
});

test('independent stale purge preview and post-write cap refusal are atomic',async(t)=>{
 const f=await storageFixture(t);const r=f.request();ingest(f.store,r,fixtureNow);deleteScope(f.store,{...f.base,scope:r.capture.scope,request_id:'cap_delete',expected_store_revision:f.store.revision});const old=previewPurge(f.store,{...f.base,scope:r.capture.scope});ingest(f.store,f.request({role:'viewer'}),fixtureNow);f.store.close();const m=await Store.open(f.configPath,'maintenance');try{const rev=m.revision;assert.throws(()=>purge(m,{...f.base,scope:r.capture.scope,preview_token:old.preview_token}),{code:'CONFLICT'});assert.equal(m.revision,rev);}finally{m.close();}
 const fresh=await storageFixture(t);ingest(fresh.store,fresh.request(),fixtureNow);const pages=fresh.store.db.pragma('page_count',{simple:true});const pageSize=fresh.store.db.pragma('page_size',{simple:true});const wal=(await stat(fresh.store.location.databasePath+'-wal')).size;const main=(await stat(fresh.store.location.databasePath)).size;
 const configuration=JSON.parse(await readFile(fresh.configPath,'utf8'));configuration.storage_limit_bytes=Math.max(main,pages*pageSize)+wal+32+pages*(pageSize+24)+65536;fresh.store.close();await writeFile(fresh.configPath,JSON.stringify(configuration));fresh.store=await Store.open(fresh.configPath);t.after(()=>fresh.store.close());
 fresh.store.requireStorageCapacity();const rev=fresh.store.revision;const counts=fresh.store.db.prepare('SELECT kind,COUNT(*) n FROM records GROUP BY kind ORDER BY kind').all();const large=fresh.request();large.capture.tree.children=Array.from({length:1000},()=>node('button','Save'));
 assert.throws(()=>ingest(fresh.store,large,fixtureNow),{code:'STORAGE_LIMIT'});assert.equal(fresh.store.revision,rev);assert.deepEqual(fresh.store.db.prepare('SELECT kind,COUNT(*) n FROM records GROUP BY kind ORDER BY kind').all(),counts);assert.equal(fresh.store.db.prepare('SELECT COUNT(*) n FROM receipts').get().n,1);
});

test('independent CLI delete undo preview and purge preserve explicit command boundaries',async(t)=>{
 const f=await storageFixture(t);const r=f.request();ingest(f.store,r,fixtureNow);f.store.close();const cli=fileURLToPath(new URL('../../../dist/cli.js',import.meta.url));const call=(cmd,input)=>JSON.parse(execFileSync(process.execPath,[cli,cmd,'--config',f.configPath],{input:JSON.stringify(input),encoding:'utf8'}));
 const d=call('delete-scope',{...f.base,scope:r.capture.scope,request_id:'cli_del',expected_store_revision:1});assert.equal(d.status,'deleted');const u=call('undo-delete',{...f.base,deletion_batch:d.deletion_batch,request_id:'cli_undo',expected_store_revision:d.store_revision});assert.equal(u.status,'restored');
 call('delete-scope',{...f.base,scope:r.capture.scope,request_id:'cli_del2',expected_store_revision:u.store_revision});const p=call('purge-preview',{...f.base,scope:r.capture.scope});assert(p.record_count>0);const result=call('purge',{...f.base,scope:r.capture.scope,preview_token:p.preview_token});assert.equal(result.status,'purged');assert.equal(result.storage_reclaimed,true);
});
