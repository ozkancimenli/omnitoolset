// AI-Powered Text Suggestions for PDF Editor
'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/components/Toast';

export interface TextSuggestion {
  text: string;
  confidence: number;
  type: 'grammar' | 'spelling' | 'style' | 'completion';
  replacement?: string;
  explanation?: string;
}

export interface AITextSuggestionsOptions {
  text: string;
  context?: string;
  language?: string;
  enableGrammar?: boolean;
  enableSpelling?: boolean;
  enableStyle?: boolean;
  enableCompletion?: boolean;
}

/**
 * Get AI-powered text suggestions
 * This can be integrated with OpenAI, Anthropic, or other AI services
 */
export const getAITextSuggestions = async (
  options: AITextSuggestionsOptions
): Promise<TextSuggestion[]> => {
  const { text, context, language = 'en', enableGrammar = true, enableSpelling = true, enableStyle = false, enableCompletion = false } = options;

  // TODO: Integrate with actual AI service
  // For now, return mock suggestions based on simple heuristics
  
  const suggestions: TextSuggestion[] = [];

  // Grammar suggestions (simple heuristics)
  if (enableGrammar) {
    // Check for common grammar mistakes
    if (text.includes(' its ') && !text.includes(" it's ")) {
      suggestions.push({
        text: 'its',
        confidence: 0.7,
        type: 'grammar',
        replacement: "it's",
        explanation: 'Consider using "it\'s" (it is) instead of "its" (possessive)',
      });
    }
  }

  // Spelling suggestions (simple heuristics)
  if (enableSpelling) {
    const commonMisspellings: Record<string, string> = {
      'teh': 'the',
      'adn': 'and',
      'taht': 'that',
      'recieve': 'receive',
      'seperate': 'separate',
    };

    for (const [misspelling, correct] of Object.entries(commonMisspellings)) {
      if (text.toLowerCase().includes(misspelling)) {
        suggestions.push({
          text: misspelling,
          confidence: 0.9,
          type: 'spelling',
          replacement: correct,
          explanation: `Did you mean "${correct}"?`,
        });
      }
    }
  }

  // Style suggestions
  if (enableStyle) {
    // Check for passive voice
    if (text.match(/\b(is|are|was|were)\s+\w+ed\b/i)) {
      suggestions.push({
        text: text,
        confidence: 0.6,
        type: 'style',
        explanation: 'Consider using active voice for clearer writing',
      });
    }
  }

  // Text completion (simple word prediction)
  if (enableCompletion && text.length > 0) {
    const lastWord = text.split(' ').pop() || '';
    const commonCompletions: Record<string, string[]> = {
      'th': ['the', 'that', 'this', 'they'],
      'an': ['and', 'any', 'another'],
      'to': ['today', 'together', 'tomorrow'],
    };

    for (const [prefix, completions] of Object.entries(commonCompletions)) {
      if (lastWord.toLowerCase().startsWith(prefix)) {
        completions.forEach(completion => {
          suggestions.push({
            text: lastWord,
            confidence: 0.5,
            type: 'completion',
            replacement: completion,
            explanation: `Complete as "${completion}"?`,
          });
        });
      }
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Apply text suggestion
 */
export const applyTextSuggestion = (
  originalText: string,
  suggestion: TextSuggestion
): string => {
  if (!suggestion.replacement) {
    return originalText;
  }

  // Simple replacement (can be enhanced with regex)
  return originalText.replace(suggestion.text, suggestion.replacement);
};

/**
 * Batch apply suggestions
 */
export const applyTextSuggestions = (
  originalText: string,
  suggestions: TextSuggestion[]
): string => {
  let result = originalText;
  
  suggestions.forEach(suggestion => {
    if (suggestion.replacement) {
      result = applyTextSuggestion(result, suggestion);
    }
  });

  return result;
};

/**
 * Hook for AI text suggestions
 */
export const useAITextSuggestions = () => {
  const [suggestions, setSuggestions] = useState<TextSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (options: AITextSuggestionsOptions) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getAITextSuggestions(options);
      setSuggestions(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get suggestions';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions,
    applySuggestion: applyTextSuggestion,
    applySuggestions: applyTextSuggestions,
  };
};


