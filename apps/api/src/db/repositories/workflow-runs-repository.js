export function createWorkflowRunsRepository(db) {
  return {
    async create({
      workflowKey,
      workflowName,
      triggerSource,
      status = 'running',
      inputPayload = {},
      stepTrace = []
    }) {
      const result = await db.query(
        `
          INSERT INTO workflow_runs (
            workflow_key,
            workflow_name,
            trigger_source,
            status,
            input_payload,
            step_trace
          ) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
          RETURNING *
        `,
        [
          workflowKey,
          workflowName,
          triggerSource,
          status,
          JSON.stringify(inputPayload),
          JSON.stringify(stepTrace)
        ]
      );

      return result.rows[0];
    },

    async complete({ id, status = 'completed', outputPayload = {}, stepTrace = [] }) {
      const result = await db.query(
        `
          UPDATE workflow_runs
          SET
            status = $2,
            output_payload = $3::jsonb,
            step_trace = $4::jsonb,
            completed_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [id, status, JSON.stringify(outputPayload), JSON.stringify(stepTrace)]
      );

      return result.rows[0];
    },

    async fail({ id, errorMessage, stepTrace = [] }) {
      const result = await db.query(
        `
          UPDATE workflow_runs
          SET
            status = 'failed',
            error_message = $2,
            step_trace = $3::jsonb,
            completed_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [id, errorMessage, JSON.stringify(stepTrace)]
      );

      return result.rows[0];
    },

    async listRecent(limit = 20) {
      const result = await db.query(
        `
          SELECT *
          FROM workflow_runs
          ORDER BY created_at DESC
          LIMIT $1
        `,
        [limit]
      );

      return result.rows;
    }
  };
}
