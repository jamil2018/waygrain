export const STORE_SCHEMA_VERSION = 1;
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
