import { supabase } from './supabase';
import type { Database } from './database.types';

// Type definitions
type Profile = Database['public']['Tables']['profiles']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];
type Student = Database['public']['Tables']['students']['Row'];
type LessonPlan = Database['public']['Tables']['lesson_plans']['Row'];
type Assessment = Database['public']['Tables']['assessments']['Row'];
type AssessmentQuestion = Database['public']['Tables']['assessment_questions']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export class SupabaseService {
  // =====================================================
  // PROFILE MANAGEMENT
  // =====================================================

  static async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  static async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  }

  // =====================================================
  // CLASS MANAGEMENT
  // =====================================================

  static async getTeacherClasses(): Promise<Class[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        students:students(count)
      `)
      .eq('teacher_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching classes:', error);
      return [];
    }

    return data || [];
  }

  static async createClass(classData: {
    name: string;
    grade_level: number;
    section?: string;
    subject?: string;
    capacity?: number;
  }): Promise<Class | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user's school from profile
    const profile = await this.getCurrentProfile();
    if (!profile) return null;

    const { data, error } = await supabase
      .from('classes')
      .insert([{
        ...classData,
        teacher_id: user.id,
        school_id: profile.school_id || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating class:', error);
      return null;
    }

    return data;
  }

  static async updateClass(classId: string, updates: Partial<Class>): Promise<Class | null> {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', classId)
      .select()
      .single();

    if (error) {
      console.error('Error updating class:', error);
      return null;
    }

    return data;
  }

  // =====================================================
  // STUDENT MANAGEMENT
  // =====================================================

  static async getClassStudents(classId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }

    return data || [];
  }

  static async addStudent(studentData: {
    student_id: string;
    first_name: string;
    last_name: string;
    class_id: string;
    date_of_birth?: string;
    gender?: 'male' | 'female';
    parent_guardian_name?: string;
    parent_guardian_phone?: string;
    parent_guardian_email?: string;
    address?: string;
  }): Promise<Student | null> {
    const profile = await this.getCurrentProfile();
    if (!profile) return null;

    const { data, error } = await supabase
      .from('students')
      .insert([{
        ...studentData,
        school_id: profile.school_id || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding student:', error);
      return null;
    }

    // Create notification
    await this.createNotification({
      recipient_id: profile.id,
      type: 'class_update',
      title: 'New Student Added',
      message: `${studentData.first_name} ${studentData.last_name} has been added to the class.`
    });

    return data;
  }

  static async updateStudent(studentId: string, updates: Partial<Student>): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      return null;
    }

    return data;
  }

  // =====================================================
  // LESSON PLAN MANAGEMENT
  // =====================================================

  static async saveLessonPlan(lessonPlanData: {
    title: string;
    subject: string;
    topic: string;
    grade_level: number;
    duration_minutes: number;
    objectives: string[];
    materials: string[];
    introduction: string;
    lesson_development: string;
    activities: string[];
    assessment: string;
    conclusion: string;
    class_id?: string;
    lesson_date?: string;
    homework?: string;
    notes?: string;
  }): Promise<LessonPlan | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('lesson_plans')
      .insert([{
        ...lessonPlanData,
        teacher_id: user.id,
        syllabi_alignment: 'ECZ Curriculum Aligned',
        ecz_compliance: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving lesson plan:', error);
      return null;
    }

    return data;
  }

  static async getTeacherLessonPlans(): Promise<LessonPlan[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('lesson_plans')
      .select(`
        *,
        class:classes(name)
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lesson plans:', error);
      return [];
    }

    return data || [];
  }

  // =====================================================
  // ASSESSMENT MANAGEMENT
  // =====================================================

  static async saveAssessment(assessmentData: {
    title: string;
    subject: string;
    topic: string;
    grade_level: number;
    difficulty_level: 'easy' | 'medium' | 'hard';
    total_marks: number;
    duration_minutes: number;
    instructions: string;
    questions: Array<{
      question_number: number;
      question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'problem_solving';
      question_text: string;
      marks: number;
      options?: string[];
      correct_answer?: string;
      answer_explanation?: string;
    }>;
    class_id?: string;
    assessment_type?: 'test' | 'quiz' | 'exam' | 'assignment';
  }): Promise<Assessment | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Insert assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert([{
        title: assessmentData.title,
        subject: assessmentData.subject,
        topic: assessmentData.topic,
        grade_level: assessmentData.grade_level,
        difficulty_level: assessmentData.difficulty_level,
        total_marks: assessmentData.total_marks,
        duration_minutes: assessmentData.duration_minutes,
        instructions: assessmentData.instructions,
        teacher_id: user.id,
        class_id: assessmentData.class_id || null,
        assessment_type: assessmentData.assessment_type || 'test',
        syllabi_alignment: 'ECZ Curriculum Aligned',
        ecz_compliance: true
      }])
      .select()
      .single();

    if (assessmentError) {
      console.error('Error saving assessment:', assessmentError);
      return null;
    }

    // Insert questions
    const questionsWithAssessmentId = assessmentData.questions.map(q => ({
      ...q,
      assessment_id: assessment.id,
      options: q.options ? JSON.stringify(q.options) : null
    }));

    const { error: questionsError } = await supabase
      .from('assessment_questions')
      .insert(questionsWithAssessmentId);

    if (questionsError) {
      console.error('Error saving questions:', questionsError);
      // Clean up assessment if questions failed
      await supabase.from('assessments').delete().eq('id', assessment.id);
      return null;
    }

    return assessment;
  }

  static async getTeacherAssessments(): Promise<Assessment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        class:classes(name),
        questions:assessment_questions(count)
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return [];
    }

    return data || [];
  }

  static async getAssessmentWithQuestions(assessmentId: string): Promise<Assessment & { questions: AssessmentQuestion[] } | null> {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        questions:assessment_questions(*)
      `)
      .eq('id', assessmentId)
      .single();

    if (error) {
      console.error('Error fetching assessment with questions:', error);
      return null;
    }

    return data;
  }

  // =====================================================
  // ATTENDANCE MANAGEMENT
  // =====================================================

  static async markAttendance(attendanceData: {
    student_id: string;
    class_id: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'sick' | 'excused';
    notes?: string;
  }): Promise<Attendance | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('attendance')
      .upsert([{
        ...attendanceData,
        marked_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error marking attendance:', error);
      return null;
    }

    return data;
  }

  static async getClassAttendance(classId: string, date?: string): Promise<Attendance[]> {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        student:students(*)
      `)
      .eq('class_id', classId);

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }

    return data || [];
  }

  static async getStudentAttendance(studentId: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching student attendance:', error);
      return [];
    }

    return data || [];
  }

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  static async createNotification(notificationData: {
    recipient_id: string;
    type: 'assessment_created' | 'grade_posted' | 'attendance_alert' | 'class_update' | 'system' | 'reminder';
    title: string;
    message: string;
    data?: any;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }): Promise<Notification | null> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notificationData,
        sender_id: user?.id || null,
        data: notificationData.data ? JSON.stringify(notificationData.data) : null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  }

  static async getUserNotifications(limit = 50): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  static async markNotificationRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  static async getUnreadNotificationCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToClassUpdates(classId: string, callback: (payload: any) => void) {
    return supabase
      .channel('class_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students',
          filter: `class_id=eq.${classId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToAttendance(classId: string, callback: (payload: any) => void) {
    return supabase
      .channel('attendance_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `class_id=eq.${classId}`
        },
        callback
      )
      .subscribe();
  }

  // =====================================================
  // ANALYTICS
  // =====================================================

  static async getClassAnalytics(classId: string): Promise<any> {
    // Get student count
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)
      .eq('status', 'active');

    // Get recent attendance rate
    const { data: recentAttendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('class_id', classId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const attendanceRate = recentAttendance?.length > 0
      ? (recentAttendance.filter(a => a.status === 'present').length / recentAttendance.length) * 100
      : 0;

    // Get assessment count
    const { count: assessmentCount } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId);

    return {
      studentCount: studentCount || 0,
      attendanceRate: Math.round(attendanceRate),
      assessmentCount: assessmentCount || 0
    };
  }
}
