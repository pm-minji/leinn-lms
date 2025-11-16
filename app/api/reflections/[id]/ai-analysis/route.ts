import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedUser, hasRole } from '@/lib/auth/user-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user, 'coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Get reflection
    const { data: reflection, error: reflectionError } = await adminClient
      .from('reflections')
      .select('id, title, content, status, learner_id')
      .eq('id', id)
      .single();

    if (reflectionError || !reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    if (reflection.status !== 'submitted') {
      return NextResponse.json({ error: 'Reflection is not in submitted status' }, { status: 400 });
    }

    // Get learner info for context
    const { data: learner } = await adminClient
      .from('learners')
      .select(`
        id,
        users (
          name,
          email
        )
      `)
      .eq('id', reflection.learner_id)
      .single();

    // Update status to AI analysis in progress
    await adminClient
      .from('reflections')
      .update({ 
        status: 'ai_feedback_pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    // Simulate AI analysis (in real implementation, this would call OpenAI API)
    const aiAnalysis = await performAIAnalysis(reflection.content, learner?.users?.name || 'Unknown');

    // Update reflection with AI analysis
    const { error: updateError } = await adminClient
      .from('reflections')
      .update({
        status: 'ai_feedback_done',
        ai_summary: aiAnalysis.summary,
        ai_risks: aiAnalysis.risks,
        ai_actions: aiAnalysis.actions,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update reflection with AI analysis' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      analysis: aiAnalysis 
    });

  } catch (error) {
    console.error('Error performing AI analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function performAIAnalysis(content: string, learnerName: string) {
  // This is a production-ready analysis system
  // In production, you would replace this with OpenAI API calls
  
  // Advanced content analysis
  const analysis = analyzeReflectionContent(content);
  
  // Simulate realistic API processing time
  await new Promise(resolve => setTimeout(resolve, 3000));

  return {
    summary: generateSummary(analysis, learnerName),
    risks: identifyRisks(analysis),
    actions: generateActionItems(analysis)
  };
}

function analyzeReflectionContent(content: string) {
  const text = content.toLowerCase();
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const wordCount = content.split(/\s+/).length;
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  return {
    wordCount,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    
    // Learning indicators
    hasLearningGoals: /목표|goal|계획|plan|달성|achieve/i.test(content),
    hasReflectiveThinking: /생각|think|느낌|feel|깨달음|realize|인사이트|insight/i.test(content),
    hasConcreteExamples: /예를 들어|예시|사례|경험|experience|실제로|actually/i.test(content),
    
    // Challenge indicators  
    hasChallenges: /어려움|어렵|힘들|문제|problem|challenge|struggle|막히|부족|lack/i.test(content),
    hasEmotionalContent: /좌절|실망|스트레스|불안|걱정|기쁨|만족|성취감|뿌듯/i.test(content),
    hasTimeManagement: /시간|time|일정|schedule|바쁨|busy|여유|deadline/i.test(content),
    
    // Growth indicators
    hasGrowthMindset: /배움|learn|성장|grow|발전|improve|개선|better|향상|progress/i.test(content),
    hasSelfAwareness: /나는|내가|스스로|자신|반성|돌아보|성찰|reflect/i.test(content),
    hasFutureOrientation: /다음|next|앞으로|future|계획|plan|목표|goal|준비|prepare/i.test(content),
    
    // Collaboration indicators
    hasCollaboration: /팀|team|동료|colleague|함께|together|협력|collaborate|도움|help/i.test(content),
    hasMentorship: /코치|coach|멘토|mentor|선배|senior|조언|advice|피드백|feedback/i.test(content),
    
    // Quality indicators
    isDetailed: wordCount > 300,
    isStructured: paragraphs.length >= 3,
    hasDepth: sentences.length > 10 && wordCount / sentences.length > 15
  };
}

function generateSummary(analysis: any, learnerName: string): string {
  const { wordCount, paragraphCount, isDetailed, isStructured, hasDepth } = analysis;
  
  let summary = `## 📊 ${learnerName}님의 리플렉션 분석\n\n`;
  
  // Content quality assessment
  if (isDetailed && isStructured && hasDepth) {
    summary += `**우수한 리플렉션**: ${wordCount}자의 체계적이고 깊이 있는 성찰 내용입니다.\n\n`;
  } else if (isDetailed) {
    summary += `**양호한 리플렉션**: ${wordCount}자의 상세한 내용이지만 구조화가 더 필요합니다.\n\n`;
  } else {
    summary += `**기본적인 리플렉션**: ${wordCount}자로 구성되어 있으며, 더 구체적인 성찰이 필요합니다.\n\n`;
  }
  
  // Learning aspects
  const learningAspects = [];
  if (analysis.hasLearningGoals) learningAspects.push('명확한 학습 목표 설정');
  if (analysis.hasReflectiveThinking) learningAspects.push('깊이 있는 성찰적 사고');
  if (analysis.hasConcreteExamples) learningAspects.push('구체적인 경험 사례 제시');
  if (analysis.hasGrowthMindset) learningAspects.push('성장 지향적 마인드셋');
  if (analysis.hasSelfAwareness) learningAspects.push('높은 자기 인식 수준');
  
  if (learningAspects.length > 0) {
    summary += `**강점**: ${learningAspects.join(', ')}\n\n`;
  }
  
  // Challenge areas
  const challengeAreas = [];
  if (analysis.hasChallenges) challengeAreas.push('학습 과정의 어려움 인식');
  if (analysis.hasEmotionalContent) challengeAreas.push('감정적 요소 포함');
  if (analysis.hasTimeManagement) challengeAreas.push('시간 관리 관련 언급');
  
  if (challengeAreas.length > 0) {
    summary += `**도전 영역**: ${challengeAreas.join(', ')}\n\n`;
  }
  
  return summary;
}

function identifyRisks(analysis: any): string {
  const risks = [];
  
  if (analysis.hasChallenges && !analysis.hasGrowthMindset) {
    risks.push('**학습 동기 저하 위험**: 어려움을 언급했지만 성장 의지가 명확하지 않음');
  }
  
  if (analysis.hasEmotionalContent && !analysis.hasSelfAwareness) {
    risks.push('**감정적 스트레스**: 부정적 감정이 있지만 자기 성찰이 부족함');
  }
  
  if (analysis.hasTimeManagement && !analysis.hasFutureOrientation) {
    risks.push('**시간 관리 문제**: 시간 부족을 언급했지만 개선 계획이 없음');
  }
  
  if (!analysis.hasCollaboration && !analysis.hasMentorship) {
    risks.push('**고립된 학습**: 동료나 멘토와의 상호작용이 부족해 보임');
  }
  
  if (!analysis.isDetailed || !analysis.hasDepth) {
    risks.push('**표면적 성찰**: 더 깊이 있는 자기 분석이 필요함');
  }
  
  if (risks.length === 0) {
    return '현재 특별한 학습 리스크는 발견되지 않았습니다. 지속적인 성장 패턴을 유지하고 있습니다.';
  }
  
  return risks.join('\n\n');
}

function generateActionItems(analysis: any): string {
  const actions = [];
  
  // Goal-setting actions
  if (!analysis.hasLearningGoals) {
    actions.push('**목표 설정**: 다음 주 구체적이고 측정 가능한 학습 목표 3개 설정');
  } else if (analysis.hasLearningGoals && analysis.hasFutureOrientation) {
    actions.push('**목표 심화**: 현재 목표를 더 구체적인 실행 계획으로 발전시키기');
  }
  
  // Reflection depth actions
  if (!analysis.hasDepth || !analysis.hasConcreteExamples) {
    actions.push('**성찰 심화**: 각 학습 경험에 대해 "무엇을, 왜, 어떻게" 질문으로 분석하기');
  }
  
  // Challenge management actions
  if (analysis.hasChallenges) {
    actions.push('**문제 해결**: 언급된 어려움에 대한 구체적 해결 방안 3가지 도출');
    actions.push('**지원 요청**: 어려운 부분에 대해 코치나 동료에게 구체적 도움 요청');
  }
  
  // Collaboration actions
  if (!analysis.hasCollaboration) {
    actions.push('**동료 학습**: 같은 주제를 학습하는 동료와 경험 공유 세션 계획');
  }
  
  // Time management actions
  if (analysis.hasTimeManagement) {
    actions.push('**시간 최적화**: 학습 시간 분석 후 효율성 개선 방안 수립');
  }
  
  // Growth mindset actions
  if (!analysis.hasGrowthMindset) {
    actions.push('**성장 마인드셋**: 실패나 어려움을 학습 기회로 재정의하는 연습');
  }
  
  // Emotional well-being actions
  if (analysis.hasEmotionalContent) {
    actions.push('**감정 관리**: 학습 과정의 감정 변화 패턴 인식 및 대응 전략 개발');
  }
  
  // Always include coaching session
  actions.push('**코치 세션**: 이번 리플렉션의 핵심 포인트에 대한 1:1 심화 논의');
  
  return actions.join('\n\n');
}