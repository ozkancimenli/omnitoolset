import OpenAI from 'openai';

import { logger } from '../../core/logging/logger.js';
import { env, hasOpenAICredentials } from '../../config/env.js';
import {
  buildFallbackReply,
  buildSystemPrompt,
  buildUserPrompt
} from '../../modules/sms_assistant/prompt-builder.js';

const client = hasOpenAICredentials()
  ? new OpenAI({ apiKey: env.openai.apiKey, timeout: env.openai.timeoutMs })
  : null;

function normalizeReply(text, fallback) {
  const cleaned = (text || '')
    .replace(/[*_#`>\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["']|["']$/g, '');

  if (!cleaned) {
    return fallback;
  }

  const looksUnsafe =
    /(?:as an ai|i am an ai|i'm an ai|i am a bot|i'm a bot|assistant:|customer:|http:\/\/|https:\/\/)/i.test(
      cleaned
    );
  const sentenceCount = (cleaned.match(/[.!?](?:\s|$)/g) || []).length;

  if (looksUnsafe || sentenceCount > 2 || cleaned.length > 220) {
    return fallback;
  }

  return cleaned;
}

export async function generateSmsReply({ business, history, plan, customerMessage, safety = {} }) {
  const fallback = buildFallbackReply({ business, plan });

  if (safety.skipModel || !client) {
    return fallback;
  }

  try {
    const completion = await client.chat.completions.create({
      model: env.openai.model,
      temperature: env.openai.temperature,
      max_tokens: env.openai.maxTokens,
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
    logger.error('sms_assistant.openai_reply_generation_failed', {
      error: error.message,
      businessId: business.id,
      planType: plan.type,
      safetyReasons: safety.reasons || []
    });
    return fallback;
  }
}
