// Re-export the lightweight AI service functions
import { AIService } from './ai-service';

export function generateLessonPlan(params: any): any {
  console.log("🎓 Generating ECZ-aligned lesson plan for:", params);
  return AIService.generateLessonPlan(params);
}

export function generateAssessment(params: any): any {
  console.log("📝 Generating ECZ-aligned assessment for:", params);
  return AIService.generateAssessment(params);
}

export function generateEducationalInsights(data: any): any {
  console.log("🧠 Generating data-driven educational insights for:", data);
  return AIService.generateEducationalInsights({ data });
}

export function analyzePerformance(data: any): any {
  console.log("📊 Analyzing real performance data:", data);
  return AIService.generateEducationalInsights({ data }).performance || {
    message: "Performance analysis requires student assessment data",
    recommendations: ["Conduct assessments to enable performance analysis"]
  };
}
