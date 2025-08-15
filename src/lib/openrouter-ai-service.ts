// OpenRouter DeepSeek AI Service - Real AI Integration for Catalyst Education
// Uses DeepSeek R1 model via OpenRouter API for educational content generation

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

export class OpenRouterAIService {
  private static readonly API_KEY = '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';
  private static readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly MODEL = 'deepseek/deepseek-r1';

  // =====================================================
  // CORE API COMMUNICATION
  // =====================================================

  private static async makeAPICall(prompt: string, systemPrompt: string): Promise<any> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Catalyst Educational Management System'
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      // Fallback to local AI service if API fails
      throw new Error(`AI service temporarily unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // =====================================================
  // LESSON PLAN GENERATION
  // =====================================================

  static async generateLessonPlan(params: LessonPlanParams): Promise<any> {
    const { subject, topic, gradeLevel, duration } = params;

    const systemPrompt = `You are an expert educational content creator specializing in the Zambian ECZ (Examinations Council of Zambia) curriculum. You create comprehensive, practical lesson plans that are:

1. ECZ curriculum compliant for the specified grade level
2. Culturally relevant to Zambian students
3. Practical and implementable in resource-limited environments
4. Aligned with Bloom's taxonomy
5. Inclusive and differentiated for diverse learners

Always respond with a properly formatted JSON object containing all required lesson plan fields.`;

    const userPrompt = `Create a comprehensive lesson plan for:

Subject: ${subject}
Topic: ${topic}
Grade Level: ${gradeLevel}
Duration: ${duration} minutes

Requirements:
- Follow ECZ curriculum standards for Grade ${gradeLevel}
- Include clear learning objectives (3-4 objectives)
- Provide practical materials list suitable for Zambian schools
- Create engaging introduction, development, and conclusion sections
- Include varied student activities (individual, pair, group work)
- Suggest appropriate assessment methods
- Add relevant homework assignments
- Consider local context and available resources

Return response as a JSON object with these exact fields:
{
  "title": "lesson title",
  "subject": "${subject}",
  "topic": "${topic}", 
  "grade_level": ${gradeLevel},
  "duration_minutes": ${duration},
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "materials": ["material 1", "material 2"],
  "introduction": "introduction text",
  "lesson_development": "main lesson content",
  "activities": ["activity 1", "activity 2"],
  "assessment": "assessment methods",
  "conclusion": "lesson conclusion",
  "homework": "homework assignment",
  "notes": "additional notes",
  "syllabi_alignment": "ECZ curriculum reference",
  "ecz_compliance": true,
  "generated_at": "current ISO timestamp"
}`;

    try {
      const aiResponse = await this.makeAPICall(userPrompt, systemPrompt);
      
      // Parse JSON response
      const lessonPlan = JSON.parse(aiResponse);
      
      // Validate and ensure all required fields
      const validatedPlan = {
        title: lessonPlan.title || `${subject}: ${topic}`,
        subject: subject,
        topic: topic,
        grade_level: gradeLevel,
        duration_minutes: duration,
        objectives: lessonPlan.objectives || [`Students will understand key concepts of ${topic}`],
        materials: lessonPlan.materials || ['Whiteboard', 'Textbooks', 'Exercise books'],
        introduction: lessonPlan.introduction || `Introduction to ${topic}`,
        lesson_development: lessonPlan.lesson_development || `Main content for ${topic}`,
        activities: lessonPlan.activities || [`Practice activities for ${topic}`],
        assessment: lessonPlan.assessment || 'Formative assessment through questioning',
        conclusion: lessonPlan.conclusion || `Summary of ${topic} concepts`,
        homework: lessonPlan.homework || `Review ${topic} concepts`,
        notes: lessonPlan.notes || `ECZ-aligned lesson for Grade ${gradeLevel}`,
        syllabi_alignment: lessonPlan.syllabi_alignment || `ECZ ${subject} Syllabus - Grade ${gradeLevel}`,
        ecz_compliance: true,
        generated_at: new Date().toISOString(),
        ai_generated: true,
        ai_model: 'DeepSeek R1 via OpenRouter'
      };

      return validatedPlan;
    } catch (error) {
      console.error('Lesson plan generation failed:', error);
      // Return fallback lesson plan
      return this.getFallbackLessonPlan(params);
    }
  }

  // =====================================================
  // ASSESSMENT GENERATION
  // =====================================================

  static async generateAssessment(params: AssessmentParams): Promise<any> {
    const { subject, topic, gradeLevel, questionCount, questionTypes, difficulty, duration = 60 } = params;

    const systemPrompt = `You are an expert assessment creator for the Zambian ECZ (Examinations Council of Zambia) curriculum. You create high-quality, ECZ-compliant assessments that:

1. Follow ECZ examination formats and standards
2. Use appropriate cognitive levels (Bloom's taxonomy)
3. Include clear marking schemes
4. Are culturally relevant to Zambian students
5. Match the specified difficulty level
6. Cover the required topic comprehensively

Always respond with a properly formatted JSON object.`;

    const userPrompt = `Create a comprehensive assessment for:

Subject: ${subject}
Topic: ${topic}
Grade Level: ${gradeLevel}
Number of Questions: ${questionCount}
Question Types: ${questionTypes.join(', ')}
Difficulty Level: ${difficulty}
Duration: ${duration} minutes

Requirements:
- Follow ECZ assessment standards for Grade ${gradeLevel}
- Create ${questionCount} questions distributed across the specified types
- Include clear marking criteria for each question
- Provide model answers and explanations
- Use appropriate cognitive levels based on difficulty
- Include proper assessment instructions
- Calculate total marks appropriately

Return response as a JSON object with these exact fields:
{
  "title": "assessment title",
  "subject": "${subject}",
  "topic": "${topic}",
  "grade_level": ${gradeLevel},
  "difficulty_level": "${difficulty}",
  "total_marks": 100,
  "duration_minutes": ${duration},
  "instructions": "detailed instructions",
  "questions": [
    {
      "question_number": 1,
      "question_type": "multiple_choice",
      "question_text": "question text",
      "marks": 2,
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "answer_explanation": "explanation",
      "bloom_taxonomy_level": "understand"
    }
  ],
  "assessment_type": "test",
  "syllabi_alignment": "ECZ curriculum reference",
  "ecz_compliance": true,
  "generated_at": "current ISO timestamp"
}`;

    try {
      const aiResponse = await this.makeAPICall(userPrompt, systemPrompt);
      const assessment = JSON.parse(aiResponse);
      
      // Validate and ensure all required fields
      const validatedAssessment = {
        title: assessment.title || `${subject} Assessment: ${topic}`,
        subject: subject,
        topic: topic,
        grade_level: gradeLevel,
        difficulty_level: difficulty,
        total_marks: assessment.total_marks || questionCount * 5,
        duration_minutes: duration,
        instructions: assessment.instructions || this.getDefaultInstructions(duration),
        questions: assessment.questions || this.getFallbackQuestions(questionCount, questionTypes),
        assessment_type: assessment.total_marks > 50 ? 'exam' : 'test',
        syllabi_alignment: assessment.syllabi_alignment || `ECZ ${subject} Syllabus - Grade ${gradeLevel}`,
        ecz_compliance: true,
        generated_at: new Date().toISOString(),
        ai_generated: true,
        ai_model: 'DeepSeek R1 via OpenRouter'
      };

      return validatedAssessment;
    } catch (error) {
      console.error('Assessment generation failed:', error);
      return this.getFallbackAssessment(params);
    }
  }

  // =====================================================
  // EDUCATIONAL INSIGHTS GENERATION
  // =====================================================

  static async generateEducationalInsights(params: EducationalInsightsParams): Promise<any> {
    const { data, classId, subject } = params;
    const { attendance = [], grades = [], students = [] } = data;

    const systemPrompt = `You are an expert educational data analyst specializing in Zambian education. You analyze student performance and attendance data to provide actionable insights for teachers. Your analysis should be:

1. Practical and implementable in Zambian school contexts
2. Culturally sensitive and relevant
3. Based on sound educational research
4. Focused on improving student outcomes
5. Clear and actionable for teachers

Always provide specific, practical recommendations.`;

    const userPrompt = `Analyze the following educational data and provide comprehensive insights:

Student Data:
- Total Students: ${students.length}
- Attendance Records: ${attendance.length}
- Grade Records: ${grades.length}
- Subject: ${subject || 'Mixed subjects'}
- Class ID: ${classId || 'Not specified'}

Attendance Summary:
${attendance.length > 0 ? `
- Present: ${attendance.filter(a => a.status === 'present').length}
- Absent: ${attendance.filter(a => a.status === 'absent').length}
- Late: ${attendance.filter(a => a.status === 'late').length}
` : 'No attendance data available'}

Performance Summary:
${grades.length > 0 ? `
- Average Score: ${Math.round(grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length)}%
- High Performers (75%+): ${grades.filter(g => (g.percentage || 0) >= 75).length}
- Low Performers (<50%): ${grades.filter(g => (g.percentage || 0) < 50).length}
` : 'No performance data available'}

Provide analysis in this JSON format:
{
  "summary": {
    "total_students": number,
    "attendance_rate": number,
    "average_performance": number,
    "status": "excellent|good|needs_attention"
  },
  "key_insights": ["insight 1", "insight 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "interventions": [
    {
      "type": "intervention_type",
      "target": "target_group",
      "action": "specific_action"
    }
  ],
  "strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1", "concern 2"],
  "next_steps": ["step 1", "step 2"]
}`;

    try {
      const aiResponse = await this.makeAPICall(userPrompt, systemPrompt);
      const insights = JSON.parse(aiResponse);
      
      return {
        ...insights,
        generated_at: new Date().toISOString(),
        ai_generated: true,
        ai_model: 'DeepSeek R1 via OpenRouter'
      };
    } catch (error) {
      console.error('Insights generation failed:', error);
      return this.getFallbackInsights(data);
    }
  }

  // =====================================================
  // FALLBACK METHODS
  // =====================================================

  private static getFallbackLessonPlan(params: LessonPlanParams) {
    const { subject, topic, gradeLevel, duration } = params;
    
    return {
      title: `${subject}: ${topic}`,
      subject: subject,
      topic: topic,
      grade_level: gradeLevel,
      duration_minutes: duration,
      objectives: [
        `Students will understand the key concepts of ${topic}`,
        `Students will apply ${topic} knowledge to practical situations`,
        `Students will demonstrate mastery through activities and assessment`
      ],
      materials: ['Whiteboard and markers', 'Textbooks', 'Exercise books', 'Calculator (if needed)'],
      introduction: `Begin with an engaging introduction to ${topic}, connecting to prior knowledge and real-world applications.`,
      lesson_development: `Systematically introduce ${topic} concepts through clear explanations, examples, and interactive discussions.`,
      activities: [
        'Individual practice exercises',
        'Pair work to solve problems',
        'Group discussion on applications'
      ],
      assessment: 'Formative assessment through questioning, observation, and student responses',
      conclusion: `Summarize key ${topic} concepts and preview next lesson`,
      homework: `Complete practice exercises on ${topic} from textbook`,
      notes: `ECZ-aligned lesson plan for Grade ${gradeLevel}. AI generation temporarily unavailable.`,
      syllabi_alignment: `ECZ ${subject} Syllabus - Grade ${gradeLevel}`,
      ecz_compliance: true,
      generated_at: new Date().toISOString(),
      ai_generated: false,
      fallback_reason: 'AI service temporarily unavailable'
    };
  }

  private static getFallbackAssessment(params: AssessmentParams) {
    const { subject, topic, gradeLevel, questionCount, questionTypes, difficulty } = params;
    
    return {
      title: `${subject} Assessment: ${topic}`,
      subject: subject,
      topic: topic,
      grade_level: gradeLevel,
      difficulty_level: difficulty,
      total_marks: questionCount * 5,
      duration_minutes: 60,
      instructions: this.getDefaultInstructions(60),
      questions: this.getFallbackQuestions(questionCount, questionTypes),
      assessment_type: 'test',
      syllabi_alignment: `ECZ ${subject} Syllabus - Grade ${gradeLevel}`,
      ecz_compliance: true,
      generated_at: new Date().toISOString(),
      ai_generated: false,
      fallback_reason: 'AI service temporarily unavailable'
    };
  }

  private static getFallbackQuestions(count: number, types: string[]) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        question_number: i,
        question_type: types[0] || 'short_answer',
        question_text: `Question ${i}: Demonstrate your understanding of the topic.`,
        marks: 5,
        correct_answer: 'Detailed answer expected based on lesson content',
        answer_explanation: 'Assessment based on understanding and application',
        bloom_taxonomy_level: 'understand'
      });
    }
    return questions;
  }

  private static getDefaultInstructions(duration: number): string {
    return `INSTRUCTIONS:
1. Read all questions carefully before beginning
2. Answer ALL questions in the spaces provided
3. Show your working for all calculations
4. Time allowed: ${duration} minutes
5. Allocate your time wisely across all sections
6. Check your answers before submitting`;
  }

  private static getFallbackInsights(data: any) {
    const { attendance = [], grades = [], students = [] } = data;
    
    return {
      summary: {
        total_students: students.length,
        attendance_rate: attendance.length > 0 ? Math.round((attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100) : 0,
        average_performance: grades.length > 0 ? Math.round(grades.reduce((sum: number, g: any) => sum + (g.percentage || 0), 0) / grades.length) : 0,
        status: 'analysis_pending'
      },
      key_insights: ['Data analysis in progress', 'Regular monitoring recommended'],
      recommendations: ['Continue tracking attendance and performance', 'Implement consistent assessment practices'],
      interventions: [],
      strengths: ['Data collection system in place'],
      concerns: ['Limited data for comprehensive analysis'],
      next_steps: ['Collect more data points', 'Establish regular assessment schedule'],
      generated_at: new Date().toISOString(),
      ai_generated: false,
      fallback_reason: 'AI service temporarily unavailable'
    };
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  static async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeAPICall(
        'Test connection - respond with "Connection successful"',
        'You are a helpful AI assistant. Respond briefly and accurately.'
      );
      return response.includes('successful') || response.includes('working');
    } catch (error) {
      console.error('AI service connection test failed:', error);
      return false;
    }
  }

  static getServiceInfo() {
    return {
      service: 'OpenRouter DeepSeek R1',
      model: this.MODEL,
      status: 'active',
      features: ['lesson_planning', 'assessment_generation', 'educational_insights'],
      description: 'Advanced AI-powered educational content generation using DeepSeek R1 model'
    };
  }
}
