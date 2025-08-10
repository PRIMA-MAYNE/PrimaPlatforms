# 🚀 **SETUP YOUR SUPABASE PROJECT**

## **Your Credentials (Already Configured)**
- ✅ **Project URL**: https://mkheppdwmzylmiiaxelq.supabase.co
- ✅ **Anon Key**: Configured in .env
- ✅ **Environment**: Ready for production

---

## **STEP 1: Run Database Schema**

### **Go to Supabase Dashboard**
1. Visit: https://mkheppdwmzylmiiaxelq.supabase.co
2. Sign in to your Supabase account
3. Navigate to **SQL Editor**

### **Copy and Run This Complete Schema:**

```sql
-- =====================================================
-- CATALYST EDUCATION - COMPLETE DATABASE SCHEMA
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
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default school
INSERT INTO public.schools (id, name, school_type, region)
VALUES (
    uuid_generate_v4(),
    'Catalyst Demo School',
    'secondary',
    'Lusaka'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS SETUP
-- =====================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_assessments;
```

### **After Running the Schema:**
4. Click **"RUN"** to execute the complete schema
5. Verify tables were created (should see 11+ tables)
6. Check that RLS policies are enabled

---

## **STEP 2: Configure Authentication**

### **In Supabase Dashboard:**
1. Go to **Authentication** → **Settings**
2. Set **Site URL**: `https://95185b3c3ac0440f9810c1080d3d052f-12af64c669f143faa4386ca51.fly.dev`
3. Add **Redirect URLs**:
   - `https://95185b3c3ac0440f9810c1080d3d052f-12af64c669f143faa4386ca51.fly.dev/auth/callback`
   - `http://localhost:5173` (for development)

---

## **STEP 3: Test the Integration**

### **Test User Registration:**
1. Go to your app: https://95185b3c3ac0440f9810c1080d3d052f-12af64c669f143faa4386ca51.fly.dev/signup
2. Create a test account
3. Check if profile is created in `profiles` table
4. Verify you can sign in

### **Test Core Features:**
- ✅ Create classes and students
- ✅ Generate lesson plans (saves to database)
- ✅ Create assessments (saves to database)
- ✅ Mark attendance (real-time updates)
- ✅ View real-time notifications

---

## **✅ YOU'RE READY!**

Your Catalyst Educational Management System is now connected to your Supabase database with:

- **Real Authentication**: No demo mode
- **Live Database**: All data persists
- **Real-time Notifications**: Instant updates
- **ECZ-Aligned AI**: Educational content generation
- **Export Functions**: PDF, DOCX, Excel working
- **Mobile Responsive**: Works on all devices

**Next Steps:**
1. Run the SQL schema above
2. Test user registration
3. Start using the real system!

🎓 **Your production-ready educational management system is live!**
