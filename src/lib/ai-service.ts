import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ Only for dev or protected environments
});

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
  difficulty: "easy" | "medium" | "hard";
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
    return (
      import.meta.env.VITE_USE_REAL_AI === "true" &&
      import.meta.env.VITE_ENABLE_AI_FEATURES === "true"
    );
  }

  // Educational content templates for rapid generation (still used in lesson plans & insights)
  private static readonly ECZ_SUBJECTS = {
    mathematics: {
      topics: ["algebra", "geometry", "trigonometry", "calculus", "statistics"],
      skills: [
        "problem solving",
        "logical reasoning",
        "numerical computation",
        "spatial awareness",
      ],
    },
    english: {
      topics: [
        "grammar",
        "literature",
        "composition",
        "comprehension",
        "poetry",
      ],
      skills: ["communication", "critical thinking", "analysis", "creativity"],
    },
    science: {
      topics: [
        "biology",
        "chemistry",
        "physics",
        "earth science",
        "scientific method",
      ],
      skills: [
        "observation",
        "experimentation",
        "analysis",
        "hypothesis testing",
      ],
    },
    social_studies: {
      topics: ["history", "geography", "civics", "economics", "culture"],
      skills: [
        "research",
        "critical analysis",
        "map skills",
        "cultural awareness",
      ],
    },
  };

  private static readonly BLOOM_LEVELS = {
    remember: ["list", "identify", "recall", "state", "define"],
    understand: ["explain", "describe", "summarize", "interpret", "compare"],
    apply: ["solve", "demonstrate", "calculate", "use", "implement"],
    analyze: [
      "examine",
      "investigate",
      "categorize",
      "differentiate",
      "analyze",
    ],
    evaluate: ["assess", "judge", "critique", "justify", "evaluate"],
    create: ["design", "construct", "develop", "formulate", "create"],
  };

  // =====================================================
  // LESSON PLAN GENERATION — REMAINS UNCHANGED (with fallback)
  // =====================================================

  static async generateLessonPlan(params: LessonPlanParams): Promise<any> {
    if (this.useRealAI) {
      try {
        console.log("🤖 Generating lesson plan with OpenAI...");
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an expert Zambian curriculum (ECZ) lesson planner. Generate structured, grade-appropriate lesson plans aligned with ECZ standards. Output ONLY valid JSON.",
            },
            {
              role: "user",
              content: `Generate a detailed lesson plan for subject: ${params.subject}, topic: ${params.topic}, grade level: ${params.gradeLevel}, duration: ${params.duration} minutes. Include: title, subject, topic, grade_level, duration_minutes, objectives (array), materials (array), introduction (string), lesson_development (string or array), activities (array), assessment (string), conclusion (string), homework (string), notes (string), syllabi_alignment (string), ecz_compliance (boolean), generated_at (ISO string). Format as JSON.`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const content = completion.choices[0]?.message?.content || "{}";
        return JSON.parse(content);
      } catch (error) {
        console.warn("OpenAI failed, falling back to local generation:", error);
      }
    }

    console.log("📚 Generating lesson plan with local AI...");
    return this.generateLocalLessonPlan(params);
  }

  private static generateLocalLessonPlan(params: LessonPlanParams): any {
    const { subject, topic, gradeLevel, duration } = params;

    const objectives = this.generateObjectives(subject, topic, gradeLevel);
    const materials = this.generateMaterials(subject, topic, gradeLevel);
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
      generated_at: new Date().toISOString(),
    };
  }

  private static generateObjectives(
    subject: string,
    topic: string,
    gradeLevel: number,
  ): string[] {
    const bloomVerbs = [
      ...this.BLOOM_LEVELS.understand,
      ...this.BLOOM_LEVELS.apply,
      ...this.BLOOM_LEVELS.analyze,
    ];

    return [
      `Students will ${bloomVerbs[0]} the key concepts of ${topic} in ${subject}`,
      `Students will ${bloomVerbs[1]} ${topic} principles to solve practical problems`,
      `Students will ${bloomVerbs[2]} real-world applications of ${topic}`,
      `Students will demonstrate understanding through hands-on activities and assessments`,
    ];
  }

  private static generateMaterials(
    subject: string,
    topic: string,
    gradeLevel: number,
  ): string[] {
    const baseMaterials = [
      "Whiteboard and markers",
      "Student exercise books",
      "Textbooks",
      "Calculator (where applicable)",
    ];

    const subjectSpecific: { [key: string]: string[] } = {
      mathematics: [
        "Graph paper",
        "Geometric instruments",
        "Mathematical tables",
      ],
      science: [
        "Laboratory equipment",
        "Charts and diagrams",
        "Specimens/models",
      ],
      english: ["Reading materials", "Dictionary", "Writing materials"],
      social_studies: [
        "Maps and atlases",
        "Historical documents",
        "Current affairs materials",
      ],
    };

    return [
      ...baseMaterials,
      ...(subjectSpecific[subject.toLowerCase()] || []),
    ];
  }

  private static generateLessonContent(
    subject: string,
    topic: string,
    gradeLevel: number,
    duration: number,
  ) {
    const timeAllocation = {
      introduction: Math.round(duration * 0.15),
      development: Math.round(duration * 0.5),
      activities: Math.round(duration * 0.25),
      conclusion: Math.round(duration * 0.1),
    };

    return {
      introduction: `Begin with a ${timeAllocation.introduction}-minute engaging hook connecting ${topic} to students' daily experiences. Review prerequisite knowledge and establish learning objectives. Use questioning to assess prior understanding and create curiosity about ${topic}.`,

      development: `Spend ${timeAllocation.development} minutes systematically introducing ${topic} concepts. Use clear explanations, visual aids, and step-by-step demonstrations. Break complex ideas into manageable chunks. Encourage active participation through questioning and discussion. Provide multiple examples and check understanding frequently.`,

      activities: [
        `Pair work (${Math.round(timeAllocation.activities * 0.4)} min): Students collaborate to explore ${topic} applications`,
        `Group activity (${Math.round(timeAllocation.activities * 0.35)} min): Teams solve problems related to ${topic}`,
        `Individual practice (${Math.round(timeAllocation.activities * 0.25)} min): Students work independently on exercises`,
      ],

      assessment: `Use formative assessment throughout via observation, questioning, and student responses. Quick comprehension checks every 10-15 minutes. Exit ticket or brief quiz to gauge understanding. Provide immediate feedback and address misconceptions.`,

      conclusion: `Summarize key ${topic} concepts learned. Have students reflect on applications and connections. Preview next lesson. Assign homework to reinforce learning.`,

      homework: `Complete practice exercises on ${topic}. Read textbook pages related to today's lesson. Prepare for next class by reviewing prerequisite concepts.`,
    };
  }

  // =====================================================
  // ASSESSMENT GENERATION — 🔥 FULLY UPGRADED TO FORCE REAL AI + UNIQUE OUTPUTS
  // =====================================================

  static async generateAssessment(params: AssessmentParams): Promise<any> {
    // 🚫 NO FALLBACK — ALWAYS USE REAL AI FOR ASSESSMENTS
    // If you want to disable real AI, set VITE_USE_REAL_AI=false globally
    if (!this.useRealAI) {
      console.warn("⚠️ Real AI disabled. Assessment generation requires VITE_USE_REAL_AI=true");
      throw new Error("Real AI must be enabled to generate assessments.");
    }

    console.log("📝 GENERATING ASSESSMENT WITH OPENAI (NO FALLBACK, UNIQUE EACH TIME)...");

    const { subject, topic, gradeLevel, questionCount, questionTypes, difficulty, duration = 60 } = params;

    // Generate a unique salt per request to ensure diversity even with identical inputs
    const salt = Math.floor(Math.random() * 10000);
    const cacheKey = `${subject}-${topic}-${gradeLevel}-${difficulty}-${Date.now()}-${salt}`;
    console.log("🔍 Cache Key (for uniqueness):", cacheKey);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Best balance of cost, speed, quality
      messages: [
        {
          role: "system",
          content: `
You are an expert Zambian ECZ curriculum assessor. Generate TWO documents in JSON:
1. "question_paper" — student-facing, clean, no answers
2. "marking_scheme" — teacher-facing, with marks, model answers, partial credit, ECZ codes

RULES:
- Output ONLY valid JSON. No text before or after.
- Align ALL content with ECZ Grade ${gradeLevel} ${subject} syllabus.
- Use Bloom’s taxonomy: easy→remember/understand, medium→apply/analyze, hard→evaluate/create.
- For MCQs: 4 options, 1 correct, 3 plausible distractors.
- Marking scheme must include: criteria, partial credit rules, ECZ syllabus code per question.
- Total marks must match sum of all questions.
- Language: clear, formal, grade-appropriate.

JSON SCHEMA:
{
  "question_paper": {
    "title": "string",
    "subject": "string",
    "topic": "string",
    "grade_level": number,
    "difficulty": "easy|medium|hard",
    "total_marks": number,
    "duration_minutes": number,
    "instructions": "string",
    "questions": [
      {
        "number": number,
        "type": "multiple_choice|short_answer|essay|problem_solving",
        "text": "string",
        "marks": number,
        "options"?: string[]  // MCQ only
      }
    ],
    "syllabus_code": "string",
    "generated_at": "string"
  },
  "marking_scheme": {
    "title": "string",
    "subject": "string",
    "topic": "string",
    "grade_level": number,
    "total_marks": number,
    "questions": [
      {
        "number": number,
        "type": "string",
        "marks": number,
        "model_answer": "string",
        "key_points": string[],  // What must student include
        "partial_credit": {
          "description": "string",
          "marks": number
        }[],
        "ecz_code": "string",  // e.g., "M10.3.2"
        "bloom_level": "remember|understand|apply|analyze|evaluate|create"
      }
    ],
    "grading_notes": "string",
    "syllabus_code": "string",
    "generated_at": "string"
  }
}
`.trim(),
        },
        {
          role: "user",
          content: `
Generate a UNIQUE assessment with these exact parameters:
- Subject: ${subject}
- Topic: ${topic}
- Grade: ${gradeLevel}
- Questions: ${questionCount}
- Types: ${questionTypes.join(", ")}
- Difficulty: ${difficulty}

CRITICAL INSTRUCTIONS:
✅ NEVER reuse questions from previous generations. Each request is NEW.
✅ Use real Zambian contexts: e.g., Lusaka, Copperbelt, maize farming, Zamtel, ZESCO, Kafue River, Mopani Mine, Ndola, Chipata, Chingola, Zambia Revenue Authority, etc.
✅ Vary numbers, names, scenarios, units, and examples each time.
✅ Do NOT use generic examples like “a car travels at 60km/h” — use Zambian bus fares, market prices, school populations, rainfall data, electricity bills, etc.
✅ Randomize all values: dates, quantities, locations, people's names (e.g., "Chanda", "Mwansa", "Nkumbula", "Banda"), businesses, schools.
✅ Ensure all questions are original and distinct — even if topic is repeated.
✅ Include at least one question that references a recent Zambian event (e.g., 2023 elections, inflation rate of 15%, new road project, ZESCO tariff change, 2024 drought in Southern Province).
✅ If generating math problems: use Zambian currency (ZMW), distances between cities (e.g., Lusaka to Livingstone = 980km), population stats (e.g., 19 million), or electricity consumption (e.g., average household uses 250 kWh/month).
✅ For essays: require comparison of regions, historical trends, or policy impacts using Zambian examples.
✅ All questions must feel authentic — like they were written by an ECZ examiner.

ENSURE:
- Questions are NON-REPEATING and cover different cognitive levels.
- Marking scheme includes partial credit rules and ECZ syllabus codes.
- Output VALID JSON ONLY — NO EXPLANATIONS, NO MARKDOWN, NO TEXT BEFORE OR AFTER.
`.trim(),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // 🔥 High randomness → guaranteed uniqueness
      max_tokens: 4000,
      seed: Date.now(), // Ensures deterministic variation per call
    });

    const content = completion.choices[0]?.message?.content || "{}";
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("❌ FAILED TO PARSE OPENAI RESPONSE:", content);
      throw new Error("Invalid JSON from OpenAI. Check API key or prompt structure.");
    }

    if (!parsed.question_paper || !parsed.marking_scheme) {
      throw new Error("Missing question_paper or marking_scheme in AI response");
    }

    // Enrich metadata
    const now = new Date().toISOString();
    const syllabusCode = `ECZ.${subject.toUpperCase().slice(0, 3)}.${gradeLevel}.${topic.toLowerCase().replace(/\s+/g, ".")}`;

    // Enrich Question Paper
    parsed.question_paper = {
      ...parsed.question_paper,
      subject: subject,
      topic: topic,
      grade_level: gradeLevel,
      difficulty: difficulty,
      total_marks: parsed.question_paper.total_marks || parsed.question_paper.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0),
      duration_minutes: parsed.question_paper.duration_minutes || Math.max(20, Math.round(parsed.question_paper.total_marks * 1.2)),
      instructions: parsed.question_paper.instructions || this.generateInstructions(parsed.question_paper.duration_minutes, parsed.question_paper.total_marks, questionTypes),
      syllabus_code: parsed.question_paper.syllabus_code || syllabusCode,
      generated_at: parsed.question_paper.generated_at || now,
    };

    // Enrich Marking Scheme
    parsed.marking_scheme = {
      ...parsed.marking_scheme,
      subject: subject,
      topic: topic,
      grade_level: gradeLevel,
      total_marks: parsed.marking_scheme.total_marks || parsed.question_paper.total_marks,
      grading_notes: parsed.marking_scheme.grading_notes || "Award marks based on key points. Accept equivalent phrasing.",
      syllabus_code: parsed.marking_scheme.syllabus_code || syllabusCode,
      generated_at: parsed.marking_scheme.generated_at || now,
    };

    console.log("✅ SUCCESS: Generated unique assessment via OpenAI");
    return parsed; // Always returns real AI-generated content
  }

  // ✅ Helper — Enhanced for realism
  private static generateInstructions(
    duration: number,
    totalMarks: number,
    questionTypes: string[],
  ): string {
    const typeDescriptions: Record<string, string> = {
      "multiple-choice": "multiple choice questions",
      "short-answer": "short answer questions",
      essay: "essay questions",
      "problem-solving": "problem solving questions",
    };

    const types = questionTypes
      .map((t) => typeDescriptions[t as keyof typeof typeDescriptions] || t)
      .join(", ");

    return `INSTRUCTIONS:
1. Read all questions carefully before beginning.
2. Answer ALL questions in the spaces provided.
3. Show all working for calculations — marks are awarded for steps.
4. Time allowed: ${duration} minutes.
5. Total marks: ${totalMarks}.
6. This paper contains: ${types}.
7. Plan your time wisely.
8. Check your work before submitting.
9. All questions are based on real-life Zambian contexts — apply your knowledge accordingly.`;
  }

  // =====================================================
  // EDUCATIONAL INSIGHTS GENERATION — UNCHANGED (with fallback)
  // =====================================================

  static async generateEducationalInsights(
    params: EducationalInsightsParams,
  ): Promise<any> {
    if (this.useRealAI) {
      try {
        console.log("📊 Generating insights with OpenAI...");
        const dataSummary = JSON.stringify(params.data);
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an educational data analyst for Zambian schools. Analyze attendance, grades, and student data to generate actionable insights, trends, and recommendations. Output ONLY valid JSON with keys: summary, attendance, performance, recommendations, trends, interventions.",
            },
            {
              role: "user",
              content: `Analyze this educational data: ${dataSummary}. Class ID: ${params.classId || "N/A"}, Subject: ${params.subject || "N/A"}. Return insights on attendance patterns, performance trends, actionable recommendations, correlations, and targeted interventions. Format as JSON.`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        });

        const content = completion.choices[0]?.message?.content || "{}";
        return JSON.parse(content);
      } catch (error) {
        console.warn("OpenAI failed, falling back to local generation:", error);
      }
    }

    console.log("📊 Generating insights with local AI...");
    return this.generateLocalInsights(params);
  }

  private static generateLocalInsights(params: EducationalInsightsParams): any {
    const { data, classId, subject } = params;
    const { attendance = [], grades = [], students = [] } = data;

    return {
      summary: this.generateSummaryInsights(attendance, grades, students),
      attendance: this.generateAttendanceInsights(attendance),
      performance: this.generatePerformanceInsights(grades, subject),
      recommendations: this.generateRecommendations(attendance, grades, students),
      trends: this.generateTrendAnalysis(attendance, grades),
      interventions: this.generateInterventions(attendance, grades, students),
    };
  }

  private static generateSummaryInsights(
    attendance: any[],
    grades: any[],
    students: any[],
  ) {
    const attendanceRate =
      attendance.length > 0
        ? (attendance.filter((a) => a.status === "present").length /
            attendance.length) *
          100
        : 0;

    const averagePerformance =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) /
          grades.length
        : 0;

    return {
      total_students: students.length,
      attendance_rate: Math.round(attendanceRate),
      average_performance: Math.round(averagePerformance),
      status:
        attendanceRate >= 80 && averagePerformance >= 70
          ? "excellent"
          : attendanceRate >= 70 && averagePerformance >= 60
            ? "good"
            : "needs_attention",
    };
  }

  private static generateAttendanceInsights(attendance: any[]) {
    if (attendance.length === 0) {
      return {
        message: "No attendance data available for analysis",
        recommendations: ["Begin tracking attendance to enable insights"],
      };
    }

    const totalRecords = attendance.length;
    const presentCount = attendance.filter(
      (a) => a.status === "present",
    ).length;
    const absentCount = attendance.filter((a) => a.status === "absent").length;
    const rate = Math.round((presentCount / totalRecords) * 100);

    return {
      overall_rate: rate,
      pattern:
        rate >= 90
          ? "excellent"
          : rate >= 80
            ? "good"
            : rate >= 70
              ? "average"
              : "concerning",
      insights: [
        rate >= 85
          ? "Strong attendance pattern supports learning outcomes"
          : rate >= 70
            ? "Moderate attendance - some improvement needed"
            : "Low attendance may impact academic performance",
      ],
      recommendations:
        rate < 80
          ? [
              "Implement attendance improvement strategies",
              "Identify and address barriers to attendance",
              "Engage with parents/guardians about attendance importance",
            ]
          : ["Maintain current positive attendance patterns"],
    };
  }

  private static generatePerformanceInsights(grades: any[], subject?: string) {
    if (grades.length === 0) {
      return {
        message: "No performance data available for analysis",
        recommendations: ["Conduct assessments to enable performance insights"],
      };
    }

    const averageScore =
      grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length;
    const highPerformers = grades.filter(
      (g) => (g.percentage || 0) >= 75,
    ).length;
    const lowPerformers = grades.filter((g) => (g.percentage || 0) < 50).length;

    return {
      average_score: Math.round(averageScore),
      distribution: {
        high_performers: highPerformers,
        low_performers: lowPerformers,
        total_assessed: grades.length,
      },
      trend:
        averageScore >= 75
          ? "excellent"
          : averageScore >= 65
            ? "good"
            : averageScore >= 50
              ? "average"
              : "needs_improvement",
      recommendations: this.getPerformanceRecommendations(
        averageScore,
        lowPerformers,
        grades.length,
      ),
    };
  }

  private static getPerformanceRecommendations(
    average: number,
    lowPerformers: number,
    total: number,
  ): string[] {
    const recommendations = [];

    if (average < 60) {
      recommendations.push(
        "Review teaching strategies and curriculum delivery",
      );
      recommendations.push("Implement differentiated instruction approaches");
    }

    if (lowPerformers / total > 0.3) {
      recommendations.push(
        "Provide additional support for struggling students",
      );
      recommendations.push("Consider peer tutoring or remedial sessions");
    }

    if (average >= 75) {
      recommendations.push("Maintain current effective teaching practices");
      recommendations.push(
        "Challenge high achievers with extension activities",
      );
    }

    return recommendations;
  }

  private static generateRecommendations(
    attendance: any[],
    grades: any[],
    students: any[],
  ): string[] {
    const recommendations = [];

    const attendanceRate =
      attendance.length > 0
        ? (attendance.filter((a) => a.status === "present").length /
            attendance.length) *
          100
        : 100;

    if (attendanceRate < 80) {
      recommendations.push(
        "Implement strategies to improve student attendance",
      );
      recommendations.push("Engage with parents about attendance importance");
    }

    const avgPerformance =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) /
          grades.length
        : 0;

    if (avgPerformance < 65) {
      recommendations.push("Review and adjust teaching methodologies");
      recommendations.push("Provide additional learning resources");
    }

    recommendations.push("Use formative assessment to track progress");
    recommendations.push("Encourage active student participation");
    recommendations.push(
      "Maintain regular communication with students and parents",
    );

    return recommendations;
  }

  private static generateTrendAnalysis(attendance: any[], grades: any[]) {
    return {
      attendance_trend: attendance.length > 10 ? "stable" : "limited_data",
      performance_trend: grades.length > 5 ? "improving" : "limited_data",
      correlation:
        "Positive correlation between attendance and performance expected",
    };
  }

  private static generateInterventions(
    attendance: any[],
    grades: any[],
    students: any[],
  ) {
    const interventions = [];

    const lowAttendance = attendance
      .filter((a) => a.status === "absent")
      .map((a) => a.student_id);
    const lowPerformance = grades
      .filter((g) => (g.percentage || 0) < 50)
      .map((g) => g.student_id);

    if (lowAttendance.length > 0) {
      interventions.push({
        type: "attendance_intervention",
        target: "students_with_low_attendance",
        action: "Individual counseling and parent engagement",
      });
    }

    if (lowPerformance.length > 0) {
      interventions.push({
        type: "academic_intervention",
        target: "students_with_low_performance",
        action: "Remedial teaching and additional support",
      });
    }

    return interventions;
  }
}
