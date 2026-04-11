import OpenAI from 'openai';

import { env, hasOpenAICredentials } from '../../config/env.js';
import { logger } from '../logging/logger.js';

const client = hasOpenAICredentials()
  ? new OpenAI({
      apiKey: env.openai.apiKey,
      timeout: env.openai.timeoutMs
    })
  : null;

function normalizeText(value) {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim()
    : '';
}

function buildFallbackBrief(text, instruction = '') {
  const cleaned = normalizeText(text);
  const summary = cleaned.length <= 220 ? cleaned : `${cleaned.slice(0, 217)}...`;
  const firstSentence = cleaned.split(/[.!?]/).map((entry) => entry.trim()).find(Boolean) || cleaned;
  const title = firstSentence.length <= 60 ? firstSentence : `${firstSentence.slice(0, 57)}...`;
  const actionSource = instruction || cleaned;
  const actions = actionSource
    .split(/\n|\. /)
    .map((entry) => normalizeText(entry))
    .filter(Boolean)
    .slice(0, 3);

  return {
    title: title || 'Workflow brief',
    summary: summary || 'No input provided.',
    actions: actions.length > 0 ? actions : ['Review the input and decide the next action.'],
    model: 'fallback'
  };
}

function parseBriefResponse(content, fallback) {
  if (!content) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(content);
    const title = normalizeText(parsed.title);
    const summary = normalizeText(parsed.summary);
    const actions = Array.isArray(parsed.actions)
      ? parsed.actions.map((entry) => normalizeText(entry)).filter(Boolean).slice(0, 4)
      : [];

    if (!title || !summary) {
      return fallback;
    }

    return {
      title,
      summary,
      actions: actions.length > 0 ? actions : fallback.actions,
      model: env.openai.model
    };
  } catch {
    return fallback;
  }
}

export async function generateWorkflowBrief({ text, instruction = '' }) {
  const fallback = buildFallbackBrief(text, instruction);

  if (!client) {
    return fallback;
  }

  try {
    const completion = await client.chat.completions.create({
      model: env.openai.model,
      temperature: 0.2,
      max_tokens: Math.min(env.openai.maxTokens + 80, 180),
      response_format: {
        type: 'json_object'
      },
      messages: [
        {
          role: 'system',
          content:
            'You turn raw operations text into compact JSON. Return only JSON with keys title, summary, actions. Keep summary under 220 characters and actions under 4 items.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            instruction: normalizeText(instruction) || 'Create a concise operational brief.',
            text: normalizeText(text)
          })
        }
      ]
    });

    return parseBriefResponse(completion.choices?.[0]?.message?.content, fallback);
  } catch (error) {
    logger.error('automation.text_brief_generation_failed', {
      error: error.message
    });
    return fallback;
  }
}
