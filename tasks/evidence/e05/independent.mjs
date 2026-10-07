import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { readdir } from 'node:fs/promises';
import { Store, ingest } from '../../../dist/index.js';
import { storageFixture, fixtureNow } from '../../../tests/fixtures/storage.mjs';
const Sqlite=createRequire(import.meta.url)('better-sqlite3');
const path=fileURLToPath(new URL('./child.mjs',import.meta.url));
function child(mode,config){const c=fork(path,[mode,config],{stdio:['ignore','ignore','pipe','ipc']});c.timer=setTimeout(()=>c.kill('SIGKILL'),10000);c.on('exit',()=>clearTimeout(c.timer));return c;}
function message(c,type){return new Promise((resolve,reject)=>{c.once('error',reject);c.on('message',m=>{if(m.type===type)resolve(m);if(m.type==='failed')reject(new Error(m.code));});c.once('exit',code=>{if(code!==0)reject(new Error(`child exited ${code}`));});});}
function end(c){return new Promise(resolve=>c.once('exit',(code,signal)=>resolve({code,signal})));}
test('independent competing processes serialize ingestion without partial graph or revision loss',async(t)=>{
 const f=await storageFixture(t);const children=Array.from({length:4},()=>child('writer',f.configPath));t.after(()=>children.forEach(c=>c.kill()));await Promise.all(children.map(c=>message(c,'ready')));
 const results=children.map(c=>message(c,'done'));const exits=children.map(end);children.forEach((c,i)=>{const r=f.request();r.request_id=`independent_writer_${i}`;r.capture.trace_id=`independent_trace_${i}`;c.send(r);});const done=await Promise.all(results);await Promise.all(exits);assert.equal(done.length,4);assert.equal(f.store.revision,4);assert.equal(f.store.db.prepare('SELECT COUNT(*) n FROM captures').get().n,4);assert.equal(f.store.db.prepare('SELECT COUNT(*) n FROM screens').get().n,1);assert.deepEqual(f.store.db.pragma('foreign_key_check'),[]);
});
test('independent SIGKILL during uncommitted write preserves original revision',async(t)=>{
 const f=await storageFixture(t);ingest(f.store,f.request(),fixtureNow);const c=child('transaction',f.configPath);t.after(()=>c.kill());await message(c,'uncommitted_write');const exited=end(c);c.kill('SIGKILL');assert.equal((await exited).signal,'SIGKILL');assert.equal(f.store.revision,1);assert.equal(f.store.db.prepare('SELECT COUNT(*) n FROM captures').get().n,1);assert.equal(f.store.db.pragma('quick_check',{simple:true}),'ok');
});
test('independent SIGKILL during actual v3 migration leaves old data and consistent prebackup',async(t)=>{
 const f=await storageFixture(t);ingest(f.store,f.request(),fixtureNow);const dbPath=f.store.location.databasePath;const dir=f.store.location.storageDirectory;f.store.close();const setup=new Sqlite(dbPath);setup.exec('DROP TABLE deletion_batches; DELETE FROM migrations WHERE version=4; PRAGMA user_version=3;');setup.close();
 const c=child('migration',f.configPath);t.after(()=>c.kill());await message(c,'uncommitted_migration');const exited=end(c);c.kill('SIGKILL');assert.equal((await exited).signal,'SIGKILL');
 const before=new Sqlite(dbPath);try{assert.equal(before.pragma('user_version',{simple:true}),3);assert.equal(before.prepare('SELECT revision FROM meta').get().revision,1);assert.equal(before.prepare('SELECT COUNT(*) n FROM captures').get().n,1);assert.equal(before.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE name='deletion_batches'").get().n,0);assert.deepEqual(before.pragma('foreign_key_check'),[]);}finally{before.close();}
 const backups=(await readdir(dir)).filter(p=>p.startsWith('pre-migration-v3-')&&p.endsWith('.sqlite'));assert.equal(backups.length,1);const old=new Sqlite(dir+'/'+backups[0]);try{assert.equal(old.pragma('quick_check',{simple:true}),'ok');assert.equal(old.pragma('user_version',{simple:true}),3);assert.equal(old.prepare('SELECT revision FROM meta').get().revision,1);}finally{old.close();}
 const recovered=await Store.open(f.configPath);try{assert.equal(recovered.db.pragma('user_version',{simple:true}),4);assert.equal(recovered.revision,1);}finally{recovered.close();}
});
