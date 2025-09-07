// Demo Data Population Service
// Creates comprehensive demo data for system inspection

import { supabase } from "./supabase";

export class DemoDataService {
  private static readonly DEMO_SCHOOL_ID =
    "11111111-1111-1111-1111-111111111111";

  static async populateDemoData(userId: string): Promise<void> {
    try {
      console.log("🎓 Populating demo data for user:", userId);

      // Check if demo data already exists
      const { data: existingClasses } = await supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", userId)
        .limit(1);

      if (existingClasses && existingClasses.length > 0) {
        console.log("✅ Demo data already exists, skipping population");
        return;
      }

      // Create demo classes
      const classes = await this.createDemoClasses(userId);

      // Create demo students
      const students = await this.createDemoStudents(classes);

      // Create demo lesson plans
      await this.createDemoLessonPlans(userId, classes);

      // Create demo assessments
      const assessments = await this.createDemoAssessments(userId, classes);

      // Create demo student assessments
      await this.createDemoStudentAssessments(assessments, students, userId);

      // Create demo attendance records
      await this.createDemoAttendance(students, classes, userId);

      // Create demo notifications
      await this.createDemoNotifications(userId);

      console.log("✅ Demo data population complete");
    } catch (error) {
      console.error("❌ Demo data population failed:", error);
      throw error;
    }
  }

  private static async createDemoClasses(userId: string) {
    const classes = [
      {
        name: "Grade 10 Mathematics",
        grade_level: 10,
        section: "A",
        subject: "Mathematics",
        teacher_id: userId,
        school_id: this.DEMO_SCHOOL_ID,
        academic_year: "2024",
        capacity: 35,
      },
      {
        name: "Grade 10 English",
        grade_level: 10,
        section: "A",
        subject: "English",
        teacher_id: userId,
        school_id: this.DEMO_SCHOOL_ID,
        academic_year: "2024",
        capacity: 35,
      },
      {
        name: "Grade 9 Science",
        grade_level: 9,
        section: "B",
        subject: "Science",
        teacher_id: userId,
        school_id: this.DEMO_SCHOOL_ID,
        academic_year: "2024",
        capacity: 30,
      },
    ];

    const { data: createdClasses, error } = await supabase
      .from("classes")
      .insert(classes)
      .select();

    if (error) throw error;
    return createdClasses || [];
  }

  private static async createDemoStudents(classes: any[]) {
    const mathClass = classes.find((c) => c.subject === "Mathematics");
    const englishClass = classes.find((c) => c.subject === "English");
    const scienceClass = classes.find((c) => c.subject === "Science");

    const students = [
      // Math class students
      {
        student_id: "STU001",
        first_name: "Chipo",
        last_name: "Mwamba",
        date_of_birth: "2008-03-15",
        gender: "female",
        class_id: mathClass?.id,
        parent_guardian_name: "Mr. John Mwamba",
        parent_guardian_phone: "+260-97-1111111",
        school_id: this.DEMO_SCHOOL_ID,
      },
      {
        student_id: "STU002",
        first_name: "Temba",
        last_name: "Banda",
        date_of_birth: "2008-07-22",
        gender: "male",
        class_id: mathClass?.id,
        parent_guardian_name: "Mrs. Grace Banda",
        parent_guardian_phone: "+260-97-2222222",
        school_id: this.DEMO_SCHOOL_ID,
      },
      {
        student_id: "STU003",
        first_name: "Mutinta",
        last_name: "Phiri",
        date_of_birth: "2008-11-08",
        gender: "female",
        class_id: mathClass?.id,
        parent_guardian_name: "Mr. Peter Phiri",
        parent_guardian_phone: "+260-97-3333333",
        school_id: this.DEMO_SCHOOL_ID,
      },
      {
        student_id: "STU004",
        first_name: "Bwalya",
        last_name: "Kasonde",
        date_of_birth: "2008-01-30",
        gender: "male",
        class_id: mathClass?.id,
        parent_guardian_name: "Mrs. Mary Kasonde",
        parent_guardian_phone: "+260-97-4444444",
        school_id: this.DEMO_SCHOOL_ID,
      },
      {
        student_id: "STU005",
        first_name: "Natasha",
        last_name: "Zimba",
        date_of_birth: "2008-09-12",
        gender: "female",
        class_id: mathClass?.id,
        parent_guardian_name: "Mr. David Zimba",
        parent_guardian_phone: "+260-97-5555555",
        school_id: this.DEMO_SCHOOL_ID,
      },

      // English class students (some overlap)
      {
        student_id: "STU006",
        first_name: "Moses",
        last_name: "Lungu",
        date_of_birth: "2008-05-18",
        gender: "male",
        class_id: englishClass?.id,
        parent_guardian_name: "Mrs. Ruth Lungu",
        parent_guardian_phone: "+260-97-6666666",
        school_id: this.DEMO_SCHOOL_ID,
      },
      {
        student_id: "STU007",
        first_name: "Prisca",
        last_name: "Mulenga",
        date_of_birth: "2008-12-03",
        gender: "female",
        class_id: englishClass?.id,
        parent_guardian_name: "Mr. James Mulenga",
        parent_guardian_phone: "+260-97-7777777",
        school_id: this.DEMO_SCHOOL_ID,
      },

      // Science class students
      {
        student_id: "STU008",
        first_name: "Emmanuel",
        last_name: "Simukanga",
        date_of_birth: "2009-02-14",
        gender: "male",
        class_id: scienceClass?.id,
        parent_guardian_name: "Mrs. Joyce Simukanga",
        parent_guardian_phone: "+260-97-8888888",
        school_id: this.DEMO_SCHOOL_ID,
      },
      {
        student_id: "STU009",
        first_name: "Mercy",
        last_name: "Chanda",
        date_of_birth: "2009-08-25",
        gender: "female",
        class_id: scienceClass?.id,
        parent_guardian_name: "Mr. Patrick Chanda",
        parent_guardian_phone: "+260-97-9999999",
        school_id: this.DEMO_SCHOOL_ID,
      },
      {
        student_id: "STU010",
        first_name: "Felix",
        last_name: "Mvula",
        date_of_birth: "2009-04-09",
        gender: "male",
        class_id: scienceClass?.id,
        parent_guardian_name: "Mrs. Catherine Mvula",
        parent_guardian_phone: "+260-97-0000000",
        school_id: this.DEMO_SCHOOL_ID,
      },
    ];

    const { data: createdStudents, error } = await supabase
      .from("students")
      .insert(students)
      .select();

    if (error) throw error;
    return createdStudents || [];
  }

