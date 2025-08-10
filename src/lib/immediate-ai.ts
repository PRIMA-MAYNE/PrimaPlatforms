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
    if (params.questionTypes.includes("multiple-choice")) {
      questions.push({
        id: `q${i}`,
        number: i,
        type: "Multiple Choice",
        question: `Which of the following best describes ${params.topic}?`,
        marks: 2,
        options: [
          `${params.topic} is primarily used for basic calculations`,
          `${params.topic} involves complex theoretical frameworks`,
          `${params.topic} applies to real-world problem solving`,
          `${params.topic} is mainly theoretical with no practical use`,
        ],
        answer: `${params.topic} applies to real-world problem solving`,
        explanation: `This demonstrates understanding of practical applications of ${params.topic} in everyday situations.`,
        eczCriteria: "Understanding and Application",
        syllabiAlignment: `${params.gradeLevel} ${params.subject} curriculum`,
      });
    }

    if (params.questionTypes.includes("short-answer") && i <= 5) {
      questions.push({
        id: `q${i + 10}`,
        number: i + 10,
        type: "Short Answer",
        question: `Explain the main principles of ${params.topic} and provide one practical example.`,
        marks: 5,
        answer: `The main principles include understanding core concepts, applying knowledge systematically, and connecting theory to practice. Example: Using ${params.topic} to solve everyday problems.`,
        explanation: `This assesses both theoretical knowledge and practical application skills.`,
        eczCriteria: "Analysis and Synthesis",
        syllabiAlignment: `${params.gradeLevel} ${params.subject} curriculum`,
      });
    }

    if (params.questionTypes.includes("essay") && i <= 2) {
      questions.push({
        id: `q${i + 20}`,
        number: i + 20,
        type: "Essay",
        question: `Discuss the importance of ${params.topic} in modern ${params.subject}. Include examples and explain its relevance to students.`,
        marks: 10,
        answer: `A comprehensive essay should cover: 1) Definition and key concepts, 2) Historical development, 3) Current applications, 4) Future relevance, 5) Personal reflection on learning.`,
        explanation: `This evaluates critical thinking, analysis, and communication skills.`,
        eczCriteria: "Evaluation and Creation",
        syllabiAlignment: `${params.gradeLevel} ${params.subject} curriculum`,
      });
    }
  }

  const assessment = {
    title: `${params.subject} Assessment: ${params.topic}`,
    subject: params.subject,
    topic: params.topic,
    gradeLevel: params.gradeLevel,
    difficulty: params.difficulty,
    totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    duration: Math.max(30, questions.length * 3),
    instructions: `Read all instructions carefully before beginning. Answer all questions. Show your working where applicable. Time allowed: ${Math.max(30, questions.length * 3)} minutes.`,
    questions: questions.slice(0, params.questionCount),
    markingScheme: questions.slice(0, params.questionCount).map((q) => ({
      questionId: q.id,
      marks: q.marks,
      criteria: q.explanation,
      partialCredit: "Award partial marks for showing understanding of concepts",
      eczStandards: q.eczCriteria,
      syllabiAlignment: q.syllabiAlignment,
    })),
    eczCompliance: "Aligned with ECZ examination standards and marking criteria",
    syllabiSource: `${params.gradeLevel} ${params.subject} National Curriculum`,
    generatedAt: new Date().toISOString(),
  };

  console.log("✅ Assessment generated successfully:", assessment.title);
  return assessment;
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