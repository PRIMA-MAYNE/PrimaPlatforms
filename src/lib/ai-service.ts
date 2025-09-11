// Intelligent AI Service - OpenAI Direct + Local Fallback
// Real AI via direct OpenAI API with local fallback for reliability

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

  // Educational content templates for rapid generation
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
  // LESSON PLAN GENERATION
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
  // ASSESSMENT GENERATION — ✅ UPDATED FOR DUAL OUTPUT + GPT-4O-MINI
  // =====================================================

  static async generateAssessment(params: AssessmentParams): Promise<any> {
    if (this.useRealAI) {
      try {
        console.log("📝 Generating assessment with GPT-4o-mini...");

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // ✅ Cost-optimized, high quality
          messages: [
            {
              role: "system",
              content: `
You are an expert Zambian ECZ curriculum assessor. Generate TWO documents in JSON:
1. "question_paper" — student-facing, clean, no answers
2. "marking_scheme" — teacher-facing, with marks, model answers, partial credit, ECZ codes

RULES:
- Output ONLY valid JSON. No text before or after.
- Align ALL content with ECZ Grade ${params.gradeLevel} ${params.subject} syllabus.
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
    "grading_notes": "string",  // General advice for markers
    "syllabus_code": "string",
    "generated_at": "string"
  }
}
`.trim(),
            },
            {
              role: "user",
              content: `
Generate assessment:
- Subject: ${params.subject}
- Topic: ${params.topic}
- Grade: ${params.gradeLevel}
- Questions: ${params.questionCount}
- Types: ${params.questionTypes.join(", ")}
- Difficulty: ${params.difficulty}

ENSURE:
- Questions are NON-REPEATING and cover different cognitive levels.
- Marking scheme includes partial credit rules and ECZ syllabus codes.
- Use real Zambian curriculum context where possible.
- Output VALID JSON ONLY.
`.trim(),
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2, // More deterministic = better for exams
          max_tokens: 4000,
        });

        const content = completion.choices[0]?.message?.content || "{}";
        let parsed;

        try {
          parsed = JSON.parse(content);
        } catch (e) {
          console.error("Failed to parse AI response:", content);
          throw new Error("Invalid JSON from AI");
        }

        // Validate structure
        if (!parsed.question_paper || !parsed.marking_scheme) {
          throw new Error("Missing question_paper or marking_scheme in AI response");
        }

        // Normalize and enrich
        const now = new Date().toISOString();
        const syllabusCode = `ECZ.${params.subject.toUpperCase().slice(0, 3)}.${params.gradeLevel}.${params.topic
          .toLowerCase()
          .replace(/\s+/g, ".")}`;

        // Enrich Question Paper
        parsed.question_paper = {
          ...parsed.question_paper,
          subject: params.subject,
          topic: params.topic,
          grade_level: params.gradeLevel,
          difficulty: params.difficulty,
          total_marks: parsed.question_paper.total_marks || parsed.question_paper.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0),
          duration_minutes: parsed.question_paper.duration_minutes || Math.max(20, Math.round(parsed.question_paper.total_marks * 1.2)),
          instructions: parsed.question_paper.instructions || this.generateInstructions(parsed.question_paper.duration_minutes, parsed.question_paper.total_marks, params.questionTypes),
          syllabus_code: parsed.question_paper.syllabus_code || syllabusCode,
          generated_at: parsed.question_paper.generated_at || now,
        };

        // Enrich Marking Scheme
        parsed.marking_scheme = {
          ...parsed.marking_scheme,
          subject: params.subject,
          topic: params.topic,
          grade_level: params.gradeLevel,
          total_marks: parsed.marking_scheme.total_marks || parsed.question_paper.total_marks,
          grading_notes: parsed.marking_scheme.grading_notes || "Award marks based on key points. Be consistent across scripts. Accept equivalent phrasing.",
          syllabus_code: parsed.marking_scheme.syllabus_code || syllabusCode,
          generated_at: parsed.marking_scheme.generated_at || now,
        };

        return parsed; // ✅ { question_paper, marking_scheme }
      } catch (error) {
        console.warn("GPT-4o-mini failed:", error);
        // Fall through to local generation
      }
    }

    console.log("📝 Generating assessment with local AI...");
    return this.generateLocalAssessmentWithScheme(params);
  }

  // ✅ NEW: Local fallback that matches dual-document structure
  private static generateLocalAssessmentWithScheme(params: AssessmentParams): any {
    const {
      subject,
      topic,
      gradeLevel,
      questionCount,
      questionTypes,
      difficulty,
      duration = 60,
    } = params;

    const questions = this.generateQuestions(subject, topic, gradeLevel, questionCount, questionTypes, difficulty);
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const syllabusCode = `ECZ.${subject.toUpperCase().slice(0, 3)}.${gradeLevel}.${topic.toLowerCase().replace(/\s+/g, ".")}`;
    const now = new Date().toISOString();

    // Build Question Paper (student view)
    const questionPaper = {
      title: `${subject} Assessment: ${topic}`,
      subject: subject,
      topic: topic,
      grade_level: gradeLevel,
      difficulty: difficulty,
      total_marks: totalMarks,
      duration_minutes: duration,
      instructions: this.generateInstructions(duration, totalMarks, questionTypes),
      questions: questions.map((q, idx) => ({
        number: idx + 1,
        type: q.question_type,
        text: q.question_text,
        marks: q.marks,
        options: q.options, // only present for MCQ
      })),
      syllabus_code: syllabusCode,
      generated_at: now,
    };

    // Build Marking Scheme (teacher view)
    const markingScheme = {
      title: `${subject} Marking Scheme: ${topic}`,
      subject: subject,
      topic: topic,
      grade_level: gradeLevel,
      total_marks: totalMarks,
      questions: questions.map((q, idx) => ({
        number: idx + 1,
        type: q.question_type,
        marks: q.marks,
        model_answer: q.correct_answer,
        key_points: this.extractKeyPoints(q.correct_answer),
        partial_credit: this.generatePartialCredit(q.marks, q.question_type),
        ecz_code: `${syllabusCode}.Q${idx + 1}`,
        bloom_level: q.bloom_taxonomy_level || this.getDefaultBloomLevel(difficulty),
      })),
      grading_notes: "Award marks for key concepts. Accept equivalent phrasing. Be consistent.",
      syllabus_code: syllabusCode,
      generated_at: now,
    };

    return { question_paper: questionPaper, marking_scheme: markingScheme };
  }

  // ✅ NEW HELPERS FOR MARKING SCHEME
  private static extractKeyPoints(answer: string): string[] {
    return answer
      .split(/\. |\? |\! /)
      .filter(s => s.length > 10 && !s.includes("Example:") && !s.includes("e.g."))
      .slice(0, 3)
      .map(s => s.trim() + ".");
  }

  private static generatePartialCredit(maxMarks: number, type: string): { description: string; marks: number }[] {
    if (type === "multiple_choice") {
      return []; // No partial credit
    }
    if (maxMarks <= 3) {
      return [{ description: "Partially correct or missing key detail", marks: 1 }];
    }
    return [
      { description: "Correct method, minor calculation error", marks: Math.max(1, Math.floor(maxMarks * 0.7)) },
      { description: "Partial solution with relevant steps", marks: Math.max(1, Math.floor(maxMarks * 0.4)) },
      { description: "Attempt shown with correct formula or concept", marks: 1 },
    ];
  }

  // ✅ Helper to map difficulty to Bloom’s level
  private static getDefaultBloomLevel(difficulty: string): string {
    switch (difficulty) {
      case "easy": return "remember";
      case "medium": return "apply";
      case "hard": return "evaluate";
      default: return "understand";
    }
  }

  // Existing question generators — slightly enhanced
  private static generateQuestions(
    subject: string,
    topic: string,
    gradeLevel: number,
    count: number,
    types: string[],
    difficulty: string,
  ) {
    const questions = [];
    const typeDistribution = this.distributeQuestionTypes(types, count);

    let questionNumber = 1;

    for (let i = 0; i < typeDistribution.multiple_choice; i++) {
      questions.push(
        this.generateMCQ(subject, topic, gradeLevel, questionNumber++, difficulty),
      );
    }

    for (let i = 0; i < typeDistribution.short_answer; i++) {
      questions.push(
        this.generateShortAnswer(subject, topic, gradeLevel, questionNumber++, difficulty),
      );
    }

    for (let i = 0; i < typeDistribution.essay; i++) {
      questions.push(
        this.generateEssay(subject, topic, gradeLevel, questionNumber++, difficulty),
      );
    }

    for (let i = 0; i < typeDistribution.problem_solving; i++) {
      questions.push(
        this.generateProblemSolving(subject, topic, gradeLevel, questionNumber++, difficulty),
      );
    }

    return questions;
  }

  private static distributeQuestionTypes(types: string[], total: number) {
    const distribution: { [key: string]: number } = {
      multiple_choice: 0,
      short_answer: 0,
      essay: 0,
      problem_solving: 0,
    };

    if (types.length === 0) {
      distribution.multiple_choice = Math.ceil(total * 0.5);
      distribution.short_answer = Math.ceil(total * 0.3);
      distribution.essay = Math.floor(total * 0.2);
      return distribution;
    }

    const perType = Math.floor(total / types.length);
    const remainder = total % types.length;

    types.forEach((type, index) => {
      const key = type.replace("-", "_");
      distribution[key] = perType + (index < remainder ? 1 : 0);
    });

    return distribution;
  }

  private static generateMCQ(
    subject: string,
    topic: string,
    gradeLevel: number,
    questionNumber: number,
    difficulty: string,
  ) {
    const marks = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;

    const correct = `Correct understanding of ${topic} in ${subject}`;
    const distractors = [
      `Common misconception about ${topic}`,
      `Overgeneralization not applicable at Grade ${gradeLevel}`,
      `Advanced concept beyond current syllabus`,
    ].sort(() => Math.random() - 0.5);

    const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

    return {
      question_number: questionNumber,
      question_type: "multiple_choice",
      question_text: `Which of the following best describes ${topic} in ${subject} at Grade ${gradeLevel} level?`,
      marks: marks,
      options: options,
      correct_answer: correct,
      answer_explanation: `This aligns with ECZ curriculum standards. Other options reflect common student errors.`,
      bloom_taxonomy_level: this.getDefaultBloomLevel(difficulty),
    };
  }

  private static generateShortAnswer(
    subject: string,
    topic: string,
    gradeLevel: number,
    questionNumber: number,
    difficulty: string,
  ) {
    const marks = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;

    return {
      question_number: questionNumber,
      question_type: "short_answer",
      question_text: `Explain how ${topic} is applied in real-life Zambian contexts. Provide one specific example.`,
      marks: marks,
      correct_answer: `Students should explain the core concept of ${topic} and provide a relevant Zambian example such as usage in local agriculture, business, or community planning.`,
      answer_explanation: `Full marks require both conceptual understanding and practical application. Partial credit for either component.`,
      bloom_taxonomy_level: difficulty === "easy" ? "understand" : difficulty === "medium" ? "apply" : "analyze",
    };
  }

  private static generateEssay(
    subject: string,
    topic: string,
    gradeLevel: number,
    questionNumber: number,
    difficulty: string,
  ) {
    const marks = difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;

    return {
      question_number: questionNumber,
      question_type: "essay",
      question_text: `Discuss the significance of ${topic} in modern ${subject}. Include historical context, current applications in Zambia, and future implications for students. Support with curriculum examples.`,
      marks: marks,
      correct_answer: `A comprehensive essay should: 1) Define ${topic} accurately, 2) Provide historical development, 3) Give 2-3 current Zambian applications, 4) Discuss future relevance to careers, 5) Use ECZ curriculum examples throughout.`,
      answer_explanation: `Assessed on: knowledge (30%), analysis (40%), structure (20%), relevance (10%). ECZ extended response rubric applies.`,
      bloom_taxonomy_level: difficulty === "easy" ? "apply" : difficulty === "medium" ? "analyze" : "evaluate",
    };
  }

  private static generateProblemSolving(
    subject: string,
    topic: string,
    gradeLevel: number,
    questionNumber: number,
    difficulty: string,
  ) {
    const marks = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12;

    return {
      question_number: questionNumber,
      question_type: "problem_solving",
      question_text: `A Zambian business uses ${topic} to calculate [real-world scenario]. Determine [required value] and explain your reasoning step by step.`,
      marks: marks,
      correct_answer: `Step 1: Identify given values... Step 2: Apply ${topic} principle... Step 3: Calculate... Step 4: Verify units and context... Final answer: [value with units]`,
      answer_explanation: `Marks awarded for: correct formula (2), substitution (2), calculation (2), explanation (2), final answer with units (2). ECZ problem-solving rubric applies.`,
      bloom_taxonomy_level: difficulty === "easy" ? "apply" : difficulty === "medium" ? "analyze" : "create",
    };
  }

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
8. Check your work before submitting.`;
  }

  // =====================================================
  // EDUCATIONAL INSIGHTS GENERATION
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
              content: `Analyze this educational  ${dataSummary}. Class ID: ${params.classId || "N/A"}, Subject: ${params.subject || "N/A"}. Return insights on attendance patterns, performance trends, actionable recommendations, correlations, and targeted interventions. Format as JSON.`,
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
