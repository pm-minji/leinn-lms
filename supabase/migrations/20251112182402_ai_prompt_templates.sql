-- Create ai_prompt_templates table
CREATE TABLE ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_ai_prompt_templates_active ON ai_prompt_templates(is_active);

-- Add updated_at trigger
CREATE TRIGGER update_ai_prompt_templates_updated_at BEFORE UPDATE ON ai_prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default prompt template
INSERT INTO ai_prompt_templates (name, description, prompt_text, is_active) VALUES (
  '기본 리플렉션 분석',
  'LEINN 스타일 창업 교육을 위한 기본 리플렉션 분석 프롬프트',
  '당신은 창업 교육 전문 코치입니다. 다음 학습자의 주간 리플렉션을 분석해주세요.

학습자: {learner_name}
팀: {team_name}
주차: {week_start}

리플렉션 내용:
{reflection_content}

다음 형식으로 분석 결과를 JSON으로 제공해주세요:
{
  "summary": "2-3문장으로 이번 주 학습 내용 요약",
  "risks": "발견된 문제점이나 우려사항 (없으면 빈 문자열)",
  "actions": "다음 주에 실행할 구체적인 행동 제안 (3개 이내)"
}',
  true
);
