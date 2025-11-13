/**
 * AI Analyzer
 * Handles reflection analysis using Gemini API with retry logic
 */

import { getGeminiModel } from './gemini-client';
import { getPromptForAnalysis, PromptVariables } from './prompt-loader';
import { AIFeedback } from '@/types/ai';
import { retryWithBackoff, isRetryableError } from '@/lib/utils/retry';
import { logInfo, logError, logWarn } from '@/lib/utils/logger';

const ANALYSIS_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Parse JSON response from Gemini API
 * Handles various response formats and extracts JSON
 */
function parseGeminiResponse(responseText: string): AIFeedback {
  try {
    // Try to find JSON in the response
    // Gemini might wrap JSON in markdown code blocks
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : responseText;

    const parsed = JSON.parse(jsonText.trim());

    // Validate required fields
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Missing or invalid summary field');
    }

    return {
      summary: parsed.summary,
      risks: parsed.risks || '',
      actions: parsed.actions || '',
    };
  } catch (error) {
    logError('Failed to parse Gemini response as JSON', error as Error, {
      responseText: responseText.substring(0, 200),
    });

    // Fallback: try to extract meaningful content
    return {
      summary: responseText.substring(0, 500),
      risks: '',
      actions: '',
    };
  }
}

/**
 * Analyze reflection content using Gemini API
 * Implements timeout and retry logic
 * 
 * @param variablesOrContent - Either PromptVariables object or direct prompt content string
 * @param customPrompt - Optional custom prompt to use instead of loading from database
 */
export async function analyzeReflection(
  variablesOrContent: PromptVariables | string,
  customPrompt?: string
): Promise<AIFeedback> {
  const isDirectPrompt = typeof variablesOrContent === 'string';
  
  if (!isDirectPrompt) {
    logInfo('Starting reflection analysis', {
      learner: variablesOrContent.learner_name,
      team: variablesOrContent.team_name,
      week: variablesOrContent.week_start,
    });
  }

  try {
    const result = await retryWithBackoff(
      async () => {
        // Get the prompt
        let prompt: string;
        if (customPrompt) {
          // Use custom prompt directly (for testing)
          prompt = customPrompt;
        } else if (isDirectPrompt) {
          // Direct prompt content provided
          prompt = variablesOrContent;
        } else {
          // Get the prompt with variables substituted from database or default
          prompt = await getPromptForAnalysis(variablesOrContent);
        }

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Gemini API request timed out'));
          }, ANALYSIS_TIMEOUT_MS);
        });

        // Create analysis promise
        const analysisPromise = (async () => {
          const model = getGeminiModel();
          const result = await model.generateContent(prompt);
          const response = result.response;
          const text = response.text();

          if (!text) {
            throw new Error('Empty response from Gemini API');
          }

          return parseGeminiResponse(text);
        })();

        // Race between timeout and analysis
        return await Promise.race([analysisPromise, timeoutPromise]);
      },
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        onRetry: (attempt, error) => {
          if (isRetryableError(error)) {
            logWarn(`Retrying Gemini API call (attempt ${attempt})`, {
              error: error.message,
            });
          } else {
            // Non-retryable error, throw immediately
            throw error;
          }
        },
      }
    );

    if (!isDirectPrompt) {
      logInfo('Reflection analysis completed successfully', {
        learner: variablesOrContent.learner_name,
        team: variablesOrContent.team_name,
      });
    }

    return result;
  } catch (error) {
    if (!isDirectPrompt) {
      logError('Failed to analyze reflection after all retries', error as Error, {
        learner: variablesOrContent.learner_name,
        team: variablesOrContent.team_name,
        week: variablesOrContent.week_start,
      });
    }

    throw error;
  }
}
