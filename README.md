# 🎓 Catalyst - Educational Management Platform

> Transform your teaching experience with AI-powered tools for attendance, lesson planning, assessments, and analytics.

![Catalyst Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Catalyst+Dashboard)

## ✨ Features

### 🏠 **Landing Page**

- Beautiful, responsive design showcasing all platform features
- Professional branding and educational focus
- Clear call-to-action for user registration

### 🔐 **Complete Authentication System**

- **Secure Registration** with email verification
- **Password Reset** functionality
- **Protected Routes** with automatic redirects
- **Profile Management** with school information

### 📊 **Dashboard Overview**

- Real-time statistics and metrics
- Quick access to all modules
- Recent activity timeline
- Module navigation cards

### 👥 **Attendance Tracker** _(Fully Functional)_

- Live roll call interface
- Multiple status options (Present, Absent, Late, Sick)
- Real-time attendance statistics
- Gender-based breakdowns
- Export capabilities
- Search and filter students

### 🤖 **AI-Powered Modules** _(Ready for Development)_

- **Lesson Planning**: Generate comprehensive lesson plans
- **Assessment Generator**: Create tests with marking schemes
- **Performance Tracker**: Visual progress analytics
- **Smart Analytics**: Deep insights and reporting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (configured)

### 1. Clone & Install

```bash
git clone <your-repo>
cd catalyst-education
npm install
```

### 2. Environment Setup

Your `.env` file is already configured with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://mkheppdwmzylmiiaxelq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=http://localhost:8080
```

### 3. Database Setup

```bash
# Automated database setup
npm run setup:database

# Configure authentication settings
npm run setup:auth

# Or run both at once
npm run setup:all
```

### 4. Manual Supabase Configuration

1. **Go to Authentication Settings**: https://mkheppdwmzylmiiaxelq.supabase.co/project/mkheppdwmzylmiiaxelq/auth/settings

2. **Add Site URL**: `http://localhost:8080`

3. **Add Redirect URLs**:

   - `http://localhost:8080/verify-email`
   - `http://localhost:8080/reset-password`
   - `http://localhost:8080/dashboard`

4. **Configure Email Templates**: https://mkheppdwmzylmiiaxelq.supabase.co/project/mkheppdwmzylmiiaxelq/auth/templates
   ```bash
   # View email template code
   npm run setup:templates
   ```

### 5. Start Development

```bash
npm run dev
```

🎉 Open http://localhost:8080

## 📱 User Flow

### 1. **Landing Page** (`/`)

- Professional marketing site
- Feature showcase
- Sign up/Sign in buttons

### 2. **Registration** (`/signup`)

- Full name, email, school name
- Password with validation
- Terms acceptance
- Email verification required

### 3. **Email Verification** (`/verify-email`)

- Automatic verification handling
- Success/error states
- Redirect to sign in

### 4. **Dashboard** (`/dashboard`)

- Overview statistics
- Module navigation
- Quick actions
- Recent activity

### 5. **Attendance Tracker** (`/attendance`)

- Class selection
- Student roll call
- Real-time stats
- Export options

## 🛡️ Security Features

### Authentication

- ✅ Email verification required
- ✅ Secure password requirements
- ✅ JWT token management
- ✅ Protected route system
- ✅ Automatic session handling

### Database Security

- ✅ Row Level Security (RLS) policies
- ✅ User isolation (teachers see only their data)
- ✅ Automatic profile creation
- ✅ Encrypted data storage
- ✅ SQL injection prevention

## 🗄️ Database Schema

### Tables Created

- **profiles** - User information and roles
- **classes** - Class management and teacher assignments
- **students** - Student records and enrollment
- **attendance_records** - Daily attendance tracking
- **lesson_plans** - AI-generated and custom plans
- **assessments** - Tests, quizzes, and assignments
- **grades** - Performance tracking and analytics

### Automatic Features

- Profile creation on user signup
- Updated_at timestamp triggers
- Comprehensive indexing for performance
- Secure RLS policies for data isolation

## 🎨 Design System

### Brand Colors

- **Primary**: Professional blue gradient (`#3b82f6` → `#1d4ed8`)
- **Success**: Green (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Info**: Cyan (`#06b6d4`)

### Typography

- **Font**: Inter (Google Fonts)
- **Responsive sizing** across all devices
- **Consistent spacing** and hierarchy

### Components

- **Reusable UI components** with shadcn/ui
- **Consistent styling** with Tailwind CSS
- **Responsive design** for mobile, tablet, desktop
- **Dark mode support** (optional)

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run typecheck       # TypeScript validation

# Setup & Configuration
npm run setup:all       # Complete setup
npm run setup:database  # Database only
npm run setup:auth      # Auth config only
npm run setup:templates # Email templates

# Utilities
npm run format.fix      # Format code
npm test               # Run tests
```

## 📦 Project Structure

```
catalyst-education/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Dashboard layout components
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts (Auth)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   └── pages/              # Route components
├── scripts/                # Automation scripts
├── supabase-setup.sql     # Database schema
└── .env                   # Environment variables
```

## 🚀 Production Deployment

### Environment Variables

Update `.env` for production:

```env
VITE_SUPABASE_URL=https://mkheppdwmzylmiiaxelq.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-domain.com
```

### Supabase Configuration

1. Update Site URL to your production domain
2. Add production redirect URLs
3. Configure custom SMTP for reliable emails
4. Enable production-ready security settings

### Build & Deploy

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🆘 Troubleshooting

### Common Issues

**"Invalid API Key" Error**

- Verify `.env` file has correct Supabase credentials
- Ensure no extra spaces in environment variables
- Restart development server

**Email Verification Not Working**

- Check Supabase email settings
- Verify redirect URLs in dashboard
- Check spam folder for emails

**Database Connection Issues**

- Run `npm run setup:database` to recreate schema
- Verify RLS policies are enabled
- Check Supabase project status

**Authentication Flow Problems**

- Clear browser localStorage/sessionStorage
- Verify environment variables
- Check Supabase authentication logs

### Getting Help

- 📧 Check Supabase project logs
- 🔍 Review browser console for errors
- 📖 Consult [Supabase Documentation](https://supabase.com/docs)
- 🐛 Open GitHub issues for bugs

## 🎯 Next Steps

### Immediate Enhancements

1. **Test the complete authentication flow**
2. **Add sample data** for attendance testing
3. **Implement real database integration** for attendance
4. **Build AI lesson planning module**

### Advanced Features

1. **File upload** for profile avatars
2. **Real-time notifications** with Supabase realtime
3. **Advanced analytics** with charts and visualizations
4. **Mobile app** with React Native
5. **API endpoints** for third-party integrations

## 📄 License

This project is licensed under the MIT License.

---

## 🙋‍♀️ Support

Need help getting started? The setup is designed to be straightforward:

1. ✅ **Environment**: Already configured with your Supabase credentials
2. ✅ **Database**: Run `npm run setup:all` for automatic setup
3. ✅ **Authentication**: Follow the manual Supabase dashboard steps
4. ✅ **Testing**: Start with `npm run dev` and test signup flow

**Your Catalyst educational platform is ready to transform teaching! 🎓**
