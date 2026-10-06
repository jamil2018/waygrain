"""A01 document links and task graph checks; no runtime claims."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[3]
plan = (root / "tasks/plan.md").read_text()
todo = (root / "tasks/todo.md").read_text()
rows = re.findall(r"^\| ([A-G]\d{2}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$", plan, re.M)
ids = [row[0] for row in rows]
listed = re.findall(r"^- \[[ x]\] ([A-G]\d{2}) —", todo, re.M)
assert ids == listed and len(ids) == len(set(ids)) == 39
seen = set()
for task_id, title, dependencies, acceptance in rows:
    dependencies = dependencies.strip()
    if "–" in dependencies:
        start, end = dependencies.split("–")
        required = [f"{start[0]}{number:02d}" for number in range(int(start[1:]), int(end[1:]) + 1)]
    else:
        required = re.findall(r"[A-G]\d{2}", dependencies)
    assert set(required) <= seen, (task_id, required)
    assert title.strip() and acceptance.strip()
    seen.add(task_id)
print("PASS: 39 unique tasks match in order; dependencies reference earlier tasks; definitions are nonempty.")
documents = [root / "tasks/plan.md", root / "tasks/todo.md", *sorted((root / "docs").rglob("*.md"))]
for file in documents:
    for link in re.findall(r"\]\(([^)]+)\)", file.read_text()):
        if "://" not in link and not link.startswith("#"):
            assert (file.parent / link.split("#")[0]).exists(), (file, link)
print("PASS: all relative links in plan, register and docs resolve.")
other_tasks = re.findall(r"^- \[[ x]\] ((?!A01)[A-G]\d{2}) — .* — (\w+)$", todo, re.M)
assert len(other_tasks) == 38 and all(status == "pending" for _, status in other_tasks)
assert not (root / "package.json").exists()
print("PASS: A01-only scope; 38 later tasks pending and package bootstrap has not started.")
print("Build/typecheck/runtime tests: NOT APPLICABLE to A01; no package exists before A02.")
