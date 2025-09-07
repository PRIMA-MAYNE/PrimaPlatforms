// Re-export the AI service functions with async support
import { AIService } from "./ai-service";

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
  try {
    const insights = await AIService.generateEducationalInsights({ data });

    // If AI returned a structured performance object, normalize it
    if (insights && insights.performance) {
      // Ensure expected keys exist
      const perf = insights.performance;
      return {
        overview: perf.overview || {
          average: 0,
          highest: 0,
          lowest: 0,
          totalStudents: data.length || 0,
        },
        insights: perf.insights || [],
        recommendations: perf.recommendations || [],
        eczAlignment: perf.eczAlignment || null,
      };
    }

    // Fallback standardized response
    return {
      overview: {
        average: 0,
        highest: 0,
        lowest: 0,
        totalStudents: Array.isArray(data)
          ? new Set(data.map((g: any) => g.studentId)).size
          : 0,
      },
      insights: [],
      recommendations: ["Conduct assessments to enable performance analysis"],
      eczAlignment: null,
    };
  } catch (error) {
    console.error("analyzePerformance error:", error);
    return {
      overview: {
        average: 0,
        highest: 0,
        lowest: 0,
        totalStudents: Array.isArray(data)
          ? new Set(data.map((g: any) => g.studentId)).size
          : 0,
      },
      insights: [],
      recommendations: ["Analytics currently unavailable"],
      eczAlignment: null,
    };
  }
}
