-- =====================================================
-- CATALYST EDUCATION - COMPLETE DATABASE SCHEMA
-- Captures ALL app data and functionality
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USER PROFILES AND AUTHENTICATION
-- =====================================================

-- User profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'student', 'parent')),
    school_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- EDUCATIONAL STRUCTURE
-- =====================================================

-- Schools table
CREATE TABLE public.schools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    principal_name TEXT,
    school_type TEXT CHECK (school_type IN ('primary', 'secondary', 'combined')),
    region TEXT,
    district TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Classes/Grades table
CREATE TABLE public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    section TEXT,
    subject TEXT,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::TEXT,
    capacity INTEGER DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(name, school_id, academic_year)
);

-- Students table
CREATE TABLE public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female')),
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    parent_guardian_name TEXT,
    parent_guardian_phone TEXT,
    parent_guardian_email TEXT,
    address TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- LESSON PLANNING AND CURRICULUM
-- =====================================================

-- Lesson plans table
CREATE TABLE public.lesson_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade_level INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 40,
    objectives TEXT[] NOT NULL,
    materials TEXT[] NOT NULL,
    introduction TEXT NOT NULL,
    lesson_development TEXT NOT NULL,
    activities TEXT[] NOT NULL,
    assessment TEXT NOT NULL,
    conclusion TEXT NOT NULL,
    homework TEXT,
    notes TEXT,
    syllabi_alignment TEXT,
    ecz_compliance BOOLEAN DEFAULT TRUE,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_model TEXT,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    lesson_date DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'taught', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ASSESSMENTS AND GRADING
-- =====================================================

-- Assessment templates
CREATE TABLE public.assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade_level INTEGER NOT NULL,
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    total_marks INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER DEFAULT 60,
    instructions TEXT NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    assessment_type TEXT DEFAULT 'test' CHECK (assessment_type IN ('test', 'quiz', 'exam', 'assignment')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'conducted', 'graded')),
    scheduled_date TIMESTAMPTZ,
    syllabi_alignment TEXT,
    ecz_compliance BOOLEAN DEFAULT TRUE,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Assessment questions
CREATE TABLE public.assessment_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
    question_number INTEGER NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer', 'essay', 'problem_solving', 'true_false')),
    question_text TEXT NOT NULL,
    marks INTEGER NOT NULL DEFAULT 1,
    options JSONB,
    correct_answer TEXT,
    answer_explanation TEXT,
    bloom_taxonomy_level TEXT CHECK (bloom_taxonomy_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(assessment_id, question_number)
);

-- Student assessment results
CREATE TABLE public.student_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    max_score NUMERIC(5,2) NOT NULL,
    percentage NUMERIC(5,2) GENERATED ALWAYS AS ((score / NULLIF(max_score, 0)) * 100) STORED,
    grade TEXT,
    comments TEXT,
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(assessment_id, student_id)
);

-- =====================================================
-- ATTENDANCE TRACKING
-- =====================================================

-- Attendance records
CREATE TABLE public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'sick', 'excused')),
    time_in TIME,
    time_out TIME,
    notes TEXT,
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, date, class_id)
);

-- =====================================================
-- REAL-TIME NOTIFICATIONS
-- =====================================================

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('assessment_created', 'grade_posted', 'attendance_alert', 'class_update', 'system', 'reminder')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    read_at TIMESTAMPTZ
);

-- =====================================================
-- ANALYTICS AND REPORTING
-- =====================================================

-- Performance analytics (aggregated data)
CREATE TABLE public.performance_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject TEXT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_assessments INTEGER DEFAULT 0,
    average_score NUMERIC(5,2),
    highest_score NUMERIC(5,2),
    lowest_score NUMERIC(5,2),
    attendance_rate NUMERIC(5,2),
    performance_trend TEXT CHECK (performance_trend IN ('improving', 'stable', 'declining')),
    recommendations TEXT[],
    ai_insights JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Classes policies
CREATE POLICY "Teachers can view their classes" ON public.classes
    FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their classes" ON public.classes
    FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create classes" ON public.classes
    FOR INSERT WITH CHECK (teacher_id = auth.uid());

-- Students policies
CREATE POLICY "Teachers can view students in their classes" ON public.students
    FOR SELECT USING (
        class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    );

CREATE POLICY "Teachers can update students in their classes" ON public.students
    FOR UPDATE USING (
        class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    );

CREATE POLICY "Teachers can add students to their classes" ON public.students
    FOR INSERT WITH CHECK (
        class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    );

-- Lesson plans policies
CREATE POLICY "Teachers can manage their lesson plans" ON public.lesson_plans
    FOR ALL USING (teacher_id = auth.uid());

-- Assessments policies
CREATE POLICY "Teachers can manage their assessments" ON public.assessments
    FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can manage questions for their assessments" ON public.assessment_questions
    FOR ALL USING (
        assessment_id IN (SELECT id FROM public.assessments WHERE teacher_id = auth.uid())
    );

