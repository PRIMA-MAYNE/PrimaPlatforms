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
} from "lucide-react";

const DashboardContent: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your educational command center for managing classes, tracking
          progress, and generating insights.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Students"
          value="0"
          description="Add your first class"
          icon={Users}
        />
        <StatsCard
          title="Attendance Rate"
          value="0%"
          description="Start taking attendance"
          icon={CheckCircle}
        />
        <StatsCard
          title="Lesson Plans"
          value="0"
          description="AI-powered"
          icon={FileText}
        />
        <StatsCard
          title="Assessments"
          value="0"
          description="Auto-generated"
          icon={ClipboardList}
        />
      </div>

      {/* Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Module */}
        <Link to="/attendance">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-catalyst-100">
                  <Users className="w-5 h-5 text-catalyst-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Class Attendance</CardTitle>
                  <CardDescription>
                    Track student presence and generate reports
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Today's Classes
                  </span>
                  <Badge variant="outline">Add classes to begin</Badge>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Set up your first class to start taking attendance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* AI Lesson Planning Module */}
        <Link to="/lesson-planning">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-catalyst-100">
                  <FileText className="w-5 h-5 text-catalyst-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Lesson Planning</CardTitle>
                  <CardDescription>
                    Generate ECZ-aligned lesson plans with DeepSeek AI
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    AI Engine
                  </span>
                  <Badge className="catalyst-gradient text-white">
                    DeepSeek AI
                  </Badge>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Create professional lesson plans instantly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Assessment Generator Module */}
        <Link to="/assessment">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-catalyst-100">
                  <ClipboardList className="w-5 h-5 text-catalyst-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Assessment Generator
                  </CardTitle>
                  <CardDescription>
                    Create intelligent assessments and marking schemes
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Question Types
                  </span>
                  <Badge variant="outline">Multiple formats</Badge>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Generate questions with AI assistance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Performance Tracker Module */}
        <Link to="/performance">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-catalyst-100">
                  <TrendingUp className="w-5 h-5 text-catalyst-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Performance Tracker</CardTitle>
                  <CardDescription>
                    Monitor student progress and analytics
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Analytics
                  </span>
                  <Badge variant="outline">Real-time</Badge>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Track progress and identify improvements
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Analytics Module */}
        <Link to="/analytics">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-catalyst-100">
                  <BarChart3 className="w-5 h-5 text-catalyst-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Advanced Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive insights and reporting
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-catalyst-600 transition-colors ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reports</span>
                  <Badge variant="outline">Interactive</Badge>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Visualize data and generate reports
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and updates</CardDescription>
            </div>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start using the modules to see activity here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
