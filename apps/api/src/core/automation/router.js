import { Router } from 'express';

import { asyncHandler } from '../http/async-handler.js';

function normalizeLimit(value, fallback = 20) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), 50);
}

export function createAutomationRouter({ service }) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      res.json({
        ok: true,
        ...service.getOverview()
      });
    })
  );

  router.get(
    '/workflows',
    asyncHandler(async (_req, res) => {
      res.json({
        ok: true,
        workflows: service.listWorkflows()
      });
    })
  );

  router.get(
    '/runs',
    asyncHandler(async (req, res) => {
      const runs = await service.listRuns(normalizeLimit(req.query.limit));
      res.json({
        ok: true,
        runs
      });
    })
  );

  router.post(
    '/workflows/:workflowKey/run',
    asyncHandler(async (req, res) => {
      try {
        const run = await service.runWorkflow(req.params.workflowKey, req.body || {}, {
          triggerSource: 'manual'
        });

        res.status(201).json({
          ok: true,
          run
        });
      } catch (error) {
        res.status(error.statusCode || 500).json({
          ok: false,
          error: error.message,
          run: error.run || null
        });
      }
    })
  );

  return router;
}