-- Attendance policies
CREATE POLICY "Teachers can manage attendance for their classes" ON public.attendance
    FOR ALL USING (
        class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())
    );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, school_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
        COALESCE(NEW.raw_user_meta_data->>'school_name', 'Default School')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_plans_updated_at BEFORE UPDATE ON public.lesson_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_assessments_updated_at BEFORE UPDATE ON public.student_assessments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary lookup indexes
CREATE INDEX idx_students_class_id ON public.students(class_id);
CREATE INDEX idx_students_school_id ON public.students(school_id);
CREATE INDEX idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX idx_classes_school_id ON public.classes(school_id);
CREATE INDEX idx_lesson_plans_teacher_id ON public.lesson_plans(teacher_id);
CREATE INDEX idx_lesson_plans_class_id ON public.lesson_plans(class_id);
CREATE INDEX idx_assessments_teacher_id ON public.assessments(teacher_id);
CREATE INDEX idx_assessments_class_id ON public.assessments(class_id);
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_attendance_class_id ON public.attendance(class_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_student_assessments_student_id ON public.student_assessments(student_id);
CREATE INDEX idx_student_assessments_assessment_id ON public.student_assessments(assessment_id);

-- Composite indexes for common queries
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_classes_teacher_year ON public.classes(teacher_id, academic_year);
CREATE INDEX idx_students_class_status ON public.students(class_id, status);

-- =====================================================
-- DEMO DATA SETUP
-- =====================================================

-- Insert demo school
INSERT INTO public.schools (id, name, school_type, region, district, address, phone, email, principal_name)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Catalyst Demo Secondary School',
    'secondary',
    'Lusaka',
    'Lusaka Urban',
    '123 Education Street, Lusaka, Zambia',
    '+260-97-1234567',
    'admin@catalystdemo.edu.zm',
    'Mrs. Margaret Phiri'
) ON CONFLICT (id) DO NOTHING;

-- Demo user (will be created by auth trigger when demo user signs up)
-- Email: demo@catalyst.edu
-- Password: CatalystDemo2024!

-- Demo classes (will be inserted after demo user exists)
-- Demo students and data will be populated via application or additional scripts

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS SETUP
-- =====================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessments;

-- =====================================================
-- DEMO DATA INSERTION FUNCTION
-- =====================================================

-- Function to populate demo data after demo user is created
CREATE OR REPLACE FUNCTION public.populate_demo_data(demo_user_id UUID)
RETURNS VOID AS $$
DECLARE
    demo_school_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
    math_class_id UUID;
    english_class_id UUID;
    science_class_id UUID;
    student_1_id UUID;
    student_2_id UUID;
    student_3_id UUID;
    assessment_id UUID;
