CREATE TABLE IF NOT EXISTS workflow_runs (
  id BIGSERIAL PRIMARY KEY,
  workflow_key TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  trigger_source TEXT NOT NULL,
  status TEXT NOT NULL,
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_payload JSONB,
  error_message TEXT,
  step_trace JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS workflow_runs_workflow_key_idx
  ON workflow_runs (workflow_key, created_at DESC);

CREATE INDEX IF NOT EXISTS workflow_runs_status_idx
  ON workflow_runs (status, created_at DESC);
