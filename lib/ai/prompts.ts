export function getDefaultPrompt(
  learnerName: string,
  teamName: string,
  weekStart: string,
  reflectionContent: string
): string {
  return `당신은 창업 교육 전문 코치입니다. 다음 학습자의 주간 리플렉션을 분석해주세요.

학습자: ${learnerName}
팀: ${teamName}
주차: ${weekStart}

리플렉션 내용:
${reflectionContent}

다음 형식으로 분석 결과를 JSON으로 제공해주세요:
{
  "summary": "2-3문장으로 이번 주 학습 내용 요약",
  "risks": "발견된 문제점이나 우려사항 (없으면 빈 문자열)",
  "actions": "다음 주에 실행할 구체적인 행동 제안 (3개 이내)"
}`;
}

export function replacePromptVariables(
  promptTemplate: string,
  variables: {
    learner_name: string;
    team_name: string;
    week_start: string;
    reflection_content: string;
  }
): string {
  return promptTemplate
    .replace(/{learner_name}/g, variables.learner_name)
    .replace(/{team_name}/g, variables.team_name)
    .replace(/{week_start}/g, variables.week_start)
    .replace(/{reflection_content}/g, variables.reflection_content);
}