  private static async createDemoLessonPlans(userId: string, classes: any[]) {
    const mathClass = classes.find((c) => c.subject === "Mathematics");
    const englishClass = classes.find((c) => c.subject === "English");

    const lessonPlans = [
      {
        title: "Quadratic Equations - Solving by Factoring",
        subject: "Mathematics",
        topic: "Quadratic Equations",
        grade_level: 10,
        duration_minutes: 80,
        objectives: [
          "Students will understand the concept of quadratic equations",
          "Students will solve quadratic equations by factoring",
          "Students will apply factoring to real-world problems",
        ],
        materials: [
          "Whiteboard and markers",
          "Scientific calculators",
          "Graph paper",
          "Mathematics textbooks",
        ],
        introduction:
          "Begin with a review of linear equations and introduce quadratic equations through real-world examples like projectile motion and area problems.",
        lesson_development:
          "Systematically teach the standard form ax² + bx + c = 0, demonstrate factoring techniques including common factors, difference of squares, and trinomial factoring.",
        activities: [
          "Pair work: Factor given quadratic expressions",
          "Group activity: Solve quadratic word problems",
          "Individual practice: Complete factoring exercises",
        ],
        assessment:
          "Formative assessment through questioning and observation. Exit ticket with 3 factoring problems to assess understanding.",
        conclusion:
          "Summarize key factoring techniques and preview next lesson on completing the square method.",
        homework: "Complete exercises 1-20 from textbook page 156",
        syllabi_alignment:
          "ECZ Mathematics Syllabus - Grade 10 - Topic: Algebra",
        teacher_id: userId,
        class_id: mathClass?.id,
        ai_generated: true,
        ai_model: "AI",
        status: "approved",
      },
      {
        title: "Narrative Writing - Character Development",
        subject: "English",
        topic: "Creative Writing",
        grade_level: 10,
        duration_minutes: 60,
        objectives: [
          "Students will understand character development techniques",
          "Students will create compelling characters for narratives",
          "Students will write character descriptions",
        ],
        materials: [
          "Writing materials",
          "Character development worksheets",
          "Sample narratives",
        ],
        introduction:
          "Discuss famous characters from Zambian literature and analyze what makes them memorable.",
        lesson_development:
          "Explore character development techniques: backstory, motivation, conflict, and growth. Analyze examples from prescribed texts.",
        activities: [
          "Individual: Create a character profile",
          "Pair work: Share and improve characters",
          "Class discussion: Character motivation",
        ],
        assessment:
          "Students present their character and explain development choices.",
        conclusion:
          "Review key character development elements and assign narrative writing task.",
        homework:
          "Write a 500-word narrative featuring your developed character",
        syllabi_alignment:
          "ECZ English Syllabus - Grade 10 - Topic: Creative Writing",
        teacher_id: userId,
        class_id: englishClass?.id,
        ai_generated: true,
        ai_model: "AI",
        status: "taught",
      },
    ];

    const { error } = await supabase.from("lesson_plans").insert(lessonPlans);

    if (error) throw error;
  }

