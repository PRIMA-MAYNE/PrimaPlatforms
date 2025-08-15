// Re-export the AI service functions with async support
import { AIService } from './ai-service';

export async function generateLessonPlan(params: any): Promise<any> {
  console.log("🎓 Generating ECZ-aligned lesson plan for:", params);
  return await AIService.generateLessonPlan(params);
}

export async function generateAssessment(params: any): Promise<any> {
  console.log("📝 Generating ECZ-aligned assessment for:", params);
  return await AIService.generateAssessment(params);
}

export async function generateEducationalInsights(data: any): Promise<any> {
  console.log("🧠 Generating data-driven educational insights for:", data);
  return await AIService.generateEducationalInsights({ data });
}

export async function analyzePerformance(data: any): Promise<any> {
  console.log("📊 Analyzing real performance data:", data);
  const insights = await AIService.generateEducationalInsights({ data });
  return insights.performance || {
    message: "Performance analysis requires student assessment data",
    recommendations: ["Conduct assessments to enable performance analysis"]
  };
}
