export class OpenAIProxyService {
  private static readonly ENDPOINT = '/.netlify/functions/ai-chat';

  static async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.ENDPOINT}?ping=1`);
      return res.ok;
    } catch {
      return false;
    }
  }

  static async generateLessonPlan(params: any): Promise<any> {
    const content = await this.chatJSON([
      { role: 'system', content: 'You are an educational planner. Always return valid JSON matching the schema with keys: title, subject, topic, grade_level, duration_minutes, objectives, materials, introduction, lesson_development, activities, assessment, conclusion, homework, notes, syllabi_alignment, ecz_compliance, generated_at.' },
      { role: 'user', content: `Create an ECZ-aligned lesson plan for subject=${params.subject}, topic=${params.topic}, grade=${params.gradeLevel}, duration=${params.duration} minutes.` }
    ]);
    return content;
  }

  static async generateAssessment(params: any): Promise<any> {
    const content = await this.chatJSON([
      { role: 'system', content: 'You are an assessment generator. Return JSON with: title, subject, topic, grade_level, difficulty_level, total_marks, duration_minutes, instructions, questions (array with question_number, question_type, question_text, marks, options?, correct_answer?, answer_explanation?).' },
      { role: 'user', content: `Create an ECZ-aligned assessment for subject=${params.subject}, topic=${params.topic}, grade=${params.gradeLevel}, questionCount=${params.questionCount}, types=${params.questionTypes.join(',')}, difficulty=${params.difficulty}.` }
    ]);
    return content;
  }

  static async generateEducationalInsights(params: any): Promise<any> {
    const content = await this.chatJSON([
      { role: 'system', content: 'You analyze education data and return JSON insights. Keep outputs concise and structured.' },
      { role: 'user', content: `Analyze this class data and return insights JSON: ${JSON.stringify(params.data).slice(0, 5000)}` }
    ]);
    return content;
  }

  private static async chatJSON(messages: any[]): Promise<any> {
    const res = await fetch(this.ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, response_format: 'json_object' })
    });
    if (!res.ok) throw new Error(`AI error: ${res.status}`);
    return await res.json();
  }
}
