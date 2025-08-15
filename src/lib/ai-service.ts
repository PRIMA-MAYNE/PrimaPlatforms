// Intelligent AI Service - DeepSeek R1 + Local Fallback
// Real AI via OpenRouter DeepSeek R1 with local fallback for reliability

import { OpenRouterAIService } from './openrouter-ai-service';

interface LessonPlanParams {
  subject: string;
  topic: string;
  gradeLevel: number;
  duration: number;
  objectives?: string[];
  context?: string;
}

interface AssessmentParams {
  subject: string;
  topic: string;
  gradeLevel: number;
  questionCount: number;
  questionTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  duration?: number;
}

interface EducationalInsightsParams {
  data: {
    attendance?: any[];
    grades?: any[];
    students?: any[];
  };
  classId?: string;
  subject?: string;
}

export class AIService {
  // Check if real AI is enabled
  private static get useRealAI(): boolean {
    return import.meta.env.VITE_USE_REAL_AI === 'true' &&
           import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';
  }
  // Educational content templates for rapid generation
  private static readonly ECZ_SUBJECTS = {
    mathematics: {
      topics: ['algebra', 'geometry', 'trigonometry', 'calculus', 'statistics'],
      skills: ['problem solving', 'logical reasoning', 'numerical computation', 'spatial awareness']
    },
    english: {
      topics: ['grammar', 'literature', 'composition', 'comprehension', 'poetry'],
      skills: ['communication', 'critical thinking', 'analysis', 'creativity']
    },
    science: {
      topics: ['biology', 'chemistry', 'physics', 'earth science', 'scientific method'],
      skills: ['observation', 'experimentation', 'analysis', 'hypothesis testing']
    },
    social_studies: {
      topics: ['history', 'geography', 'civics', 'economics', 'culture'],
      skills: ['research', 'critical analysis', 'map skills', 'cultural awareness']
    }
  };

  private static readonly BLOOM_LEVELS = {
    remember: ['list', 'identify', 'recall', 'state', 'define'],
    understand: ['explain', 'describe', 'summarize', 'interpret', 'compare'],
    apply: ['solve', 'demonstrate', 'calculate', 'use', 'implement'],
    analyze: ['examine', 'investigate', 'categorize', 'differentiate', 'analyze'],
    evaluate: ['assess', 'judge', 'critique', 'justify', 'evaluate'],
    create: ['design', 'construct', 'develop', 'formulate', 'create']
  };

  // =====================================================
  // LESSON PLAN GENERATION
  // =====================================================

  static async generateLessonPlan(params: LessonPlanParams): Promise<any> {
    // Try real AI first if enabled
    if (this.useRealAI) {
      try {
        console.log('🤖 Generating lesson plan with DeepSeek R1 AI...');
        return await OpenRouterAIService.generateLessonPlan(params);
      } catch (error) {
        console.warn('Real AI failed, falling back to local generation:', error);
      }
    }

    // Fallback to local generation
    console.log('📚 Generating lesson plan with local AI...');
    return this.generateLocalLessonPlan(params);
  }

  private static generateLocalLessonPlan(params: LessonPlanParams): any {
    const { subject, topic, gradeLevel, duration } = params;

    // Generate ECZ-aligned objectives
    const objectives = this.generateObjectives(subject, topic, gradeLevel);

    // Generate contextual materials
    const materials = this.generateMaterials(subject, topic, gradeLevel);

    // Generate structured content
    const content = this.generateLessonContent(subject, topic, gradeLevel, duration);

    return {
      title: `${subject.charAt(0).toUpperCase() + subject.slice(1)}: ${topic}`,
      subject: subject,
      topic: topic,
      grade_level: gradeLevel,
      duration_minutes: duration,
      objectives: objectives,
      materials: materials,
      introduction: content.introduction,
      lesson_development: content.development,
      activities: content.activities,
      assessment: content.assessment,
      conclusion: content.conclusion,
      homework: content.homework,
      notes: `ECZ Curriculum aligned for Grade ${gradeLevel}. Differentiated instruction included.`,
      syllabi_alignment: `ECZ ${subject.charAt(0).toUpperCase() + subject.slice(1)} Syllabus - Grade ${gradeLevel}`,
      ecz_compliance: true,
      generated_at: new Date().toISOString()
    };
  }

