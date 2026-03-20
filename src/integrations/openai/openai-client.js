import OpenAI from 'openai';

import { env, hasOpenAICredentials } from '../../config/env.js';
import { buildFallbackReply, buildSystemPrompt, buildUserPrompt } from '../../modules/sms_assistant/prompt.js';

const client = hasOpenAICredentials() ? new OpenAI({ apiKey: env.openai.apiKey }) : null;

function normalizeReply(text, fallback) {
  const cleaned = (text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320);

  return cleaned || fallback;
}

export async function generateSmsReply({ business, history, plan, customerMessage }) {
  const fallback = buildFallbackReply({ business, plan });

  if (!client) {
    return fallback;
  }

  try {
    const completion = await client.chat.completions.create({
      model: env.openai.model,
      temperature: env.openai.temperature,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(business)
        },
        {
          role: 'user',
          content: buildUserPrompt({ business, history, plan, customerMessage })
        }
      ]
    });

    return normalizeReply(completion.choices?.[0]?.message?.content, fallback);
  } catch (error) {
    console.error('OpenAI reply generation failed:', error.message);
    return fallback;
  }
}
