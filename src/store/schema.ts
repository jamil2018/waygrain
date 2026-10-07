export const STORE_SCHEMA_VERSION = 4;
// Initial migration only. Later schema upgrades require new numbered migrations.
export const initialSchema = `
CREATE TABLE meta (singleton INTEGER PRIMARY KEY CHECK(singleton=1), project_id TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision>=0));
CREATE TABLE migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE apps (id TEXT PRIMARY KEY);
CREATE TABLE scopes (id TEXT PRIMARY KEY, app_id TEXT NOT NULL REFERENCES apps(id), scope_json TEXT NOT NULL, UNIQUE(app_id, scope_json), UNIQUE(id, app_id));
CREATE TABLE records (
  id TEXT PRIMARY KEY, app_id TEXT NOT NULL, scope_id TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('screen','state','control','capture')),
  created_revision INTEGER NOT NULL CHECK(created_revision>0),
  FOREIGN KEY(scope_id,app_id) REFERENCES scopes(id,app_id), UNIQUE(id,app_id,scope_id), UNIQUE(id,kind)
);
CREATE TABLE screens (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL DEFAULT 'screen' CHECK(kind='screen'),
  app_id TEXT NOT NULL, scope_id TEXT NOT NULL, name TEXT NOT NULL, route_template TEXT NOT NULL, view_key TEXT,
  FOREIGN KEY(id,kind) REFERENCES records(id,kind), FOREIGN KEY(id,app_id,scope_id) REFERENCES records(id,app_id,scope_id),
  UNIQUE(app_id,scope_id,view_key), UNIQUE(id,app_id,scope_id)
);
CREATE TABLE states (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL DEFAULT 'state' CHECK(kind='state'), app_id TEXT NOT NULL, scope_id TEXT NOT NULL,
  screen_id TEXT NOT NULL, normalization_version INTEGER NOT NULL, state_hash TEXT NOT NULL, projection_json TEXT NOT NULL,
  FOREIGN KEY(id,kind) REFERENCES records(id,kind), FOREIGN KEY(id,app_id,scope_id) REFERENCES records(id,app_id,scope_id),
  FOREIGN KEY(screen_id,app_id,scope_id) REFERENCES screens(id,app_id,scope_id),
  UNIQUE(screen_id,normalization_version,state_hash), UNIQUE(id,screen_id), UNIQUE(id,app_id,scope_id)
);
CREATE TABLE controls (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL DEFAULT 'control' CHECK(kind='control'), app_id TEXT NOT NULL, scope_id TEXT NOT NULL,
  state_id TEXT NOT NULL, descriptor_path TEXT NOT NULL, descriptor_json TEXT NOT NULL,
  FOREIGN KEY(id,kind) REFERENCES records(id,kind), FOREIGN KEY(id,app_id,scope_id) REFERENCES records(id,app_id,scope_id),
  FOREIGN KEY(state_id,app_id,scope_id) REFERENCES states(id,app_id,scope_id), UNIQUE(state_id,descriptor_path)
);
CREATE TABLE captures (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL DEFAULT 'capture' CHECK(kind='capture'), app_id TEXT NOT NULL, scope_id TEXT NOT NULL,
  screen_id TEXT NOT NULL, state_id TEXT, request_id TEXT NOT NULL, received_at TEXT NOT NULL, captured_at TEXT NOT NULL,
  coverage TEXT NOT NULL CHECK(coverage IN ('complete','partial')), capture_json TEXT NOT NULL, fragment_hash TEXT,
  trace_id TEXT NOT NULL, trace_seq INTEGER NOT NULL, session_id TEXT NOT NULL, tab_id TEXT NOT NULL,
  FOREIGN KEY(id,kind) REFERENCES records(id,kind), FOREIGN KEY(id,app_id,scope_id) REFERENCES records(id,app_id,scope_id),
  FOREIGN KEY(screen_id,app_id,scope_id) REFERENCES screens(id,app_id,scope_id), FOREIGN KEY(state_id,screen_id) REFERENCES states(id,screen_id),
  CHECK((coverage='complete' AND state_id IS NOT NULL AND fragment_hash IS NULL) OR (coverage='partial' AND state_id IS NULL AND fragment_hash IS NOT NULL)),
  UNIQUE(app_id,scope_id,session_id,tab_id,trace_id,trace_seq), UNIQUE(id,app_id,scope_id)
);
CREATE TABLE evidence_links (
  capture_id TEXT NOT NULL, target_id TEXT NOT NULL, app_id TEXT NOT NULL, scope_id TEXT NOT NULL,
  FOREIGN KEY(capture_id,app_id,scope_id) REFERENCES captures(id,app_id,scope_id),
  FOREIGN KEY(target_id,app_id,scope_id) REFERENCES records(id,app_id,scope_id), PRIMARY KEY(capture_id,target_id)
);
CREATE TABLE receipts (
  app_id TEXT NOT NULL REFERENCES apps(id), request_id TEXT NOT NULL, tool TEXT NOT NULL,
  digest TEXT NOT NULL, receipt_json TEXT NOT NULL, PRIMARY KEY(app_id,request_id)
);
CREATE INDEX capture_screen_time ON captures(screen_id,captured_at);
CREATE INDEX record_app_kind ON records(app_id,kind);
CREATE TRIGGER immutable_states BEFORE UPDATE ON states BEGIN SELECT RAISE(ABORT,'immutable'); END;
CREATE TRIGGER immutable_controls BEFORE UPDATE ON controls BEGIN SELECT RAISE(ABORT,'immutable'); END;
CREATE TRIGGER immutable_captures BEFORE UPDATE ON captures BEGIN SELECT RAISE(ABORT,'immutable'); END;
PRAGMA user_version = 1;
`;

