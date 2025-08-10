# 🚀 Production Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for authentication)
- Domain name (for production deployment)

## 1. Environment Setup

### Create Production Environment File

```bash
cp .env.example .env.production
```

Update `.env.production` with your production values:

```env
# Production Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Production App Configuration
VITE_APP_URL=https://your-domain.com
VITE_APP_NAME=Catalyst Educational Management System
VITE_APP_VERSION=1.0.0

# Production Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_EXPORTS=true
VITE_ENABLE_AI_FEATURES=true

# Environment
NODE_ENV=production
```

## 2. Supabase Setup

### Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'teacher',
  school_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Authentication Configuration

1. Go to Authentication > Settings in Supabase
2. Set your site URL: `https://your-domain.com`
3. Add redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com`
4. Configure email templates if needed

## 3. Build and Deploy

### Option A: Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Enable automatic deploys

### Option B: Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

### Option C: Docker Deployment

```bash
# Build Docker image
docker build -t catalyst-education .

# Run container
docker run -d -p 80:80 --name catalyst-app catalyst-education
```

### Option D: Traditional VPS/Server

```bash
# Build the application
npm run build

# Upload dist/ folder to your web server
# Configure nginx/apache to serve the files
# Ensure SPA routing is configured
```

## 4. Domain and SSL

### Setup Custom Domain

1. Point your domain to your hosting provider
2. Configure SSL certificate (Let's Encrypt recommended)
3. Update environment variables with production URLs
4. Test all functionality

## 5. Performance Optimization

### Enable CDN

- CloudFlare (recommended)
- AWS CloudFront
- Netlify CDN (if using Netlify)

### Monitor Performance

- Set up analytics (Google Analytics)
- Monitor Core Web Vitals
- Use performance monitoring tools

## 6. Security Checklist

- ✅ HTTPS enabled
- ✅ Security headers configured
- ✅ Content Security Policy implemented
- ✅ Environment variables secured
- ✅ Supabase RLS policies enabled
- ✅ Regular dependency updates

## 7. Backup and Monitoring

### Database Backups

- Enable automatic backups in Supabase
- Test restore procedures
- Document backup schedule

### Application Monitoring

- Set up uptime monitoring
- Configure error tracking (Sentry recommended)
- Monitor application performance

## 8. Launch Checklist

### Pre-Launch

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Authentication working
- [ ] All features tested in production environment
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] SSL certificate installed
- [ ] Backup procedures tested

### Post-Launch

- [ ] Monitor application performance
- [ ] Check error logs
- [ ] Verify all features working
- [ ] Test user registration flow
- [ ] Validate export functionality
- [ ] Confirm AI features working

## 9. Maintenance

### Regular Tasks

- Update dependencies monthly
- Monitor security vulnerabilities
- Review performance metrics
- Backup verification
- User feedback collection

### Updates and Releases

- Use semantic versioning
- Test in staging environment
- Document changes
- Communicate with users

## 10. Support and Documentation

### User Documentation

- Create user guides
- Video tutorials
- FAQ section
- Contact information

### Technical Documentation

- API documentation
- Database schema
- Deployment procedures
- Troubleshooting guide

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Authentication Issues:**
- Verify Supabase URLs and keys
- Check redirect URLs configuration
- Ensure RLS policies are correct

**Performance Issues:**
- Enable gzip compression
- Optimize images
- Implement lazy loading
- Use CDN for static assets

### Support Contacts

- Technical Support: [your-email]
- Documentation: [documentation-url]
- Bug Reports: [github-issues-url]

---

**Deployment Complete!** 🎉

Your Catalyst Educational Management System is now ready for production use.
