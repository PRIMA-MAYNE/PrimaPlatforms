# 🗄️ **SUPABASE SETUP GUIDE - CATALYST EDUCATION**

## 🚀 **STEP-BY-STEP PRODUCTION SETUP**

### **Prerequisites**
- Supabase account (https://supabase.com)
- Environment variables configured
- No mock/demo data (real production system)

---

## **PHASE 1: CREATE SUPABASE PROJECT**

### **1. Create New Project**
```bash
1. Go to https://supabase.com
2. Sign up/Sign in
3. Click "New Project"
4. Choose organization
5. Enter project details:
   - Name: "catalyst-education-prod"
   - Database Password: [SECURE PASSWORD]
   - Region: [CLOSEST TO USERS]
6. Click "Create new project"
7. Wait for project initialization (~2 minutes)
```

### **2. Get API Keys**
```bash
1. Go to Project Settings → API
2. Copy these values:
   - Project URL: https://your-project.supabase.co
   - anon/public key: eyJhbGc...
   - service_role key: eyJhbGc... (keep secret!)
```

---

## **PHASE 2: DATABASE SETUP**

### **1. Run SQL Schema**
```sql
-- Go to SQL Editor in Supabase Dashboard
-- Copy and paste the complete schema from supabase/schema.sql
-- Click "Run" to execute

-- The schema includes:
-- ✅ User profiles and authentication
-- ✅ Educational structure (schools, classes, students)
-- ✅ Lesson planning and curriculum
-- ✅ Assessments and grading system
-- ✅ Attendance tracking
-- ✅ Real-time notifications
-- ✅ Performance analytics
-- ✅ Row-level security (RLS)
-- ✅ Indexes for performance
-- ✅ Real-time subscriptions
```

### **2. Verify Schema**
```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- attendance, assessments, assessment_questions, 
-- classes, lesson_plans, notifications, 
-- performance_analytics, profiles, schools, 
-- students, student_assessments
```

---

## **PHASE 3: ENVIRONMENT CONFIGURATION**

### **1. Update Environment Variables**

**Production (.env.production):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=https://your-domain.com
VITE_APP_NAME=Catalyst Educational Management System
NODE_ENV=production
```

**Local Development (.env):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Catalyst Educational Management System (Dev)
NODE_ENV=development
```

### **2. Authentication Setup**

**In Supabase Dashboard → Authentication → Settings:**
```bash
Site URL: https://your-domain.com (production)
Additional Redirect URLs:
- http://localhost:5173 (development)
- https://your-domain.com/auth/callback

Email Templates: Customize as needed
Providers: Email (enabled by default)
```

---

## **PHASE 4: REAL-TIME FEATURES**

### **1. Enable Real-time**
```sql
-- In SQL Editor, run:
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_assessments;
```

### **2. Test Real-time**
```javascript
// Test in browser console after deployment:
supabase
  .channel('test')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'notifications' },
    (payload) => console.log('Real-time working:', payload)
  )
  .subscribe();
```

---

## **PHASE 5: SECURITY & PERFORMANCE**

### **1. Row Level Security (RLS)**
```sql
-- Verify RLS is enabled:
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Should show all main tables with RLS enabled
```

### **2. Performance Indexes**
```sql
-- Check indexes are created:
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Should show performance indexes for:
-- students, classes, attendance, assessments, etc.
```

---

## **PHASE 6: DATA VALIDATION**

### **1. Test User Registration**
```bash
1. Use the app sign-up form
2. Check if profile is created in profiles table
3. Verify user can sign in
4. Check if RLS policies work (user sees only their data)
```

### **2. Test Core Features**
```bash
✅ Create a class → Check classes table
✅ Add students → Check students table  
✅ Generate lesson plan → Check lesson_plans table
✅ Create assessment → Check assessments + assessment_questions tables
✅ Mark attendance → Check attendance table
✅ Real-time notifications → Check notifications table
```

---

## **PHASE 7: PRODUCTION DEPLOYMENT**

### **1. Build and Deploy**
```bash
# Build with production environment
npm run build:production

# Deploy to your hosting platform
# (Netlify, Vercel, etc.)
```

### **2. Post-Deployment Tests**
```bash
✅ User registration/login works
✅ All CRUD operations work
✅ Real-time notifications appear
✅ Export functions work
✅ No console errors
✅ Mobile responsive
✅ Performance acceptable
```

---

## **PHASE 8: MONITORING & BACKUP**

### **1. Enable Monitoring**
```bash
Supabase Dashboard → Settings → General
- Enable API logging
- Set up webhooks (optional)
- Monitor usage/performance
```

### **2. Backup Strategy**
```bash
Supabase Dashboard → Settings → Database
- Enable Point-in-Time Recovery
- Set backup retention (7-30 days)
- Test backup restoration process
```

---

## **🎯 PRODUCTION CHECKLIST**

### **Database Setup**
- [ ] Supabase project created
- [ ] Complete SQL schema deployed
- [ ] All tables created successfully
- [ ] RLS policies enabled and tested
- [ ] Indexes created for performance
- [ ] Real-time subscriptions working

### **Authentication**
- [ ] User registration working
- [ ] User login/logout working
- [ ] Profile creation automatic
- [ ] Password reset functional
- [ ] Email verification (if enabled)
- [ ] Demo mode removed

### **Core Features**
- [ ] Class management working
- [ ] Student management working
- [ ] Lesson plan generation + save to DB
- [ ] Assessment creation + save to DB
- [ ] Attendance tracking with DB persistence
- [ ] Real-time notifications working
- [ ] Export functions (PDF/DOCX/Excel) working

### **Performance & Security**
- [ ] No mock data (all real DB data)
- [ ] RLS prevents unauthorized data access
- [ ] Queries optimized with indexes
- [ ] Real-time updates working
- [ ] No JavaScript errors
- [ ] Mobile responsive

### **Deployment**
- [ ] Environment variables configured
- [ ] Production build successful
- [ ] Application deployed
- [ ] Domain configured
- [ ] SSL enabled
- [ ] Monitoring enabled

---

## **🚨 TROUBLESHOOTING**

### **Common Issues**

**"Missing environment variables":**
```bash
- Check .env files have correct Supabase URL/keys
- Restart dev server after .env changes
- Verify keys copied correctly (no extra spaces)
```

**"RLS policy violations":**
```bash
- Check user is properly authenticated
- Verify profile was created during signup
- Check RLS policies match your data structure
```

**"Real-time not working":**
```bash
- Ensure tables added to supabase_realtime publication
- Check WebSocket connection in browser dev tools
- Verify channel subscriptions are set up correctly
```

**"Export functions failing":**
```bash
- Check all export dependencies installed
- Verify data exists in database
- Check browser console for errors
```

---

## **📞 SUPPORT**

### **Resources**
- Supabase Documentation: https://supabase.com/docs
- Catalyst Schema: `supabase/schema.sql`
- Service Layer: `src/lib/supabase-service.ts`
- Type Definitions: `src/lib/database.types.ts`

### **Key Features**
- **No Mock Data**: 100% real database integration
- **Real-time**: Live notifications and updates
- **ECZ Aligned**: Education system compliant
- **Production Ready**: Secure, scalable, performant

---

**🎓 Your Catalyst Educational Management System is now ready for production with full Supabase integration!**
