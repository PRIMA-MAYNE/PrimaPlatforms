import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AttendanceTracker from "./pages/AttendanceTracker";
import LessonPlanning from "./pages/LessonPlanning";
import AssessmentGenerator from "./pages/AssessmentGenerator";
import PerformanceTracker from "./pages/PerformanceTracker";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/attendance" element={<AttendanceTracker />} />
            <Route path="/lesson-planning" element={<LessonPlanning />} />
            <Route
              path="/assessment-generator"
              element={<AssessmentGenerator />}
            />
            <Route
              path="/performance-tracker"
              element={<PerformanceTracker />}
            />
            <Route path="/analytics" element={<Analytics />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
