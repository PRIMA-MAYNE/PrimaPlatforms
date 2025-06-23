# 🚀 Catalyst VS Code Setup & Launch Guide

## 📋 Prerequisites

### 1. Install Required Software

```bash
# Install Node.js (v18 or higher)
# Download from: https://nodejs.org/

# Verify installation
node --version
npm --version
```

### 2. Install VS Code Extensions (Recommended)

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **Thunder Client** (for API testing)

---

## 📁 Project Setup

### Step 1: Get the Project Files

```bash
# If you have the project as a ZIP file, extract it
# Or if using Git:
git clone <your-repository-url>
cd catalyst-education
```

### Step 2: Open in VS Code

```bash
# From terminal
code .

# Or open VS Code and use File → Open Folder
```

### Step 3: Install Dependencies

```bash
# In VS Code terminal (Terminal → New Terminal)
npm install
```

---

## 🔧 Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.example .env
```

### Step 2: Configure Supabase (Required)

**Option A: Use Existing Supabase Project**
If you have a Supabase project:

```env
# Edit .env file
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:5173
```

**Option B: Create New Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Create account and new project
3. Go to Settings → API
4. Copy URL and anon key to .env file

### Step 3: Setup Database Schema

```bash
# Run database setup (if you have service role key)
npm run setup:database

# Or manually run the SQL from supabase-setup.sql in your Supabase dashboard
```

---

## 🚀 Launch the Application

### Method 1: Using VS Code Terminal

```bash
# In VS Code terminal
npm run dev
```

### Method 2: Using VS Code Tasks

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Tasks: Run Task"
3. Select "npm: dev"

### Method 3: Using Package.json Scripts

1. Open `package.json`
2. Click the "Run" button next to "dev" script

---

## 🌐 Access the Application

Once running, open your browser to:

```
http://localhost:5173
```

You should see the Catalyst landing page with pink branding!

---

## 🛠️ VS Code Configuration for Optimal Development

### 1. Create VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 2. Create Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

### 3. Create Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "npm",
      "script": "dev",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Build Production",
      "type": "npm",
      "script": "build",
      "group": "build"
    },
    {
      "label": "Type Check",
      "type": "npm",
      "script": "typecheck",
      "group": "test"
    }
  ]
}
```

---

## 🔍 Debugging in VS Code

### 1. Enable Source Maps

The project is already configured for debugging with source maps.

### 2. Set Breakpoints

- Click in the gutter next to line numbers to set breakpoints
- Use `debugger;` statements in your code for programmatic breakpoints

### 3. Debug in Browser

1. Start the dev server (`npm run dev`)
2. Press `F5` or go to Run → Start Debugging
3. Select "Launch Chrome" configuration

---

## 📝 Development Workflow

### 1. File Structure Navigation

Use VS Code's Explorer or `Ctrl+P` to quickly navigate:

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── lib/                # Utilities and services
├── contexts/           # React contexts
└── hooks/              # Custom React hooks
```

### 2. Key Commands

- `Ctrl+Shift+P`: Command palette
- `Ctrl+P`: Quick file open
- `Ctrl+Shift+F`: Global search
- `Ctrl+D`: Select next occurrence
- `Alt+Shift+F`: Format document

### 3. Useful Snippets

Type these in .tsx files:

- `rafce`: React Arrow Function Component Export
- `useState`: React useState hook
- `useEffect`: React useEffect hook

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "Module not found" errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: TypeScript errors

```bash
# Check TypeScript
npm run typecheck

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Issue 3: Port already in use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or change port in vite.config.ts:
export default defineConfig({
  server: {
    port: 3000
  }
})
```

### Issue 4: Supabase connection issues

1. Check your .env file has correct values
2. Verify Supabase project is active
3. Check browser console for authentication errors

### Issue 5: Hot reload not working

```bash
# Restart the dev server
Ctrl+C (to stop)
npm run dev (to restart)
```

---

## 🚀 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Project opened in VS Code
- [ ] Dependencies installed (`npm install`)
- [ ] .env file configured with Supabase credentials
- [ ] Dev server running (`npm run dev`)
- [ ] Application accessible at http://localhost:5173
- [ ] VS Code extensions installed (optional but recommended)

---

## 🎯 Ready to Develop!

Once everything is set up, you can:

1. **Create accounts**: Use the signup form with auto-confirm
2. **Add classes**: Create your first class in Attendance Tracker
3. **Add students**: Import students or add manually
4. **Generate content**: Try the AI lesson planning and assessment tools
5. **Track performance**: Add grades and view analytics

### Pro Tips:

- Use the integrated terminal in VS Code (`Ctrl+``) for all commands
- Install the recommended extensions for better development experience
- Use Git integration in VS Code for version control
- Take advantage of TypeScript intellisense for better code completion

**Happy coding with Catalyst! 🎓✨**