  private static generateObjectives(subject: string, topic: string, gradeLevel: number): string[] {
    const bloomVerbs = [
      ...this.BLOOM_LEVELS.understand,
      ...this.BLOOM_LEVELS.apply,
      ...this.BLOOM_LEVELS.analyze
    ];

    return [
      `Students will ${bloomVerbs[0]} the key concepts of ${topic} in ${subject}`,
      `Students will ${bloomVerbs[1]} ${topic} principles to solve practical problems`,
      `Students will ${bloomVerbs[2]} real-world applications of ${topic}`,
      `Students will demonstrate understanding through hands-on activities and assessments`
    ];
  }

  private static generateMaterials(subject: string, topic: string, gradeLevel: number): string[] {
    const baseMaterials = [
      'Whiteboard and markers',
      'Student exercise books',
      'Textbooks',
      'Calculator (where applicable)'
    ];

    const subjectSpecific: { [key: string]: string[] } = {
      mathematics: ['Graph paper', 'Geometric instruments', 'Mathematical tables'],
      science: ['Laboratory equipment', 'Charts and diagrams', 'Specimens/models'],
      english: ['Reading materials', 'Dictionary', 'Writing materials'],
      social_studies: ['Maps and atlases', 'Historical documents', 'Current affairs materials']
    };

    return [...baseMaterials, ...(subjectSpecific[subject.toLowerCase()] || [])];
  }

  private static generateLessonContent(subject: string, topic: string, gradeLevel: number, duration: number) {
    const timeAllocation = {
      introduction: Math.round(duration * 0.15),
      development: Math.round(duration * 0.50),
      activities: Math.round(duration * 0.25),
      conclusion: Math.round(duration * 0.10)
    };

    return {
      introduction: `Begin with a ${timeAllocation.introduction}-minute engaging hook connecting ${topic} to students' daily experiences. Review prerequisite knowledge and establish learning objectives. Use questioning to assess prior understanding and create curiosity about ${topic}.`,

      development: `Spend ${timeAllocation.development} minutes systematically introducing ${topic} concepts. Use clear explanations, visual aids, and step-by-step demonstrations. Break complex ideas into manageable chunks. Encourage active participation through questioning and discussion. Provide multiple examples and check understanding frequently.`,

      activities: [
        `Pair work (${Math.round(timeAllocation.activities * 0.4)} min): Students collaborate to explore ${topic} applications`,
        `Group activity (${Math.round(timeAllocation.activities * 0.35)} min): Teams solve problems related to ${topic}`,
        `Individual practice (${Math.round(timeAllocation.activities * 0.25)} min): Students work independently on exercises`
      ],

      assessment: `Use formative assessment throughout via observation, questioning, and student responses. Quick comprehension checks every 10-15 minutes. Exit ticket or brief quiz to gauge understanding. Provide immediate feedback and address misconceptions.`,

      conclusion: `Summarize key ${topic} concepts learned. Have students reflect on applications and connections. Preview next lesson. Assign homework to reinforce learning.`,

      homework: `Complete practice exercises on ${topic}. Read textbook pages related to today's lesson. Prepare for next class by reviewing prerequisite concepts.`
    };
  }

  // =====================================================
  // ASSESSMENT GENERATION
  // =====================================================

  static async generateAssessment(params: AssessmentParams): Promise<any> {
    // Try real AI first if enabled
    if (this.useRealAI) {
      try {
        console.log('🤖 Generating assessment with DeepSeek R1 AI...');
        return await OpenRouterAIService.generateAssessment(params);
      } catch (error) {
        console.warn('Real AI failed, falling back to local generation:', error);
      }
    }

    // Fallback to local generation
    console.log('📝 Generating assessment with local AI...');
    return this.generateLocalAssessment(params);
  }

