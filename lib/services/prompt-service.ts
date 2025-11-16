import { createClient } from '@/lib/supabase/server';
import { PromptInput, PromptUpdateInput } from '@/lib/validations/prompt';

export class PromptService {
  /**
   * Get all prompts
   */
  static async getAllPrompts() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch prompts: ${error.message}`);
    }

    return data;
  }

  /**
   * Get active prompt
   */
  static async getActivePrompt() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw new Error(`Failed to fetch active prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Get prompt by ID
   */
  static async getPromptById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Create new prompt
   */
  static async createPrompt(input: PromptInput) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .insert({
        name: input.name,
        description: input.description,
        prompt_text: input.content,
        is_active: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Update prompt
   */
  static async updatePrompt(id: string, input: PromptUpdateInput) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .update({
        name: input.name,
        description: input.description,
        prompt_text: input.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update prompt: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete prompt
   */
  static async deletePrompt(id: string) {
    const supabase = await createClient();

    // Check if prompt is active
    const { data: prompt } = await supabase
      .from('ai_prompt_templates')
      .select('is_active')
      .eq('id', id)
      .single();

    if (prompt?.is_active) {
      throw new Error('Cannot delete active prompt');
    }

    const { error } = await supabase.from('ai_prompt_templates').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Activate prompt (deactivate all others)
   */
  static async activatePrompt(id: string) {
    const supabase = await createClient();

    // Start transaction: deactivate all prompts
    const { error: deactivateError } = await supabase
      .from('ai_prompt_templates')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    if (deactivateError) {
      throw new Error(`Failed to deactivate prompts: ${deactivateError.message}`);
    }

    // Activate the selected prompt
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to activate prompt: ${error.message}`);
    }

    return data;
  }
}
