/**
 * AI Analysis API Route
 * POST /api/ai/analyze
 * Analyzes reflection content using Gemini API
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeReflection } from '@/lib/ai/analyzer';
import { handleApiError, ApiError } from '@/lib/api/error-handler';
import { logInfo, logError } from '@/lib/utils/logger';

export interface AnalyzeRequest {
  reflectionContent: string;
  learnerName: string;
  teamName: string;
  weekStart: string;
}

export async function POST(request: NextRequest) {
  try {
    logInfo('AI analysis request received');

    // Parse request body
    const body: AnalyzeRequest = await request.json();

    // Validate required fields
    if (!body.reflectionContent || typeof body.reflectionContent !== 'string') {
      throw new ApiError(400, 'reflectionContent is required and must be a string');
    }

    if (!body.learnerName || typeof body.learnerName !== 'string') {
      throw new ApiError(400, 'learnerName is required and must be a string');
    }

    if (!body.teamName || typeof body.teamName !== 'string') {
      throw new ApiError(400, 'teamName is required and must be a string');
    }

    if (!body.weekStart || typeof body.weekStart !== 'string') {
      throw new ApiError(400, 'weekStart is required and must be a string');
    }

    // Validate content length (minimum 100 characters as per requirements)
    if (body.reflectionContent.length < 100) {
      throw new ApiError(
        400,
        'reflectionContent must be at least 100 characters long'
      );
    }

    // Perform AI analysis
    const feedback = await analyzeReflection({
      reflection_content: body.reflectionContent,
      learner_name: body.learnerName,
      team_name: body.teamName,
      week_start: body.weekStart,
    });

    logInfo('AI analysis completed successfully', {
      learner: body.learnerName,
      team: body.teamName,
    });

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    logError('AI analysis request failed', error as Error);
    return handleApiError(error);
  }
}