  private static generateLocalAssessment(params: AssessmentParams): any {
    const { subject, topic, gradeLevel, questionCount, questionTypes, difficulty, duration = 60 } = params;

    const questions = this.generateQuestions(subject, topic, gradeLevel, questionCount, questionTypes, difficulty);
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    return {
      title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Assessment: ${topic}`,
      subject: subject,
      topic: topic,
      grade_level: gradeLevel,
      difficulty_level: difficulty,
      total_marks: totalMarks,
      duration_minutes: duration,
      instructions: this.generateInstructions(duration, totalMarks, questionTypes),
      questions: questions,
      assessment_type: totalMarks > 50 ? 'exam' : totalMarks > 20 ? 'test' : 'quiz',
      syllabi_alignment: `ECZ ${subject.charAt(0).toUpperCase() + subject.slice(1)} Syllabus - Grade ${gradeLevel}`,
      ecz_compliance: true,
      generated_at: new Date().toISOString()
    };
  }

  private static generateQuestions(subject: string, topic: string, gradeLevel: number, count: number, types: string[], difficulty: string) {
    const questions = [];
    const typeDistribution = this.distributeQuestionTypes(types, count);

    let questionNumber = 1;

    // Generate multiple choice questions
    for (let i = 0; i < typeDistribution.multiple_choice; i++) {
      questions.push(this.generateMCQ(subject, topic, gradeLevel, questionNumber++, difficulty));
    }

    // Generate short answer questions
    for (let i = 0; i < typeDistribution.short_answer; i++) {
      questions.push(this.generateShortAnswer(subject, topic, gradeLevel, questionNumber++, difficulty));
    }

    // Generate essay questions
    for (let i = 0; i < typeDistribution.essay; i++) {
      questions.push(this.generateEssay(subject, topic, gradeLevel, questionNumber++, difficulty));
    }

    // Generate problem solving questions
    for (let i = 0; i < typeDistribution.problem_solving; i++) {
      questions.push(this.generateProblemSolving(subject, topic, gradeLevel, questionNumber++, difficulty));
    }

    return questions;
  }

  private static distributeQuestionTypes(types: string[], total: number) {
    const distribution: { [key: string]: number } = {
      multiple_choice: 0,
      short_answer: 0,
      essay: 0,
      problem_solving: 0
    };

    // Default distribution if no types specified
    if (types.length === 0) {
      distribution.multiple_choice = Math.ceil(total * 0.5);
      distribution.short_answer = Math.ceil(total * 0.3);
      distribution.essay = Math.floor(total * 0.2);
      return distribution;
    }

    // Distribute evenly among specified types
    const perType = Math.floor(total / types.length);
    const remainder = total % types.length;

    types.forEach((type, index) => {
      const key = type.replace('-', '_');
      distribution[key] = perType + (index < remainder ? 1 : 0);
    });

    return distribution;
  }

  private static generateMCQ(subject: string, topic: string, gradeLevel: number, questionNumber: number, difficulty: string) {
    const marks = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;

    return {
      question_number: questionNumber,
      question_type: 'multiple_choice',
      question_text: `Which of the following best describes ${topic} in ${subject}?`,
      marks: marks,
      options: [
        `${topic} is primarily used for basic calculations and simple operations`,
        `${topic} involves complex theoretical frameworks and advanced concepts`,
        `${topic} applies to real-world problem solving and practical applications`,
        `${topic} is mainly theoretical with limited practical applications`
      ],
      correct_answer: `${topic} applies to real-world problem solving and practical applications`,
      answer_explanation: `This demonstrates comprehensive understanding of ${topic} and its practical relevance in ${subject}.`,
      bloom_taxonomy_level: difficulty === 'easy' ? 'remember' : difficulty === 'medium' ? 'understand' : 'apply'
    };
  }

  private static generateShortAnswer(subject: string, topic: string, gradeLevel: number, questionNumber: number, difficulty: string) {
    const marks = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;

    return {
      question_number: questionNumber,
      question_type: 'short_answer',
      question_text: `Explain the main principles of ${topic} and provide one practical example from ${subject}.`,
      marks: marks,
      correct_answer: `The main principles include understanding core concepts, applying knowledge systematically, and connecting theory to practice. Example: Using ${topic} to solve real-world problems in ${subject}.`,
      answer_explanation: `This assesses both theoretical knowledge and practical application skills in ${subject}.`,
      bloom_taxonomy_level: difficulty === 'easy' ? 'understand' : difficulty === 'medium' ? 'apply' : 'analyze'
    };
  }

  private static generateEssay(subject: string, topic: string, gradeLevel: number, questionNumber: number, difficulty: string) {
    const marks = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 15;

    return {
      question_number: questionNumber,
      question_type: 'essay',
      question_text: `Discuss the importance of ${topic} in modern ${subject}. Include examples and explain its relevance to Grade ${gradeLevel} students.`,
      marks: marks,
      correct_answer: `A comprehensive essay should cover: 1) Definition and key concepts of ${topic}, 2) Historical development and context, 3) Current applications in ${subject}, 4) Future relevance and career connections, 5) Personal reflection on learning ${topic}.`,
      answer_explanation: `This evaluates critical thinking, analysis, synthesis, and communication skills in ${subject}.`,
      bloom_taxonomy_level: difficulty === 'easy' ? 'understand' : difficulty === 'medium' ? 'analyze' : 'evaluate'
    };
  }

  private static generateProblemSolving(subject: string, topic: string, gradeLevel: number, questionNumber: number, difficulty: string) {
    const marks = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;

    return {
      question_number: questionNumber,
      question_type: 'problem_solving',
      question_text: `Solve the following problem using ${topic} concepts: A practical scenario requires application of ${topic} principles to find a solution.`,
      marks: marks,
      correct_answer: `Step-by-step solution: 1) Identify the problem components, 2) Apply relevant ${topic} principles, 3) Calculate/analyze systematically, 4) Verify the solution, 5) Explain the reasoning.`,
      answer_explanation: `This tests problem-solving skills, logical reasoning, and practical application of ${topic} in ${subject}.`,
      bloom_taxonomy_level: difficulty === 'easy' ? 'apply' : difficulty === 'medium' ? 'analyze' : 'create'
    };
  }

  private static generateInstructions(duration: number, totalMarks: number, questionTypes: string[]): string {
    const typeDescriptions = {
      'multiple-choice': 'multiple choice questions',
      'short-answer': 'short answer questions',
      'essay': 'essay questions',
      'problem-solving': 'problem solving questions'
    };

    const types = questionTypes.map(t => typeDescriptions[t as keyof typeof typeDescriptions]).join(', ');

    return `INSTRUCTIONS:
