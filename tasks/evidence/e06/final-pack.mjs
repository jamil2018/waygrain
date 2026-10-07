// Read-only final documentation/archive acceptance; runtime consumer evidence above remains valid.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const root=await mkdtemp('/private/tmp/waygrain-e06-final-pack-');
try{
 const [pack]=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json','--silent','--cache',join(root,'cache'),'--pack-destination',root],{encoding:'utf8',timeout:15000}));
 execFileSync('tar',['-xzf',join(root,pack.filename),'-C',root],{timeout:15000});
 assert.equal(pack.files.length,84);
 async function paths(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?paths(join(dir,e.name)):[join(dir,e.name)]))).flat();}
 const extracted=(await paths(join(root,'package'))).map(p=>p.slice(join(root,'package').length+1)).sort();assert.deepEqual(extracted,pack.files.map(f=>f.path).sort());
 const manifest=[];
 for(const p of extracted.sort((a,b)=>a.localeCompare(b))){assert(/^(dist\/|LICENSE$|README.md$|package.json$)/.test(p));const bytes=await readFile(join(root,'package',p));assert.deepEqual(bytes,await readFile(resolve(p)));if(p.startsWith('dist/'))manifest.push(p+' '+hash(bytes));}
 assert.equal(hash(manifest.join('\n')),'3ed5b5db44b5001fc9a89b33349bd4a910dcfa16e60fbfd5322bb610847f1c12');
 const readme=await readFile(join(root,'package/README.md'),'utf8');assert(readme.includes('Phases A–E (through E06) are verified'));assert(readme.includes('hardware power loss unverified'));
 const metadata=JSON.parse(await readFile(join(root,'package/package.json'),'utf8'));assert.equal(metadata.private,true);assert.equal(metadata.version,'0.0.0');
 console.log(JSON.stringify({status:'e06_final_documentation_pack_passed',node:process.version,archive_sha256:hash(await readFile(join(root,pack.filename))),readme_sha256:hash(readme),runtime_manifest_sha256:hash(manifest.join('\n')),packed_files:pack.files.length}));
}finally{await rm(root,{recursive:true,force:true});}
