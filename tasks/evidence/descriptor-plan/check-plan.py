#!/usr/bin/env python3
"""Planning-only consistency and preservation checks; no runtime qualification."""
from pathlib import Path
import hashlib,json,re
root=Path(__file__).resolve().parents[3]
errors=[]
def check(ok,msg):
 if not ok: errors.append(msg)
manifest=json.loads((root/'tasks/evidence/descriptor-plan/preserved-inputs.json').read_text())
for p,h in manifest.items():
 check((root/p).is_file() and hashlib.sha256((root/p).read_bytes()).hexdigest()==h, 'Preservation changed: '+p)
a=root/'tasks/history/2026-10-16-v0.2'
for p,h in json.loads((a/'manifest.json').read_text()).items():
 check((a/p).is_file() and hashlib.sha256((a/p).read_bytes()).hexdigest()==h, 'Archive mismatch: '+p)
s=(root/'tasks/todo.md').read_text()
rows=re.findall(r'^\| (W\d{2}) \| ([A-D]) \| (.*?) \| (.*?) \| (.*?) \|$',s,re.M)
expected=[f'W{i:02}' for i in range(24)]
check([r[0] for r in rows]==expected,'Queue IDs/order')
check(re.findall(r'^### (W\d{2}) —',s,re.M)==expected,'Definition IDs/order')
seen=set()
for id,phase,title,deps,status in rows:
 check(status=='pending',id+' must remain unstarted')
 for d in re.findall(r'W\d{2}',deps): check(d in seen,id+' invalid dependency '+d)
 body=s.split('### '+id+' —',1)[1].split('\n### ',1)[0]
 check('**Dependencies:** '+deps+'.' in body,id+' dependency mismatch')
 check(body.count('- [ ] ')==3,id+' acceptance count')
 check('**Verification:**' in body and '**Likely areas:**' in body,id+' missing execution details')
 seen.add(id)
paths=['tasks/plan.md','tasks/todo.md','docs/decisions/004-standalone-app-descriptor.md','docs/README.md','CONTRIBUTING.md','README.md']
# Planned deliverable paths in prose are not links; all actual local links must resolve.
for rel in paths:
 p=root/rel
 for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if re.match(r'[a-z]+:',link) or link.startswith('#'): continue
  check((p.parent/link.split('#')[0]).exists(),rel+' unresolved link '+link)
check('## Historical specification' not in (root/'docs/specification-v0.3.md').read_text(),'Snapshot includes historical conflicting section')
check(json.loads((root/'docs/specification-v0.3-source.json').read_text())['source_sequence']==3,'Source revision')
if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: 24 pending tasks, acyclic ordered dependencies, 72 acceptance items, local links, {len(manifest)} protected files and exact prechange archive. Planning only; runtime untested.')
