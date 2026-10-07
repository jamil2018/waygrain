# Evidence graph and recall

D01 adds `wg_commit` through core, stdio MCP and `waygrain commit --config /absolute/config.json` (JSON request on stdin). It currently accepts annotations, supersession and explicit identity aliases. Other operation kinds remain rejected until their assigned task.

Commits require the current store revision. A batch is atomic; successful writes advance once. Request keys share the existing receipt namespace. Identical sanitized replay returns its original receipt even after a later write; changed payloads conflict. Request-local references resolve earlier operations only; missing/forward references reject the entire batch.

Annotation values and inferred rationales, and alias rationales, must exactly match a whitespace-normalized phrase in an operator-reviewed `allowed_labels` profile. Add reviewed safe descriptions to configuration explicitly; arbitrary free text fails before hashing or persistence. Evidence remains untrusted data. IDs, runner and trace aliases must be nonidentifying operator metadata. No retained text executes or authorizes browser actions.

Observed annotations require direct capture support for their target. Inferred annotations retain their rationale and never become observations. Partial captures can support annotations on that capture only, making the coverage boundary explicit. Contradictory annotations coexist; supersession retains the previous record and must match its target and kind. Structured `wg_evidence` returns annotations, their provenance and cited IDs; summary freshness is unknown rather than a verification claim.

Aliases are audited same-kind, same-app, same-scope links with capture evidence covering both endpoints. Both histories remain intact; self-links, cycles and a second alias for one source fail. Ingestion and stored flows do not silently retarget aliases.

Store schema v2 preserves v1 IDs, revisions, evidence and receipts. Migration requires exclusive coordination authority, takes a private consistent backup of an existing v1 store, rebuilds the record-kind constraint transactionally and checks integrity/foreign keys before commit. The historical v1 schema is unchanged. Migration tests use an actual v1 database; later recovery gates remain separate.
