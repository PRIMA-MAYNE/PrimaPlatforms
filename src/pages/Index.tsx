import React from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  ClipboardList,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Target,
  Sparkles,
  Plus,
} from "lucide-react";

const DashboardContent: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg catalyst-gradient flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your AI-powered education command center
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Students"
          value="0"
          description="Add classes"
          icon={Users}
        />
        <StatsCard
          title="Attendance"
          value="0%"
          description="Start tracking"
          icon={CheckCircle}
        />
        <StatsCard
          title="Lessons"
          value="0"
          description="AI-generated"
          icon={FileText}
        />
        <StatsCard
          title="Assessments"
          value="0"
          description="Auto-created"
          icon={ClipboardList}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Get started with these common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/attendance" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-3" />
                <span className="text-left">
                  <div className="text-sm font-medium">Add Students</div>
                  <div className="text-xs text-muted-foreground">
                    Start taking attendance
                  </div>
                </span>
              </Button>
            </Link>
            <Link to="/lesson-planning" className="block">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-3" />
                <span className="text-left">
                  <div className="text-sm font-medium">Create Lesson</div>
                  <div className="text-xs text-muted-foreground">
                    AI-powered planning
                  </div>
                </span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Module */}
        <Link to="/attendance" className="block">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl catalyst-gradient flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Attendance Tracker</CardTitle>
                  <CardDescription>
                    Smart attendance with 40-day tracking
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors ml-auto" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Status
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Ready to use
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="py-2">
                    <div className="text-lg sm:text-xl font-bold text-green-600">
                      0
                    </div>
                    <div className="text-xs text-muted-foreground">Present</div>
                  </div>
                  <div className="py-2">
                    <div className="text-lg sm:text-xl font-bold text-red-600">
                      0
                    </div>
                    <div className="text-xs text-muted-foreground">Absent</div>
                  </div>
                  <div className="py-2">
                    <div className="text-lg sm:text-xl font-bold text-yellow-600">
                      0
                    </div>
                    <div className="text-xs text-muted-foreground">Late</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* AI Lesson Planning Module */}
        <Link to="/lesson-planning" className="block">
          <Card className="touch-card group hover:border-catalyst-300 transition-all duration-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-3 sm:pb-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl catalyst-gradient flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="mobile-heading text-foreground group-hover:text-catalyst-600 transition-colors">
                    AI Lesson Planning
                  </CardTitle>
                  <CardDescription className="mobile-text">
                    DeepSeek AI-powered ECZ-aligned lessons
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    AI Engine
                  </span>
                  <Badge className="catalyst-gradient text-white text-xs">
                    DeepSeek AI
                  </Badge>
                </div>
                <div className="text-center py-2">
                  <div className="text-lg sm:text-xl font-bold text-catalyst-600">
                    Ready
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Generate ECZ-aligned lesson plans instantly
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Assessment Generator Module */}
        <Link to="/assessment" className="block">
          <Card className="touch-card group hover:border-catalyst-300 transition-all duration-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-3 sm:pb-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl catalyst-gradient flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="mobile-heading text-foreground group-hover:text-catalyst-600 transition-colors">
                    Assessment Generator
                  </CardTitle>
                  <CardDescription className="mobile-text">
                    Intelligent question generation
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Question Types
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Multiple formats
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="py-2">
                    <div className="text-sm font-bold text-blue-600">MCQ</div>
                    <div className="text-xs text-muted-foreground">
                      Multiple Choice
                    </div>
                  </div>
                  <div className="py-2">
                    <div className="text-sm font-bold text-purple-600">
                      Essay
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Long Answer
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Performance Tracker Module */}
        <Link to="/performance" className="block">
          <Card className="touch-card group hover:border-catalyst-300 transition-all duration-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-3 sm:pb-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl catalyst-gradient flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="mobile-heading text-foreground group-hover:text-catalyst-600 transition-colors">
                    Performance Tracker
                  </CardTitle>
                  <CardDescription className="mobile-text">
                    Student progress analytics
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Analytics
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Real-time
                  </Badge>
                </div>
                <div className="text-center py-2">
                  <div className="text-lg sm:text-xl font-bold text-green-600">
                    Ready
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Track progress and identify improvements
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="touch-card">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="mobile-heading">Recent Activity</CardTitle>
              <CardDescription className="mobile-text">
                Latest actions and updates
              </CardDescription>
            </div>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="mobile-text text-muted-foreground">
                No recent activity
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Start using the modules to see activity here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-4 sm:py-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Catalyst Educational Management System - Powered by DeepSeek AI
        </p>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
};

export default Index;
