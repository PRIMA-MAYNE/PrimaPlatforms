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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Your educational command center for managing classes, tracking
          progress, and generating insights.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          description="Coming soon"
          icon={FileText}
        />
        <StatsCard
          title="Assessments"
          value="0"
          description="Coming soon"
          icon={ClipboardList}
        />
      </div>

      {/* Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    Set up your classes and start taking attendance to see
                    real-time statistics here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Lesson Planning Module */}
        <Link to="/lesson-planning">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
                  <FileText className="w-5 h-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Lesson Planning</CardTitle>
                  <CardDescription>
                    Generate comprehensive lesson plans instantly
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-success transition-colors ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    AI Lesson Planning
                  </span>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    AI-powered lesson plan generation will be available soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Assessment Generator */}
        <Link to="/assessment-generator">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
                  <ClipboardList className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Assessment Generator
                  </CardTitle>
                  <CardDescription>
                    Create tests with automated marking schemes
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-warning transition-colors ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Assessment Generation
                  </span>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span>ECZ Format Support</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Auto Marking Keys</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Performance Tracker */}
        <Link to="/performance-tracker">
          <Card className="module-card group">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-info/10">
                  <TrendingUp className="w-5 h-5 text-info" />
                </div>
                <div>
                  <CardTitle className="text-lg">Performance Tracker</CardTitle>
                  <CardDescription>
                    Visual progress tracking and analytics
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-info transition-colors ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Performance Analytics
                  </span>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Advanced performance tracking and analytics will be
                    available soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest actions and system updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Your recent activity will appear here once you start using the
                platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/attendance">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Take Attendance
              </Button>
            </Link>
            <Link to="/lesson-planning">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Create Lesson Plan
              </Button>
            </Link>
            <Link to="/assessment-generator">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="w-4 h-4 mr-2" />
                Generate Assessment
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
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
