-- Catalyst Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('teacher', 'admin')) DEFAULT 'teacher',
  school_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  grade_level TEXT,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  school_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth DATE,
  student_id TEXT UNIQUE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create attendance records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'sick')) NOT NULL,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure one attendance record per student per class per date
  UNIQUE(student_id, class_id, date)
);

-- Create lesson plans table
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT,
  objectives TEXT[],
  materials TEXT[],
  introduction TEXT,
  lesson_development TEXT,
  activities TEXT[],
  assessment TEXT,
  conclusion TEXT,
  duration_minutes INTEGER,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT CHECK (type IN ('quiz', 'test', 'assignment', 'exam')) NOT NULL,
  total_marks INTEGER,
  duration_minutes INTEGER,
  instructions TEXT,
  questions JSONB, -- Store questions as JSON
  marking_scheme JSONB, -- Store marking scheme as JSON
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL(5,2), -- Allows for decimal grades like 85.75
  max_score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade_letter TEXT,
  feedback TEXT,
  graded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  graded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Ensure one grade per student per assessment
  UNIQUE(student_id, assessment_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Classes: Teachers can manage their own classes
CREATE POLICY "Teachers can view own classes" ON public.classes
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classes" ON public.classes
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" ON public.classes
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON public.classes
  FOR DELETE USING (auth.uid() = teacher_id);

-- Students: Teachers can manage students in their classes
CREATE POLICY "Teachers can view students in their classes" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = students.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can add students to their classes" ON public.students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = students.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update students in their classes" ON public.students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = students.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete students in their classes" ON public.students
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = students.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Attendance Records: Teachers can manage attendance for their classes
CREATE POLICY "Teachers can view attendance for their classes" ON public.attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = attendance_records.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create attendance records" ON public.attendance_records
  FOR INSERT WITH CHECK (
    auth.uid() = recorded_by AND
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = attendance_records.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update attendance records" ON public.attendance_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.classes 
      WHERE classes.id = attendance_records.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Lesson Plans: Teachers can manage their own lesson plans
CREATE POLICY "Teachers can view own lesson plans" ON public.lesson_plans
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create lesson plans" ON public.lesson_plans
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own lesson plans" ON public.lesson_plans
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own lesson plans" ON public.lesson_plans
  FOR DELETE USING (auth.uid() = teacher_id);

-- Assessments: Teachers can manage their own assessments
CREATE POLICY "Teachers can view own assessments" ON public.assessments
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create assessments" ON public.assessments
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own assessments" ON public.assessments
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own assessments" ON public.assessments
  FOR DELETE USING (auth.uid() = teacher_id);

-- Grades: Teachers can manage grades for their assessments
CREATE POLICY "Teachers can view grades for their assessments" ON public.grades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments 
      WHERE assessments.id = grades.assessment_id 
      AND assessments.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create grades" ON public.grades
  FOR INSERT WITH CHECK (
    auth.uid() = graded_by AND
    EXISTS (
      SELECT 1 FROM public.assessments 
      WHERE assessments.id = grades.assessment_id 
      AND assessments.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update grades" ON public.grades
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.assessments 
      WHERE assessments.id = grades.assessment_id 
      AND assessments.teacher_id = auth.uid()
    )
  );

-- Create functions and triggers for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, school_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'school_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.lesson_plans
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance_records(class_id, date);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_teacher_id ON public.lesson_plans(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher_id ON public.assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_assessment ON public.grades(student_id, assessment_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
