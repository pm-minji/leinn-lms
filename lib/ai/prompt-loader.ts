/**
 * AI Prompt Loader
 * Handles loading active prompts from database and variable substitution
 */

import { createClient } from '@/lib/supabase/server';
import { getDefaultPrompt, replacePromptVariables } from './prompts';
import { logInfo, logWarn } from '@/lib/utils/logger';

export interface PromptVariables {
  learner_name: string;
  team_name: string;
  week_start: string;
  reflection_content: string;
}

/**
 * Load the active prompt template from database
 * Falls back to default prompt if no active template exists
 */
export async function loadActivePrompt(): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - no active prompt
        logInfo('No active prompt template found, will use default');
        return null;
      }
      throw error;
    }

    if (data) {
      logInfo('Active prompt template loaded from database');
      return data.content;
    }

    return null;
  } catch (error) {
    logWarn('Failed to load active prompt template', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Get the prompt to use for analysis
 * Loads active prompt from database or falls back to default
 */
export async function getPromptForAnalysis(
  variables: PromptVariables
): Promise<string> {
  const activePrompt = await loadActivePrompt();

  if (activePrompt) {
    // Use active prompt from database with variable substitution
    return replacePromptVariables(activePrompt, variables);
  }

  // Fall back to default prompt
  logInfo('Using default prompt template');
  return getDefaultPrompt(
    variables.learner_name,
    variables.team_name,
    variables.week_start,
    variables.reflection_content
  );
}