  private static async createDemoAssessments(userId: string, classes: any[]) {
    const mathClass = classes.find((c) => c.subject === "Mathematics");

    const assessments = [
      {
        title: "Quadratic Equations Test",
        subject: "Mathematics",
        topic: "Quadratic Equations",
        grade_level: 10,
        difficulty_level: "medium",
        total_marks: 50,
        duration_minutes: 60,
        instructions:
          "Read all questions carefully. Show your working for all calculations. Time allowed: 60 minutes. Total marks: 50 points.",
        teacher_id: userId,
        class_id: mathClass?.id,
        assessment_type: "test",
        ai_generated: true,
        ai_model: "AI",
        status: "conducted",
        syllabi_alignment: "ECZ Mathematics Syllabus - Grade 10",
      },
    ];

    const { data: createdAssessments, error } = await supabase
      .from("assessments")
      .insert(assessments)
      .select();

    if (error) throw error;

    // Add assessment questions
    if (createdAssessments && createdAssessments.length > 0) {
      const assessmentId = createdAssessments[0].id;

      const questions = [
        {
          assessment_id: assessmentId,
          question_number: 1,
          question_type: "multiple_choice",
          question_text:
            "Which of the following is the standard form of a quadratic equation?",
          marks: 5,
          options: [
            "ax + b = 0",
            "ax² + bx + c = 0",
            "ax³ + bx² + cx + d = 0",
            "ax + by = c",
          ],
          correct_answer: "ax² + bx + c = 0",
          answer_explanation:
            "The standard form includes a squared term (ax²), linear term (bx), and constant (c).",
          bloom_taxonomy_level: "remember",
        },
        {
          assessment_id: assessmentId,
          question_number: 2,
          question_type: "short_answer",
          question_text: "Factor completely: x² - 9",
          marks: 8,
          correct_answer: "x² - 9 = (x + 3)(x - 3)",
          answer_explanation:
            "This is a difference of squares: a² - b² = (a + b)(a - b)",
          bloom_taxonomy_level: "apply",
        },
        {
          assessment_id: assessmentId,
          question_number: 3,
          question_type: "problem_solving",
          question_text: "Solve by factoring: x² + 5x + 6 = 0",
          marks: 12,
          correct_answer: "x = -2 or x = -3",
          answer_explanation:
            "Factor as (x + 2)(x + 3) = 0, then set each factor equal to zero.",
          bloom_taxonomy_level: "apply",
        },
      ];

      await supabase.from("assessment_questions").insert(questions);
    }

    return createdAssessments || [];
  }

  private static async createDemoStudentAssessments(
    assessments: any[],
    students: any[],
    userId: string,
  ) {
    if (assessments.length === 0 || students.length === 0) return;

    const assessment = assessments[0];
    const mathStudents = students.filter(
      (s) =>
        s.student_id.startsWith("STU00") &&
        ["STU001", "STU002", "STU003", "STU004", "STU005"].includes(
          s.student_id,
        ),
    );

    const studentAssessments = mathStudents.map((student) => ({
      assessment_id: assessment.id,
      student_id: student.id,
      score: Math.floor(Math.random() * 20) + 30, // Random score between 30-50
      max_score: 50,
      grade: this.calculateGrade(Math.floor(Math.random() * 20) + 30),
      comments: this.getRandomComment(),
      graded_by: userId,
      graded_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("student_assessments")
      .insert(studentAssessments);

    if (error) throw error;
  }

  private static async createDemoAttendance(
    students: any[],
    classes: any[],
    userId: string,
  ) {
    const attendanceRecords = [];
    const mathClass = classes.find((c) => c.subject === "Mathematics");

    if (!mathClass) return;

    const mathStudents = students.filter((s) => s.class_id === mathClass.id);

    // Generate attendance for last 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      mathStudents.forEach((student) => {
        const attendanceStatus =
          Math.random() < 0.85
            ? "present"
            : Math.random() < 0.95
              ? "late"
              : "absent";

        attendanceRecords.push({
          student_id: student.id,
          class_id: mathClass.id,
          date: date.toISOString().split("T")[0],
          status: attendanceStatus,
          marked_by: userId,
          time_in: attendanceStatus !== "absent" ? "08:00:00" : null,
        });
      });
    }

    const { error } = await supabase
      .from("attendance")
      .insert(attendanceRecords);

    if (error) throw error;
  }

  private static async createDemoNotifications(userId: string) {
    const notifications = [
      {
        recipient_id: userId,
        sender_id: userId,
        type: "system",
        title: "Welcome to Catalyst Demo!",
        message:
          "Your demo account is ready with sample data. Explore all features including AI-powered lesson planning and assessments.",
        priority: "high",
      },
      {
        recipient_id: userId,
        sender_id: userId,
        type: "assessment_created",
        title: "Assessment Graded",
        message:
          "Quadratic Equations Test has been graded for Grade 10 Mathematics. Average score: 78%",
        priority: "normal",
      },
      {
        recipient_id: userId,
        sender_id: userId,
        type: "attendance_alert",
        title: "Attendance Summary",
        message:
          "Daily attendance has been recorded. Class average: 87% present.",
        priority: "low",
      },
    ];

    const { error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) throw error;
  }

  private static calculateGrade(score: number): string {
    if (score >= 45) return "A";
    if (score >= 40) return "B";
    if (score >= 35) return "C";
    if (score >= 30) return "D";
    return "F";
  }

  private static getRandomComment(): string {
    const comments = [
      "Good understanding of factoring concepts. Keep practicing!",
      "Shows improvement in problem-solving. Work on accuracy.",
      "Excellent work on quadratic equations. Ready for advanced topics.",
      "Need more practice with basic factoring techniques.",
      "Strong mathematical reasoning. Polish computational skills.",
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
}
