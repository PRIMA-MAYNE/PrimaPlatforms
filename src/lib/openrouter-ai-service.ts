// Deprecated. Replaced by OpenAIProxyService via Netlify Function.
// This module is kept for backward-compatibility and will throw if used.

export class OpenRouterAIService {
  static async testConnection(): Promise<boolean> {
    return false;
  }
  static async generateLessonPlan(): Promise<any> {
    throw new Error("OpenRouter service removed. Use OpenAIProxyService.");
  }
  static async generateAssessment(): Promise<any> {
    throw new Error("OpenRouter service removed. Use OpenAIProxyService.");
  }
  static async generateEducationalInsights(): Promise<any> {
    throw new Error("OpenAIProxyService must be used instead.");
  }
}