// Version 2 rebuilds only the record-kind constraint; child IDs and histories survive.
// Run with foreign_keys disabled outside the transaction and verify before commit.
export const graphMigration = `
CREATE TABLE records_next (
 id TEXT PRIMARY KEY, app_id TEXT NOT NULL, scope_id TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('screen','state','control','capture','action','action_event','transition','flow','test_run','annotation')),
 created_revision INTEGER NOT NULL CHECK(created_revision>0),
 FOREIGN KEY(scope_id,app_id) REFERENCES scopes(id,app_id), UNIQUE(id,app_id,scope_id), UNIQUE(id,kind)
);
INSERT INTO records_next SELECT * FROM records;
DROP TABLE records;
ALTER TABLE records_next RENAME TO records;
CREATE INDEX record_app_kind ON records(app_id,kind);
CREATE TABLE graph_records (
 id TEXT PRIMARY KEY, app_id TEXT NOT NULL, scope_id TEXT NOT NULL, kind TEXT NOT NULL,
 payload_json TEXT NOT NULL, recorded_at TEXT NOT NULL,
 FOREIGN KEY(id,kind) REFERENCES records(id,kind),
 FOREIGN KEY(id,app_id,scope_id) REFERENCES records(id,app_id,scope_id),
 CHECK(kind IN ('action','action_event','transition','flow','test_run','annotation'))
);
CREATE TABLE relations (
 source_id TEXT NOT NULL, target_id TEXT NOT NULL, app_id TEXT NOT NULL, scope_id TEXT NOT NULL,
 type TEXT NOT NULL CHECK(type IN ('contains','offers','transitions_to','part_of','describes')),
 FOREIGN KEY(source_id,app_id,scope_id) REFERENCES records(id,app_id,scope_id),
 FOREIGN KEY(target_id,app_id,scope_id) REFERENCES records(id,app_id,scope_id),
 PRIMARY KEY(source_id,target_id,type)
);
INSERT INTO relations SELECT screen_id,id,app_id,scope_id,'contains' FROM states;
INSERT INTO relations SELECT state_id,id,app_id,scope_id,'contains' FROM controls;
CREATE TABLE identity_aliases (
 id TEXT PRIMARY KEY, from_id TEXT NOT NULL UNIQUE, to_id TEXT NOT NULL,
 app_id TEXT NOT NULL, scope_id TEXT NOT NULL, kind TEXT NOT NULL,
 rationale TEXT NOT NULL, evidence_json TEXT NOT NULL, revision INTEGER NOT NULL,
 FOREIGN KEY(from_id,app_id,scope_id) REFERENCES records(id,app_id,scope_id),
 FOREIGN KEY(to_id,app_id,scope_id) REFERENCES records(id,app_id,scope_id), CHECK(from_id<>to_id)
);
CREATE TRIGGER immutable_graph BEFORE UPDATE ON graph_records BEGIN SELECT RAISE(ABORT,'immutable'); END;
CREATE TRIGGER immutable_aliases BEFORE UPDATE ON identity_aliases BEGIN SELECT RAISE(ABORT,'immutable'); END;
PRAGMA user_version = 2;
`;

// Visibility only; scoped deletion/undo/purge commands belong to Phase E.
export const visibilityMigration = `
CREATE TABLE tombstones (
 record_id TEXT NOT NULL REFERENCES records(id), deletion_batch TEXT NOT NULL,
 revision INTEGER NOT NULL, undone_revision INTEGER,
 PRIMARY KEY(record_id,deletion_batch)
);
CREATE INDEX tombstone_visibility ON tombstones(record_id,undone_revision);
PRAGMA user_version=3;
`;

export const deletionMigration = `
CREATE TABLE deletion_batches (
 id TEXT PRIMARY KEY, app_id TEXT NOT NULL REFERENCES apps(id), scope_id TEXT NOT NULL REFERENCES scopes(id),
 revision INTEGER NOT NULL, record_count INTEGER NOT NULL, undone_revision INTEGER, purged_revision INTEGER
);
PRAGMA user_version=4;
`;
