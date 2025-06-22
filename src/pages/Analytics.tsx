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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Target,
  BookOpen,
  Award,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { generateEducationalInsights } from "@/lib/ai-service";
import { toast } from "@/hooks/use-toast";

interface AnalyticsData {
  attendance: Array<{ date: string; status: string; studentId: string }>;
  grades: Array<{
    score: number;
    studentId: string;
    subject: string;
    date: string;
  }>;
  students: Array<{ id: string; name: string; gender: string }>;
}

const Analytics: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for demonstration
  const [analyticsData] = useState<AnalyticsData>({
    attendance: [
      { date: "2024-01-15", status: "present", studentId: "1" },
      { date: "2024-01-15", status: "present", studentId: "2" },
      { date: "2024-01-15", status: "absent", studentId: "3" },
      { date: "2024-01-16", status: "present", studentId: "1" },
      { date: "2024-01-16", status: "late", studentId: "2" },
      { date: "2024-01-16", status: "present", studentId: "3" },
    ],
    grades: [
      { score: 85, studentId: "1", subject: "Mathematics", date: "2024-01-15" },
      { score: 78, studentId: "2", subject: "Mathematics", date: "2024-01-15" },
      { score: 92, studentId: "3", subject: "Mathematics", date: "2024-01-15" },
      { score: 88, studentId: "1", subject: "Science", date: "2024-01-16" },
      { score: 82, studentId: "2", subject: "Science", date: "2024-01-16" },
    ],
    students: [
      { id: "1", name: "Alice Johnson", gender: "Female" },
      { id: "2", name: "Bob Smith", gender: "Male" },
      { id: "3", name: "Carol Brown", gender: "Female" },
    ],
  });

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const insightsData = generateEducationalInsights(analyticsData);
      setInsights(insightsData);
    } catch (error) {
      toast({
        title: "Failed to Generate Insights",
        description: "Error analyzing data. Using fallback insights.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceOverviewData = () => {
    const statusCounts = analyticsData.attendance.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: Math.round((count / analyticsData.attendance.length) * 100),
    }));
  };

  const getSubjectPerformanceData = () => {
    const subjectMap = new Map();
    analyticsData.grades.forEach((grade) => {
      if (!subjectMap.has(grade.subject)) {
        subjectMap.set(grade.subject, []);
      }
      subjectMap.get(grade.subject).push(grade.score);
    });

    return Array.from(subjectMap.entries()).map(([subject, scores]) => ({
      subject,
      average: Math.round(
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      ),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      count: scores.length,
    }));
  };

  const getPerformanceTrendsData = () => {
    const dateMap = new Map();
    analyticsData.grades.forEach((grade) => {
      const date = grade.date;
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date).push(grade.score);
    });

    return Array.from(dateMap.entries())
      .map(([date, scores]) => ({
        date: new Date(date).toLocaleDateString(),
        average: Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
        ),
        assessments: scores.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getGenderPerformanceData = () => {
    const genderMap = new Map();
    analyticsData.grades.forEach((grade) => {
      const student = analyticsData.students.find(
        (s) => s.id === grade.studentId,
      );
      if (student) {
        if (!genderMap.has(student.gender)) {
          genderMap.set(student.gender, []);
        }
        genderMap.get(student.gender).push(grade.score);
      }
    });

    return Array.from(genderMap.entries()).map(([gender, scores]) => ({
      gender,
      average: Math.round(
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      ),
      count: scores.length,
    }));
  };

  const getRadarChartData = () => {
    const subjects = [...new Set(analyticsData.grades.map((g) => g.subject))];
    return subjects.map((subject) => {
      const subjectGrades = analyticsData.grades.filter(
        (g) => g.subject === subject,
      );
      const average =
        subjectGrades.reduce((sum, g) => sum + g.score, 0) /
        subjectGrades.length;
      return {
        subject,
        performance: Math.round(average),
        fullMark: 100,
      };
    });
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const handleExport = (format: "pdf" | "excel") => {
    const reportData = `
CATALYST ANALYTICS REPORT
Generated on: ${new Date().toLocaleDateString()}

=== ATTENDANCE OVERVIEW ===
${getAttendanceOverviewData()
  .map((item) => `${item.status}: ${item.count} (${item.percentage}%)`)
  .join("\n")}

=== SUBJECT PERFORMANCE ===
${getSubjectPerformanceData()
  .map(
    (item) =>
      `${item.subject}: Average ${item.average}%, Range ${item.lowest}-${item.highest}%`,
  )
  .join("\n")}

=== AI INSIGHTS ===
${insights?.attendanceInsights ? `Attendance Rate: ${insights.attendanceInsights.overallRate}%` : ""}
${insights?.performanceInsights ? `Strongest Subject: ${insights.performanceInsights.strongestSubject}` : ""}
${insights?.recommendations ? insights.recommendations.join("\n") : ""}

=== CLASS STATISTICS ===
Total Students: ${analyticsData.students.length}
Total Assessments: ${analyticsData.grades.length}
Total Attendance Records: ${analyticsData.attendance.length}
    `;

    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalyst_analytics_report.${format === "pdf" ? "txt" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: `Analytics report downloaded as ${format.toUpperCase()}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground">
              Comprehensive data analysis and intelligent educational insights
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Students
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.students.length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-catalyst-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Attendance Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {insights?.attendanceInsights?.overallRate || "N/A"}%
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Avg Performance
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.round(
                          analyticsData.grades.reduce(
                            (sum, g) => sum + g.score,
                            0,
                          ) / analyticsData.grades.length,
                        ) || 0}
                        %
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-info" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Assessments
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.grades.length}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance Radar</CardTitle>
                  <CardDescription>
                    Comparative performance across subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getRadarChartData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis
                        angle={0}
                        domain={[0, 100]}
                        tick={false}
                      />
                      <Radar
                        name="Performance"
                        dataKey="performance"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Class average over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getPerformanceTrendsData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="average"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            {/* Attendance Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of attendance status across all records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getAttendanceOverviewData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ status, percentage }) =>
                          `${status}: ${percentage}%`
                        }
                      >
                        {getAttendanceOverviewData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attendance Insights</CardTitle>
                  <CardDescription>
                    AI-powered attendance pattern analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights?.attendanceInsights ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Overall Attendance Rate</span>
                        <Badge className="bg-success/10 text-success">
                          {insights.attendanceInsights.overallRate}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Patterns Detected:</h4>
                        <p className="text-sm text-muted-foreground">
                          {insights.attendanceInsights.patterns}
                        </p>
                      </div>
                      {insights.attendanceInsights.concerns?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2 text-warning" />
                            Areas of Concern:
                          </h4>
                          {insights.attendanceInsights.concerns.map(
                            (concern: string, index: number) => (
                              <p
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                • {concern}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Generating attendance insights...
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of performance by subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getSubjectPerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar
                      dataKey="average"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="highest"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="lowest"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Demographics</CardTitle>
                <CardDescription>
                  Analysis of performance patterns across different groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={getGenderPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="gender" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar
                        dataKey="average"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    <h4 className="font-medium">Key Observations:</h4>
                    {getGenderPerformanceData().map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span>{item.gender} Students</span>
                        <div className="text-right">
                          <div className="font-semibold">{item.average}%</div>
                          <div className="text-sm text-muted-foreground">
                            {item.count} assessments
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {insights ? (
              <>
                {/* Performance Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-catalyst-600" />
                      <span>AI Performance Insights</span>
                    </CardTitle>
                    <CardDescription>
                      Intelligent analysis of academic performance patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.performanceInsights && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-success/10 rounded-lg">
                            <h4 className="font-medium text-success mb-2">
                              Strongest Subject
                            </h4>
                            <p className="text-lg font-semibold">
                              {insights.performanceInsights.strongestSubject ||
                                "N/A"}
                            </p>
                          </div>
                          <div className="p-4 bg-warning/10 rounded-lg">
                            <h4 className="font-medium text-warning mb-2">
                              Needs Attention
                            </h4>
                            <p className="text-lg font-semibold">
                              {insights.performanceInsights.weakestSubject ||
                                "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Subject Performance:</h4>
                          {insights.performanceInsights.subjectPerformance?.map(
                            (subject: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <span>{subject.subject}</span>
                                <Badge
                                  variant={
                                    subject.average >= 80
                                      ? "default"
                                      : subject.average >= 70
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {subject.average}%
                                </Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Correlation Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance-Performance Correlation</CardTitle>
                    <CardDescription>
                      Relationship between attendance and academic performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {insights.correlationInsights && (
                      <div className="space-y-4">
                        <div className="p-4 bg-info/10 rounded-lg">
                          <h4 className="font-medium mb-2">
                            Correlation Strength:{" "}
                            <span className="text-info">
                              {insights.correlationInsights.correlation}
                            </span>
                          </h4>
                          <p className="text-muted-foreground">
                            {insights.correlationInsights.insight}
                          </p>
                        </div>
                        <div className="p-3 border-l-4 border-catalyst-500 bg-muted/50">
                          <p className="font-medium">Recommendation:</p>
                          <p className="text-muted-foreground">
                            {insights.correlationInsights.recommendation}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Teaching Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Teaching Recommendations</CardTitle>
                    <CardDescription>
                      Data-driven suggestions for improving educational outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.recommendations?.map(
                        (recommendation: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <Award className="w-5 h-5 text-catalyst-600 mt-0.5" />
                            <p>{recommendation}</p>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Generating AI Insights
                  </h3>
                  <p className="text-muted-foreground">
                    Analyzing your data to provide intelligent educational
                    insights...
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Report Generation */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Comprehensive Reports</CardTitle>
                <CardDescription>
                  Export detailed analytics in various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-catalyst-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-catalyst-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Performance Report</h3>
                        <p className="text-sm text-muted-foreground">
                          Detailed academic performance analysis
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleExport("pdf")}
                    >
                      Generate Report
                    </Button>
                  </div>

                  <div className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Attendance Report</h3>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive attendance analytics
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleExport("excel")}
                    >
                      Generate Report
                    </Button>
                  </div>

                  <div className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-info" />
                      </div>
                      <div>
                        <h3 className="font-semibold">AI Insights Report</h3>
                        <p className="text-sm text-muted-foreground">
                          Machine learning insights and recommendations
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleExport("pdf")}
                    >
                      Generate Report
                    </Button>
                  </div>

                  <div className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Summary Dashboard</h3>
                        <p className="text-sm text-muted-foreground">
                          Executive summary for administrators
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleExport("pdf")}
                    >
                      Generate Report
                    </Button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Report Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Comprehensive data analysis and visualizations</li>
                    <li>• AI-powered insights and recommendations</li>
                    <li>• Performance trends and patterns</li>
                    <li>• Attendance correlation analysis</li>
                    <li>• Actionable teaching strategies</li>
                    <li>• Professional formatting for presentations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