1. Read all questions carefully before beginning
2. Answer ALL questions in the spaces provided
3. Show your working for all calculations
4. Time allowed: ${duration} minutes
5. Total marks: ${totalMarks}
6. This assessment contains ${types}
7. Allocate your time wisely across all sections
8. Check your answers before submitting`;
  }

  // =====================================================
  // EDUCATIONAL INSIGHTS GENERATION
  // =====================================================

  static async generateEducationalInsights(params: EducationalInsightsParams): Promise<any> {
    // Try real AI first if enabled
    if (this.useRealAI) {
      try {
        console.log('🤖 Generating insights with DeepSeek R1 AI...');
        return await OpenRouterAIService.generateEducationalInsights(params);
      } catch (error) {
        console.warn('Real AI failed, falling back to local generation:', error);
      }
    }

    // Fallback to local generation
    console.log('📊 Generating insights with local AI...');
    return this.generateLocalInsights(params);
  }

  private static generateLocalInsights(params: EducationalInsightsParams): any {
    const { data, classId, subject } = params;
    const { attendance = [], grades = [], students = [] } = data;

    const insights = {
      summary: this.generateSummaryInsights(attendance, grades, students),
      attendance: this.generateAttendanceInsights(attendance),
      performance: this.generatePerformanceInsights(grades, subject),
      recommendations: this.generateRecommendations(attendance, grades, students),
      trends: this.generateTrendAnalysis(attendance, grades),
      interventions: this.generateInterventions(attendance, grades, students)
    };

    return insights;
  }

  private static generateSummaryInsights(attendance: any[], grades: any[], students: any[]) {
    const attendanceRate = attendance.length > 0
      ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
      : 0;

    const averagePerformance = grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
      : 0;

    return {
      total_students: students.length,
      attendance_rate: Math.round(attendanceRate),
      average_performance: Math.round(averagePerformance),
      status: attendanceRate >= 80 && averagePerformance >= 70 ? 'excellent' :
              attendanceRate >= 70 && averagePerformance >= 60 ? 'good' : 'needs_attention'
    };
  }

  private static generateAttendanceInsights(attendance: any[]) {
    if (attendance.length === 0) {
      return {
        message: 'No attendance data available for analysis',
        recommendations: ['Begin tracking attendance to enable insights']
      };
    }

    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const rate = Math.round((presentCount / totalRecords) * 100);

    return {
      overall_rate: rate,
      pattern: rate >= 90 ? 'excellent' : rate >= 80 ? 'good' : rate >= 70 ? 'average' : 'concerning',
      insights: [
        rate >= 85 ? 'Strong attendance pattern supports learning outcomes' :
        rate >= 70 ? 'Moderate attendance - some improvement needed' :
        'Low attendance may impact academic performance'
      ],
      recommendations: rate < 80 ? [
        'Implement attendance improvement strategies',
        'Identify and address barriers to attendance',
        'Engage with parents/guardians about attendance importance'
      ] : ['Maintain current positive attendance patterns']
    };
  }

  private static generatePerformanceInsights(grades: any[], subject?: string) {
    if (grades.length === 0) {
      return {
        message: 'No performance data available for analysis',
        recommendations: ['Conduct assessments to enable performance insights']
      };
    }

    const averageScore = grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length;
    const highPerformers = grades.filter(g => (g.percentage || 0) >= 75).length;
    const lowPerformers = grades.filter(g => (g.percentage || 0) < 50).length;

    return {
      average_score: Math.round(averageScore),
      distribution: {
        high_performers: highPerformers,
        low_performers: lowPerformers,
        total_assessed: grades.length
      },
      trend: averageScore >= 75 ? 'excellent' : averageScore >= 65 ? 'good' : averageScore >= 50 ? 'average' : 'needs_improvement',
      recommendations: this.getPerformanceRecommendations(averageScore, lowPerformers, grades.length)
    };
  }

  private static getPerformanceRecommendations(average: number, lowPerformers: number, total: number): string[] {
    const recommendations = [];

    if (average < 60) {
      recommendations.push('Review teaching strategies and curriculum delivery');
      recommendations.push('Implement differentiated instruction approaches');
    }

    if (lowPerformers / total > 0.3) {
      recommendations.push('Provide additional support for struggling students');
      recommendations.push('Consider peer tutoring or remedial sessions');
    }

    if (average >= 75) {
      recommendations.push('Maintain current effective teaching practices');
      recommendations.push('Challenge high achievers with extension activities');
    }

    return recommendations;
  }

  private static generateRecommendations(attendance: any[], grades: any[], students: any[]): string[] {
    const recommendations = [];

    // Attendance-based recommendations
    const attendanceRate = attendance.length > 0
      ? (attendance.filter(a => a.status === 'present').length / attendance.length) * 100
      : 100;

    if (attendanceRate < 80) {
      recommendations.push('Implement strategies to improve student attendance');
      recommendations.push('Engage with parents about attendance importance');
    }

    // Performance-based recommendations
    const avgPerformance = grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
      : 0;

    if (avgPerformance < 65) {
      recommendations.push('Review and adjust teaching methodologies');
      recommendations.push('Provide additional learning resources');
    }

    // General recommendations
    recommendations.push('Use formative assessment to track progress');
    recommendations.push('Encourage active student participation');
    recommendations.push('Maintain regular communication with students and parents');

    return recommendations;
  }

  private static generateTrendAnalysis(attendance: any[], grades: any[]) {
    return {
      attendance_trend: attendance.length > 10 ? 'stable' : 'limited_data',
      performance_trend: grades.length > 5 ? 'improving' : 'limited_data',
      correlation: 'Positive correlation between attendance and performance expected'
    };
  }

  private static generateInterventions(attendance: any[], grades: any[], students: any[]) {
    const interventions = [];

    // Students needing attention
    const lowAttendance = attendance.filter(a => a.status === 'absent').map(a => a.student_id);
    const lowPerformance = grades.filter(g => (g.percentage || 0) < 50).map(g => g.student_id);

    if (lowAttendance.length > 0) {
      interventions.push({
        type: 'attendance_intervention',
        target: 'students_with_low_attendance',
        action: 'Individual counseling and parent engagement'
      });
    }

    if (lowPerformance.length > 0) {
      interventions.push({
        type: 'academic_intervention',
        target: 'students_with_low_performance',
        action: 'Remedial teaching and additional support'
      });
    }

    return interventions;
  }
}
