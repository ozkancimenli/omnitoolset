'use client';

import { useEffect, useState } from 'react';

import { apiFetchJson } from '../lib/api-client';

function buildInitialState(workflow) {
  return Object.fromEntries(
    workflow.inputs.map((field) => [field.key, field.type === 'select' ? field.options?.[0] || '' : ''])
  );
}

function findWorkflow(workflows, key) {
  return workflows.find((workflow) => workflow.key === key) || workflows[0];
}

export function WorkflowStudio({ workflows }) {
  const [selectedWorkflowKey, setSelectedWorkflowKey] = useState(workflows[0]?.key || '');
  const [formState, setFormState] = useState(buildInitialState(workflows[0]));
  const [result, setResult] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);

  const selectedWorkflow = findWorkflow(workflows, selectedWorkflowKey);

  useEffect(() => {
    setFormState(buildInitialState(selectedWorkflow));
    setResult(null);
    setError('');
  }, [selectedWorkflow]);

  useEffect(() => {
    let cancelled = false;

    async function loadRuns() {
      setIsLoadingRuns(true);

      try {
        const { payload } = await apiFetchJson('/api/automation/runs?limit=6');

        if (!cancelled) {
          setRecentRuns(payload.runs || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRuns(false);
        }
      }
    }

    loadRuns();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { response, payload } = await apiFetchJson(
        `/api/automation/workflows/${selectedWorkflow.key}/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formState)
        }
      );

      if (!response.ok) {
        throw new Error(payload.error || 'Workflow run failed.');
      }

      setResult(payload.run);
      setRecentRuns((current) => [payload.run, ...current].slice(0, 6));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="studio-grid">
      <section className="panel-card studio-panel">
        <div className="section-copy">
          <p className="eyebrow">Workflow Studio</p>
          <h1>Run a real OmniToolset workflow</h1>
          <p>
            The first MVP ships a lightweight workflow runner with persisted run history and reusable
            tools. Pick a workflow, provide input, and execute it against the live backend.
          </p>
        </div>

        <form className="studio-form" onSubmit={handleSubmit}>
          <label>
            Workflow
            <select
              className="studio-select"
              name="workflow"
              value={selectedWorkflow.key}
              onChange={(event) => setSelectedWorkflowKey(event.target.value)}
            >
              {workflows.map((workflow) => (
                <option key={workflow.key} value={workflow.key}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </label>

          <p className="studio-workflow-summary">{selectedWorkflow.summary}</p>

          {selectedWorkflow.inputs.map((field) => (
            <label key={field.key}>
              {field.label}
              {field.type === 'textarea' ? (
                <textarea
                  name={field.key}
                  placeholder={field.placeholder || ''}
                  required={field.required}
                  value={formState[field.key] || ''}
                  onChange={handleFieldChange}
                />
              ) : field.type === 'select' ? (
                <select
                  className="studio-select"
                  name={field.key}
                  required={field.required}
                  value={formState[field.key] || ''}
                  onChange={handleFieldChange}
                >
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.key}
                  placeholder={field.placeholder || ''}
                  required={field.required}
                  value={formState[field.key] || ''}
                  onChange={handleFieldChange}
                />
              )}
            </label>
          ))}

          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Running workflow...' : 'Run workflow'}
          </button>

          {error ? <p className="studio-error">{error}</p> : null}
        </form>
      </section>

      <div className="studio-side">
        <section className="panel-card studio-result-card">
          <p className="eyebrow">Latest result</p>
          {result ? (
            <>
              <h2>{result.workflowName}</h2>
              <pre>{JSON.stringify(result.output, null, 2)}</pre>
            </>
          ) : (
            <p className="studio-placeholder">
              Run one of the workflows to inspect structured output and persisted run metadata.
            </p>
          )}
        </section>

        <section className="panel-card studio-runs-card">
          <p className="eyebrow">Recent runs</p>
          {isLoadingRuns ? <p className="studio-placeholder">Loading recent runs...</p> : null}
          {!isLoadingRuns && recentRuns.length === 0 ? (
            <p className="studio-placeholder">No workflow runs yet.</p>
          ) : null}
          <div className="run-list">
            {recentRuns.map((run) => (
              <article key={run.id} className="run-card">
                <div className="run-card-top">
                  <strong>{run.workflowName}</strong>
                  <span>{run.status}</span>
                </div>
                <p>{run.completedAt || run.createdAt}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
