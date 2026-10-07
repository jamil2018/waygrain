// Fresh installed consumer; no browser download/launch or Phase F plugin claim.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=await mkdtemp('/private/tmp/waygrain-e06-pack-');
const env={...process.env,npm_config_cache:join(root,'npm-cache'),PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:'1'};
const run=(cmd,args,cwd=root)=>execFileSync(cmd,args,{cwd,env,encoding:'utf8',timeout:240000,maxBuffer:1024*1024});
const hash=b=>createHash('sha256').update(b).digest('hex');
try{
 const [pack]=JSON.parse(run('npm',['pack','--json','--silent','--pack-destination',root],resolve('.')));
 const archive=join(root,pack.filename);assert(pack.files.every(f=>/^(dist\/|LICENSE$|README.md$|package.json$)/.test(f.path)));
 await writeFile(join(root,'package.json'),JSON.stringify({private:true,type:'module',dependencies:{waygrain:`file:${archive}`}}));
 run('npm',['install','--ignore-scripts','--no-audit','--no-fund','--prefer-offline']);
 run('npm',['rebuild','better-sqlite3','--offline']);
 const packageRoot=join(root,'node_modules/waygrain');
 const manifest=[];
 for(const file of pack.files.filter(f=>f.path.startsWith('dist/')).sort((a,b)=>a.path.localeCompare(b.path))){
  const bytes=await readFile(join(packageRoot,file.path));assert.deepEqual(bytes,await readFile(resolve(file.path)));manifest.push(file.path+' '+hash(bytes));
 }
 run(process.execPath,['--input-type=module','-e',`import assert from 'node:assert/strict';import {Store,ingest,commit,query,evidence,changes,planRefresh,backup,restore,exportArchive,deleteScope,undoDelete,previewPurge,purge} from 'waygrain';import {contractJsonSchemas} from 'waygrain/contracts';import schemas from 'waygrain/contracts/schemas.json' with {type:'json'};for(const fn of [Store.open,ingest,commit,query,evidence,changes,planRefresh,backup,restore,exportArchive,deleteScope,undoDelete,previewPurge,purge])assert.equal(typeof fn,'function');assert.deepEqual(schemas.tools,contractJsonSchemas());`]);
 env.E06_PACKAGE_DIR=packageRoot;
 const integrated=JSON.parse(run(process.execPath,[resolve('tasks/evidence/e06/integrated.mjs')]));assert.equal(integrated.status,'e06_integrated_passed');assert.equal(integrated.packed,true);
 console.log(JSON.stringify({status:'e06_packed_passed',node:process.version,tarball_sha256:hash(await readFile(archive)),packed_files:pack.files.length,runtime_manifest_sha256:hash(manifest.join('\n')),integrated}));
}finally{await rm(root,{recursive:true,force:true});}