BEGIN
    -- Insert demo classes
    INSERT INTO public.classes (id, name, grade_level, subject, teacher_id, school_id, academic_year, capacity)
    VALUES 
        (uuid_generate_v4(), 'Grade 10 Mathematics', 10, 'Mathematics', demo_user_id, demo_school_id, '2024', 35),
        (uuid_generate_v4(), 'Grade 10 English', 10, 'English', demo_user_id, demo_school_id, '2024', 35),
        (uuid_generate_v4(), 'Grade 10 Science', 10, 'Science', demo_user_id, demo_school_id, '2024', 35)
    RETURNING id INTO math_class_id;

    -- Get class IDs
    SELECT id INTO math_class_id FROM public.classes WHERE name = 'Grade 10 Mathematics' AND teacher_id = demo_user_id;
    SELECT id INTO english_class_id FROM public.classes WHERE name = 'Grade 10 English' AND teacher_id = demo_user_id;
    SELECT id INTO science_class_id FROM public.classes WHERE name = 'Grade 10 Science' AND teacher_id = demo_user_id;

    -- Insert demo students
    INSERT INTO public.students (id, student_id, first_name, last_name, date_of_birth, gender, class_id, parent_guardian_name, parent_guardian_phone, school_id)
    VALUES 
        (uuid_generate_v4(), 'STU001', 'Chipo', 'Mwamba', '2008-03-15', 'female', math_class_id, 'Mr. John Mwamba', '+260-97-1111111', demo_school_id),
        (uuid_generate_v4(), 'STU002', 'Temba', 'Banda', '2008-07-22', 'male', math_class_id, 'Mrs. Grace Banda', '+260-97-2222222', demo_school_id),
        (uuid_generate_v4(), 'STU003', 'Mutinta', 'Phiri', '2008-11-08', 'female', math_class_id, 'Mr. Peter Phiri', '+260-97-3333333', demo_school_id),
        (uuid_generate_v4(), 'STU004', 'Bwalya', 'Kasonde', '2008-01-30', 'male', math_class_id, 'Mrs. Mary Kasonde', '+260-97-4444444', demo_school_id),
        (uuid_generate_v4(), 'STU005', 'Natasha', 'Zimba', '2008-09-12', 'female', math_class_id, 'Mr. David Zimba', '+260-97-5555555', demo_school_id);

    -- Get student IDs
    SELECT id INTO student_1_id FROM public.students WHERE student_id = 'STU001';
    SELECT id INTO student_2_id FROM public.students WHERE student_id = 'STU002';
    SELECT id INTO student_3_id FROM public.students WHERE student_id = 'STU003';

    -- Insert demo lesson plans
    INSERT INTO public.lesson_plans (title, subject, topic, grade_level, duration_minutes, objectives, materials, introduction, lesson_development, activities, assessment, conclusion, teacher_id, class_id, ai_generated, ai_model)
    VALUES (
        'Quadratic Equations - Solving by Factoring',
        'Mathematics',
        'Quadratic Equations',
        10,
        80,
        ARRAY['Students will understand the concept of quadratic equations', 'Students will solve quadratic equations by factoring', 'Students will apply factoring to real-world problems'],
        ARRAY['Whiteboard and markers', 'Scientific calculators', 'Graph paper', 'Textbooks'],
        'Begin with a review of linear equations and introduce quadratic equations through real-world examples like projectile motion.',
        'Systematically teach the standard form ax² + bx + c = 0, demonstrate factoring techniques including common factors, difference of squares, and trinomial factoring.',
        ARRAY['Pair work: Factor given quadratic expressions', 'Group activity: Solve quadratic word problems', 'Individual practice: Complete factoring exercises'],
        'Formative assessment through questioning and observation. Exit ticket with 3 factoring problems to assess understanding.',
        'Summarize key factoring techniques and preview next lesson on completing the square method.',
        demo_user_id,
        math_class_id,
        true,
        'DeepSeek R1'
    );

    -- Insert demo assessment
    INSERT INTO public.assessments (id, title, subject, topic, grade_level, difficulty_level, total_marks, duration_minutes, instructions, teacher_id, class_id, assessment_type, ai_generated, ai_model)
    VALUES (
        uuid_generate_v4(),
        'Quadratic Equations Test',
        'Mathematics',
        'Quadratic Equations',
        10,
        'medium',
        50,
        60,
        'Read all questions carefully. Show your working for all calculations. Time allowed: 60 minutes. Total marks: 50.',
        demo_user_id,
        math_class_id,
        'test',
        true,
        'DeepSeek R1'
    ) RETURNING id INTO assessment_id;

    -- Insert demo assessment questions
    INSERT INTO public.assessment_questions (assessment_id, question_number, question_type, question_text, marks, options, correct_answer, answer_explanation, bloom_taxonomy_level)
    VALUES 
        (assessment_id, 1, 'multiple_choice', 'Which of the following is the standard form of a quadratic equation?', 5, '["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "ax + by = c"]'::jsonb, 'ax² + bx + c = 0', 'The standard form includes a squared term (ax²), linear term (bx), and constant (c).', 'remember'),
        (assessment_id, 2, 'short_answer', 'Factor completely: x² - 9', 8, NULL, 'x² - 9 = (x + 3)(x - 3)', 'This is a difference of squares: a² - b² = (a + b)(a - b)', 'apply'),
        (assessment_id, 3, 'problem_solving', 'Solve by factoring: x² + 5x + 6 = 0', 12, NULL, 'x = -2 or x = -3', 'Factor as (x + 2)(x + 3) = 0, then set each factor equal to zero.', 'apply');

    -- Insert demo student assessments
    INSERT INTO public.student_assessments (assessment_id, student_id, score, max_score, grade, comments, graded_by)
    VALUES 
        (assessment_id, student_1_id, 42, 50, 'B', 'Good understanding of factoring. Work on solving word problems.', demo_user_id),
        (assessment_id, student_2_id, 38, 50, 'C+', 'Shows progress. Practice more basic factoring techniques.', demo_user_id),
        (assessment_id, student_3_id, 46, 50, 'A-', 'Excellent work! Ready for advanced topics.', demo_user_id);

    -- Insert demo attendance records (last 10 days)
    INSERT INTO public.attendance (student_id, class_id, date, status, marked_by)
    SELECT 
        s.id,
        math_class_id,
        CURRENT_DATE - (generate_series(0, 9) || ' days')::interval,
        CASE 
            WHEN random() < 0.85 THEN 'present'
            WHEN random() < 0.95 THEN 'late'
            ELSE 'absent'
        END,
        demo_user_id
    FROM public.students s
    WHERE s.class_id = math_class_id;

    -- Insert demo notifications
    INSERT INTO public.notifications (recipient_id, sender_id, type, title, message, priority)
    VALUES 
        (demo_user_id, demo_user_id, 'system', 'Welcome to Catalyst!', 'Your demo account is ready. Explore all features with pre-loaded sample data.', 'high'),
        (demo_user_id, demo_user_id, 'assessment_created', 'Assessment Graded', 'Quadratic Equations Test has been graded for Grade 10 Mathematics.', 'normal'),
        (demo_user_id, demo_user_id, 'attendance_alert', 'Attendance Update', 'Daily attendance has been marked for Grade 10 Mathematics.', 'low');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEMA COMPLETE - READY FOR PRODUCTION
-- =====================================================
