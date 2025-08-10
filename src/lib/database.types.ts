export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'teacher' | 'admin' | 'student' | 'parent'
          school_name: string
          phone: string | null
          address: string | null
          profile_image_url: string | null
          school_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'teacher' | 'admin' | 'student' | 'parent'
          school_name: string
          phone?: string | null
          address?: string | null
          profile_image_url?: string | null
          school_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'teacher' | 'admin' | 'student' | 'parent'
          school_name?: string
          phone?: string | null
          address?: string | null
          profile_image_url?: string | null
          school_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          principal_name: string | null
          school_type: 'primary' | 'secondary' | 'combined' | null
          region: string | null
          district: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          principal_name?: string | null
          school_type?: 'primary' | 'secondary' | 'combined' | null
          region?: string | null
          district?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          principal_name?: string | null
          school_type?: 'primary' | 'secondary' | 'combined' | null
          region?: string | null
          district?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          grade_level: number
          section: string | null
          subject: string | null
          teacher_id: string | null
          school_id: string | null
          academic_year: string
          capacity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          grade_level: number
          section?: string | null
          subject?: string | null
          teacher_id?: string | null
          school_id?: string | null
          academic_year?: string
          capacity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          grade_level?: number
          section?: string | null
          subject?: string | null
          teacher_id?: string | null
          school_id?: string | null
          academic_year?: string
          capacity?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          student_id: string
          first_name: string
          last_name: string
          full_name: string
          date_of_birth: string | null
          gender: 'male' | 'female' | null
          class_id: string | null
          parent_guardian_name: string | null
          parent_guardian_phone: string | null
          parent_guardian_email: string | null
          address: string | null
          enrollment_date: string | null
          status: 'active' | 'inactive' | 'transferred' | 'graduated'
          school_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | null
          class_id?: string | null
          parent_guardian_name?: string | null
          parent_guardian_phone?: string | null
          parent_guardian_email?: string | null
          address?: string | null
          enrollment_date?: string | null
          status?: 'active' | 'inactive' | 'transferred' | 'graduated'
          school_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | null
          class_id?: string | null
          parent_guardian_name?: string | null
          parent_guardian_phone?: string | null
          parent_guardian_email?: string | null
          address?: string | null
          enrollment_date?: string | null
          status?: 'active' | 'inactive' | 'transferred' | 'graduated'
          school_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lesson_plans: {
        Row: {
          id: string
          title: string
          subject: string
          topic: string
          grade_level: number
          duration_minutes: number | null
          objectives: string[]
          materials: string[]
          introduction: string
          lesson_development: string
          activities: string[]
          assessment: string
          conclusion: string
          homework: string | null
          notes: string | null
          syllabi_alignment: string | null
          ecz_compliance: boolean | null
          teacher_id: string
          class_id: string | null
          lesson_date: string | null
          status: 'draft' | 'approved' | 'taught' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subject: string
          topic: string
          grade_level: number
          duration_minutes?: number | null
          objectives: string[]
          materials: string[]
          introduction: string
          lesson_development: string
          activities: string[]
          assessment: string
          conclusion: string
          homework?: string | null
          notes?: string | null
          syllabi_alignment?: string | null
          ecz_compliance?: boolean | null
          teacher_id: string
          class_id?: string | null
          lesson_date?: string | null
          status?: 'draft' | 'approved' | 'taught' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subject?: string
          topic?: string
          grade_level?: number
          duration_minutes?: number | null
          objectives?: string[]
          materials?: string[]
          introduction?: string
          lesson_development?: string
          activities?: string[]
          assessment?: string
          conclusion?: string
          homework?: string | null
          notes?: string | null
          syllabi_alignment?: string | null
          ecz_compliance?: boolean | null
          teacher_id?: string
          class_id?: string | null
          lesson_date?: string | null
          status?: 'draft' | 'approved' | 'taught' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          title: string
          subject: string
          topic: string
          grade_level: number
          difficulty_level: 'easy' | 'medium' | 'hard'
          total_marks: number
          duration_minutes: number | null
          instructions: string
          teacher_id: string
          class_id: string | null
          assessment_type: 'test' | 'quiz' | 'exam' | 'assignment'
          status: 'draft' | 'published' | 'conducted' | 'graded'
          scheduled_date: string | null
          syllabi_alignment: string | null
          ecz_compliance: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subject: string
          topic: string
          grade_level: number
          difficulty_level?: 'easy' | 'medium' | 'hard'
          total_marks?: number
          duration_minutes?: number | null
          instructions: string
          teacher_id: string
          class_id?: string | null
          assessment_type?: 'test' | 'quiz' | 'exam' | 'assignment'
          status?: 'draft' | 'published' | 'conducted' | 'graded'
          scheduled_date?: string | null
          syllabi_alignment?: string | null
          ecz_compliance?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subject?: string
          topic?: string
          grade_level?: number
          difficulty_level?: 'easy' | 'medium' | 'hard'
          total_marks?: number
          duration_minutes?: number | null
          instructions?: string
          teacher_id?: string
          class_id?: string | null
          assessment_type?: 'test' | 'quiz' | 'exam' | 'assignment'
          status?: 'draft' | 'published' | 'conducted' | 'graded'
          scheduled_date?: string | null
          syllabi_alignment?: string | null
          ecz_compliance?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      assessment_questions: {
        Row: {
          id: string
          assessment_id: string
          question_number: number
          question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'problem_solving' | 'true_false'
          question_text: string
          marks: number
          options: Json | null
          correct_answer: string | null
          answer_explanation: string | null
          bloom_taxonomy_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create' | null
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          question_number: number
          question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'problem_solving' | 'true_false'
          question_text: string
          marks?: number
          options?: Json | null
          correct_answer?: string | null
          answer_explanation?: string | null
          bloom_taxonomy_level?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create' | null
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          question_number?: number
          question_type?: 'multiple_choice' | 'short_answer' | 'essay' | 'problem_solving' | 'true_false'
          question_text?: string
          marks?: number
          options?: Json | null
          correct_answer?: string | null
          answer_explanation?: string | null
          bloom_taxonomy_level?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create' | null
          created_at?: string
        }
      }
      student_assessments: {
        Row: {
          id: string
          assessment_id: string
          student_id: string
          score: number
          max_score: number
          percentage: number
          grade: string | null
          comments: string | null
          submitted_at: string | null
          graded_at: string | null
          graded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          student_id: string
          score?: number
          max_score: number
          grade?: string | null
          comments?: string | null
          submitted_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          student_id?: string
          score?: number
          max_score?: number
          grade?: string | null
          comments?: string | null
          submitted_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          class_id: string
          date: string
          status: 'present' | 'absent' | 'late' | 'sick' | 'excused'
          time_in: string | null
          time_out: string | null
          notes: string | null
          marked_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          date?: string
          status: 'present' | 'absent' | 'late' | 'sick' | 'excused'
          time_in?: string | null
          time_out?: string | null
          notes?: string | null
          marked_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late' | 'sick' | 'excused'
          time_in?: string | null
          time_out?: string | null
          notes?: string | null
          marked_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          type: 'assessment_created' | 'grade_posted' | 'attendance_alert' | 'class_update' | 'system' | 'reminder'
          title: string
          message: string
          data: Json | null
          read: boolean | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          type: 'assessment_created' | 'grade_posted' | 'attendance_alert' | 'class_update' | 'system' | 'reminder'
          title: string
          message: string
          data?: Json | null
          read?: boolean | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          recipient_id?: string
          sender_id?: string | null
          type?: 'assessment_created' | 'grade_posted' | 'attendance_alert' | 'class_update' | 'system' | 'reminder'
          title?: string
          message?: string
          data?: Json | null
          read?: boolean | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          created_at?: string
          read_at?: string | null
        }
      }
      performance_analytics: {
        Row: {
          id: string
          student_id: string | null
          class_id: string | null
          subject: string | null
          period_start: string
          period_end: string
          total_assessments: number | null
          average_score: number | null
          highest_score: number | null
          lowest_score: number | null
          attendance_rate: number | null
          performance_trend: 'improving' | 'stable' | 'declining' | null
          recommendations: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id?: string | null
          class_id?: string | null
          subject?: string | null
          period_start: string
          period_end: string
          total_assessments?: number | null
          average_score?: number | null
          highest_score?: number | null
          lowest_score?: number | null
          attendance_rate?: number | null
          performance_trend?: 'improving' | 'stable' | 'declining' | null
          recommendations?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string | null
          class_id?: string | null
          subject?: string | null
          period_start?: string
          period_end?: string
          total_assessments?: number | null
          average_score?: number | null
          highest_score?: number | null
          lowest_score?: number | null
          attendance_rate?: number | null
          performance_trend?: 'improving' | 'stable' | 'declining' | null
          recommendations?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_attendance_rate: {
        Args: {
          student_uuid: string
          start_date?: string
          end_date?: string
        }
        Returns: number
      }
      create_notification: {
        Args: {
          recipient_id: string
          sender_id: string
          notification_type: string
          title: string
          message: string
          data?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
