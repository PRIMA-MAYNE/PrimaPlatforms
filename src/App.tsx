import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ui/error-boundary";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";

// Public pages (code-split)
const Landing = React.lazy(() => import("./pages/Landing"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const EmailVerification = React.lazy(() => import("./pages/EmailVerification"));

// Protected pages (code-split)
const Index = React.lazy(() => import("./pages/Index"));
const AttendanceTracker = React.lazy(() => import("./pages/AttendanceTracker"));
const LessonPlanning = React.lazy(() => import("./pages/LessonPlanning"));
const AssessmentGenerator = React.lazy(() => import("./pages/AssessmentGenerator"));
const PerformanceTracker = React.lazy(() => import("./pages/PerformanceTracker"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <AuthErrorBoundary>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <React.Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/verify-email" element={<EmailVerification />} />

                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/attendance"
                      element={
                        <ProtectedRoute>
                          <AttendanceTracker />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/lesson-planning"
                      element={
                        <ProtectedRoute>
                          <LessonPlanning />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/assessment"
                      element={
                        <ProtectedRoute>
                          <AssessmentGenerator />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/performance"
                      element={
                        <ProtectedRoute>
                          <PerformanceTracker />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </React.Suspense>
              </BrowserRouter>
            </AuthErrorBoundary>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
