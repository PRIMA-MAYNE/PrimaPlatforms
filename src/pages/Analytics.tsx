import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Target,
  Award,
  AlertCircle,
  Sparkles,
  Download,
  BarChart3,
  Brain,
  Calendar,
  FileText,
} from "lucide-react";
import { generateEducationalInsights } from "@/lib/immediate-ai";
import { toast } from "@/hooks/use-toast";
import AdvancedCharts from "@/components/analytics/AdvancedCharts";

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  date: string;
  class: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "present" | "absent" | "late" | "sick";
  class: string;
}

interface Student {
  id: string;
  name: string;
  class: string;
  gender: "Male" | "Female";
}

interface Class {
  id: string;
  name: string;
  grade: string;
  students: Student[];
}

const Analytics: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedClasses = localStorage.getItem("catalyst-classes");
    const savedGrades = localStorage.getItem("catalyst-grades");
    const savedAttendance = localStorage.getItem("catalyst-attendance");

    if (savedClasses) {
      try {
        const parsedClasses = JSON.parse(savedClasses);
        setClasses(parsedClasses);
        if (parsedClasses.length > 0 && !selectedClass) {
          setSelectedClass(parsedClasses[0].id);
        }
      } catch (error) {
        console.error("Error loading classes:", error);
      }
    }

    if (savedGrades) {
      try {
        setGrades(JSON.parse(savedGrades));
      } catch (error) {
        console.error("Error loading grades:", error);
      }
    }

    if (savedAttendance) {
      try {
        setAttendance(JSON.parse(savedAttendance));
      } catch (error) {
        console.error("Error loading attendance:", error);
      }
    }
  }, []);

  // Update students when class selection changes
  useEffect(() => {
    if (selectedClass) {
      const currentClass = classes.find((c) => c.id === selectedClass);
      if (currentClass) {
        setStudents(currentClass.students);
      }
    }
  }, [selectedClass, classes]);

  // Generate insights when class or data changes
  useEffect(() => {
    if (selectedClass && (grades.length > 0 || attendance.length > 0)) {
      generateInsights();
    }
  }, [selectedClass, grades, attendance]);

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const classGrades = grades.filter((g) => g.class === selectedClass);
      const classAttendance = attendance.filter(
        (a) => a.class === selectedClass,
      );

      const data = {
        grades: classGrades,
        attendance: classAttendance,
        students: students,
      };

      const result = await generateEducationalInsights(data);
      setInsights(result);
    } catch (error) {
      console.error("Insights generation failed:", error);
      toast({
        title: "Insights Failed",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const getClassGrades = () => {
    return grades.filter((g) => g.class === selectedClass);
  };

  const getClassAttendance = () => {
    return attendance.filter((a) => a.class === selectedClass);
  };

  const getOverviewData = () => {
    const classGrades = getClassGrades();
    const classAttendance = getClassAttendance();

    if (classGrades.length === 0) return null;

    const totalAssessments = classGrades.length;
    const averageScore =
      classGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
      totalAssessments;

    const attendanceRate =
      classAttendance.length > 0
        ? (classAttendance.filter((a) => a.status === "present").length /
            classAttendance.length) *
          100
        : 0;

    const uniqueStudents = new Set(classGrades.map((g) => g.studentId)).size;

    return {
      totalStudents: students.length,
      activeStudents: uniqueStudents,
      totalAssessments,
      averageScore: Math.round(averageScore),
      attendanceRate: Math.round(attendanceRate),
    };
  };

  const getAttendanceAnalytics = () => {
    const classAttendance = getClassAttendance();

    const attendanceByStatus = {
      present: classAttendance.filter((a) => a.status === "present").length,
      absent: classAttendance.filter((a) => a.status === "absent").length,
      late: classAttendance.filter((a) => a.status === "late").length,
      sick: classAttendance.filter((a) => a.status === "sick").length,
    };

    const attendanceByDate = classAttendance.reduce(
      (acc, record) => {
        const date = record.date;
        if (!acc[date]) {
          acc[date] = { date, present: 0, absent: 0, total: 0 };
        }
        acc[date].total++;
        if (record.status === "present") {
          acc[date].present++;
        } else {
          acc[date].absent++;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    const attendanceTrend = Object.values(attendanceByDate)
      .map((day: any) => ({
        ...day,
        rate: Math.round((day.present / day.total) * 100),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days

    return {
      byStatus: Object.entries(attendanceByStatus).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round(
          (count / Math.max(classAttendance.length, 1)) * 100,
        ),
      })),
      trend: attendanceTrend,
    };
  };

  const getPerformanceAnalytics = () => {
    const classGrades = getClassGrades();

    if (classGrades.length === 0) return null;

    // Performance by subject
    const subjects = [...new Set(classGrades.map((g) => g.subject))];
    const subjectPerformance = subjects.map((subject) => {
      const subjectGrades = classGrades.filter((g) => g.subject === subject);
      const average =
        subjectGrades.reduce(
          (sum, g) => sum + (g.score / g.maxScore) * 100,
          0,
        ) / subjectGrades.length;

      return {
        subject,
        average: Math.round(average),
        assessments: subjectGrades.length,
      };
    });

    // Performance by grade band
    const percentages = classGrades.map((g) => (g.score / g.maxScore) * 100);
    const gradeBands = {
      distinction: percentages.filter((p) => p >= 75).length,
      credit: percentages.filter((p) => p >= 65 && p < 75).length,
      merit: percentages.filter((p) => p >= 50 && p < 65).length,
      pass: percentages.filter((p) => p >= 35 && p < 50).length,
      fail: percentages.filter((p) => p < 35).length,
    };

    // Performance trend over time
    const dateGroups = classGrades.reduce(
      (acc, grade) => {
        const date = grade.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push((grade.score / grade.maxScore) * 100);
        return acc;
      },
      {} as Record<string, number[]>,
    );

    const performanceTrend = Object.entries(dateGroups)
      .map(([date, scores]) => ({
        date,
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        assessments: scores.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Last 10 data points

    return {
      bySubject: subjectPerformance,
      gradeBands: Object.entries(gradeBands).map(([grade, count]) => ({
        grade,
        count,
        percentage: Math.round((count / percentages.length) * 100),
      })),
      trend: performanceTrend,
    };
  };

  const getCorrelationData = () => {
    const classGrades = getClassGrades();
    const classAttendance = getClassAttendance();

    if (classGrades.length === 0 || classAttendance.length === 0) return null;

    const correlationData = students.map((student) => {
      const studentGrades = classGrades.filter(
        (g) => g.studentId === student.id,
      );
      const studentAttendance = classAttendance.filter(
        (a) => a.studentId === student.id,
      );

      const averageScore =
        studentGrades.length > 0
          ? studentGrades.reduce(
              (sum, g) => sum + (g.score / g.maxScore) * 100,
              0,
            ) / studentGrades.length
          : 0;

      const attendanceRate =
        studentAttendance.length > 0
          ? (studentAttendance.filter((a) => a.status === "present").length /
              studentAttendance.length) *
            100
          : 0;

      return {
        name: student.name,
        attendance: Math.round(attendanceRate),
        performance: Math.round(averageScore),
      };
    });

    return correlationData.filter(
      (data) => data.attendance > 0 && data.performance > 0,
    );
  };

  const currentClass = classes.find((c) => c.id === selectedClass);
  const overview = getOverviewData();
  const attendanceAnalytics = getAttendanceAnalytics();
  const performanceAnalytics = getPerformanceAnalytics();
  const correlationData = getCorrelationData();

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#6b7280"];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive analytics with AI-powered educational insights
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateInsights}
              disabled={isGeneratingInsights}
            >
              <Brain className="w-4 h-4 mr-2" />
              {isGeneratingInsights ? "Generating..." : "Refresh Insights"}
            </Button>
          </div>
        </div>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Class for Analytics</CardTitle>
            <CardDescription>
              Choose a class to view detailed analytics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls.students.length} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentClass && overview && (
                <div className="space-y-2">
                  <Label>Class Overview</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{currentClass.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {overview.totalStudents} students •{" "}
                      {overview.averageScore}% avg • {overview.attendanceRate}%
                      attendance
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedClass ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {overview && (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-blue-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                              Total Students
                            </p>
                            <p className="text-2xl font-bold">
                              {overview.totalStudents}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Target className="h-8 w-8 text-green-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                              Active Students
                            </p>
                            <p className="text-2xl font-bold">
                              {overview.activeStudents}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <BookOpen className="h-8 w-8 text-purple-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                              Assessments
                            </p>
                            <p className="text-2xl font-bold">
                              {overview.totalAssessments}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Award className="h-8 w-8 text-yellow-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                              Avg Performance
                            </p>
                            <p className="text-2xl font-bold">
                              {overview.averageScore}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Calendar className="h-8 w-8 text-red-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-muted-foreground">
                              Attendance Rate
                            </p>
                            <p className="text-2xl font-bold">
                              {overview.attendanceRate}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance vs Attendance Correlation */}
                    {correlationData && correlationData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Attendance vs Performance</CardTitle>
                          <CardDescription>
                            Correlation between attendance and academic
                            performance
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={correlationData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="attendance" />
                              <YAxis />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="performance"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.3}
                                name="Performance %"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Subject Performance */}
                    {performanceAnalytics && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Subject Performance</CardTitle>
                          <CardDescription>
                            Average performance by subject
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceAnalytics.bySubject}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="subject" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Bar
                                dataKey="average"
                                fill="#22c55e"
                                name="Average %"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Advanced visualizations */}
                  <AdvancedCharts
                    performanceBySubject={performanceAnalytics?.bySubject || []}
                    gradeBands={performanceAnalytics?.gradeBands || []}
                    attendanceByStatus={attendanceAnalytics?.byStatus || []}
                    attendanceTrend={attendanceAnalytics?.trend || []}
                    correlation={correlationData || []}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6">
              {attendanceAnalytics && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance by Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendance Breakdown</CardTitle>
                        <CardDescription>
                          Distribution of attendance status
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={attendanceAnalytics.byStatus}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="count"
                              nameKey="status"
                              label={({ status, percentage }) =>
                                `${status}: ${percentage}%`
                              }
                            >
                              {attendanceAnalytics.byStatus.map(
                                (entry, index) => (
                                  <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ),
                              )}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Attendance Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendance Trend</CardTitle>
                        <CardDescription>
                          Daily attendance rate over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={attendanceAnalytics.trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="rate"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              name="Attendance Rate %"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {performanceAnalytics && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Grade Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Grade Distribution</CardTitle>
                        <CardDescription>
                          ECZ grade bands distribution
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={performanceAnalytics.gradeBands}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              fill="#3b82f6"
                              name="Number of Students"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Performance Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Trend</CardTitle>
                        <CardDescription>
                          Class average performance over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={performanceAnalytics.trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="average"
                              stroke="#22c55e"
                              strokeWidth={2}
                              name="Class Average %"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Subject Performance Radar */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Performance Radar</CardTitle>
                      <CardDescription>
                        Multi-dimensional view of subject performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={performanceAnalytics.bySubject}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis domain={[0, 100]} />
                          <Radar
                            name="Average Performance"
                            dataKey="average"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-catalyst-600" />
                    <span>AI-Powered Educational Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Intelligent analysis and recommendations based on class data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGeneratingInsights ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-catalyst-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Generating AI insights...
                      </p>
                    </div>
                  ) : insights ? (
                    <div className="space-y-6">
                      {/* Attendance Insights */}
                      {insights.attendanceInsights && (
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-medium text-blue-900 mb-2">
                            Attendance Analysis
                          </h4>
                          <p className="text-sm text-blue-700 mb-2">
                            Overall Rate:{" "}
                            {insights.attendanceInsights.overallRate}%
                          </p>
                          <p className="text-sm text-blue-700">
                            {insights.attendanceInsights.patterns}
                          </p>
                          {insights.attendanceInsights.concerns.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-blue-900">
                                Concerns:
                              </p>
                              <ul className="text-sm text-blue-700">
                                {insights.attendanceInsights.concerns.map(
                                  (concern: string, index: number) => (
                                    <li key={index}>• {concern}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Performance Insights */}
                      {insights.performanceInsights && (
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <h4 className="font-medium text-green-900 mb-2">
                            Performance Analysis
                          </h4>
                          {insights.performanceInsights.strongestSubject && (
                            <p className="text-sm text-green-700">
                              Strongest Subject:{" "}
                              {insights.performanceInsights.strongestSubject}
                            </p>
                          )}
                          {insights.performanceInsights.weakestSubject && (
                            <p className="text-sm text-green-700">
                              Needs Improvement:{" "}
                              {insights.performanceInsights.weakestSubject}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Correlation Insights */}
                      {insights.correlationInsights && (
                        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                          <h4 className="font-medium text-yellow-900 mb-2">
                            Attendance-Performance Correlation
                          </h4>
                          <p className="text-sm text-yellow-700 mb-2">
                            Correlation:{" "}
                            {insights.correlationInsights.correlation}
                          </p>
                          <p className="text-sm text-yellow-700 mb-2">
                            {insights.correlationInsights.insight}
                          </p>
                          <p className="text-sm text-yellow-700">
                            Recommendation:{" "}
                            {insights.correlationInsights.recommendation}
                          </p>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">AI Recommendations</h3>
                        <ul className="space-y-2">
                          {insights.recommendations.map(
                            (rec: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <span className="text-catalyst-600 font-medium mt-1">
                                  •
                                </span>
                                <span className="text-sm">{rec}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No insights available yet. Add data to generate AI
                        insights.
                      </p>
                      <Button onClick={generateInsights}>
                        Generate Insights
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>
                    Export comprehensive analytics reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                    >
                      <FileText className="w-6 h-6" />
                      <span>Class Summary Report</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                    >
                      <BarChart3 className="w-6 h-6" />
                      <span>Performance Analytics</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                    >
                      <Calendar className="w-6 h-6" />
                      <span>Attendance Report</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                    >
                      <Brain className="w-6 h-6" />
                      <span>AI Insights Report</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                    >
                      <Target className="w-6 h-6" />
                      <span>Individual Progress</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                    >
                      <Award className="w-6 h-6" />
                      <span>ECZ Grade Analysis</span>
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reports are generated based on current class selection and
                    include comprehensive analytics, AI insights, and
                    ECZ-aligned assessments.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select a class to view comprehensive analytics and
                insights.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
