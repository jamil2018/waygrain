# Local descriptor import

Use the authoring address printed by `npm run demo:descriptor`, or **Edit documentation** in the local application. Imports use synthetic product knowledge. The reader endpoint cannot import.

## Markdown, text, observations and supplied code

Select a page/component description first; its displayed role, version, tenant and state are the import assignment. Fill the title, origin/reference, precise locator and selected excerpt (up to 4 KiB in UTF-8). Paste Markdown as text; markup and instructions remain inert.

Choose **Documented source**, **Recorded observation**, or **Supplied code, requires verification**. Observations require an observation identity and represent only the supplied behavior/state. Code requires the exact supplied revision and symbol. Importing code creates an inferred, unknown claim with no verification method; it cannot create code-verified evidence automatically.

**Preview import** validates the complete candidate and displays the selected text while the saved revision stays unchanged. **Commit validated import** writes the previewed candidate once. Editing the import fields or selected description discards the preview. A concurrent save makes the candidate stale; reload and preview again. An imported excerpt receives a new stable source identity and a linked claim. Existing source replacement uses an explicit versioned JSON bundle so earlier evidence remains intact.

## JSON bundles

The editor's advanced section shows the complete bundle, including identities and provenance. JSON import accepts that bundle shape. Retain the current project/app identities. Use a new bundle `revision_id` and set `supersedes_revision_id` to the current saved bundle revision. Modified source/claim/document records likewise need new revision identities linked to their exact predecessors; unchanged records keep their identities. Claim source references must match the retained source revision, content hash and locator. Create IDs with UUIDs; do not reuse an ID for another record type or app.

This minimal schema example illustrates the envelope; use the current workspace's identities and complete entity arrays from the editor rather than replacing a populated bundle with empty arrays:

```json
{
  "schema_version": 1,
  "project_id": "00000000-0000-4000-8000-000000000001",
  "app_id": "00000000-0000-4000-8000-000000000002",
  "revision_id": "00000000-0000-4000-8000-000000000003",
  "supersedes_revision_id": null,
  "targets": [],
  "sources": [],
  "claims": [],
  "documents": [],
  "mappings": []
}
```

Each target is a page or component with a stable ID/key and an explicit parent page for components. Documents assign a target, exact scope, structured fields and claim IDs. Sources retain title/origin/excerpt/hash/revision/locator. Claims retain their evidence class, source references, confidence reason, unknown/conflict/freshness state and any explicit verification. Mappings assign target keys and visible resolution status. The advanced editor supplies complete examples of all five collections; empty documentation fields remain empty.

The JSON importer validates dangling or cross-project references, duplicate identities, unsupported schema versions, payload limits, provenance and predecessor links before writing. Older candidates never overwrite newer revisions. Errors show sanitized codes, not imported bodies. Current JSON requests are bounded to 1 MiB and 256 entities per collection; source excerpts elsewhere in the schema are bounded to 16 KiB. A JSON bundle can preserve supplied prior verification with its exact source/revision/method, but importing it is not a new verification of the application.

For programmatic local authoring, the author endpoint accepts `POST /api/import/preview` with `{ "kind": "bundle", "candidate": { "schema_version": 1, "expected_revision": 1, "bundle": {} } }` using the complete bundle in place of `{}`. The response contains the validated candidate and a revision/digest receipt. Submit both unchanged to `POST /api/import/commit`. Both require the author origin and `application/json`; neither endpoint is available on the read service. The receipt detects changed candidates; normal author authorization, full validation and transactional revision checks still apply at commit.

Public release remains HOLD. This is a local fixture workflow, not production authentication or a general source-verification service.
