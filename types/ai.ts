export interface AIFeedback {
  summary: string;
  risks: string;
  actions: string;
}

export interface AIAnalysisRequest {
  reflectionContent: string;
  learnerName: string;
  teamName: string;
  weekStart: string;
}
