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
import { Input } from "@/components/ui/input";
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
  Plus,
  BarChart3,
} from "lucide-react";
import { analyzePerformance } from "@/lib/enhanced-local-ai";
import { toast } from "@/hooks/use-toast";

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

const PerformanceTracker: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const [newGrade, setNewGrade] = useState({
    studentId: "",
    subject: "",
    assessmentName: "",
    score: "",
    maxScore: "100",
    date: new Date().toISOString().split("T")[0],
  });

  // Load data from localStorage
  useEffect(() => {
    const savedClasses = localStorage.getItem("catalyst-classes");
    const savedGrades = localStorage.getItem("catalyst-grades");

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

  // Save grades to localStorage
  useEffect(() => {
    localStorage.setItem("catalyst-grades", JSON.stringify(grades));
  }, [grades]);

  // Generate analytics when class or grades change
  useEffect(() => {
    if (selectedClass && grades.length > 0) {
      const classGrades = grades.filter((g) => g.class === selectedClass);
      if (classGrades.length > 0) {
        generateAnalytics(classGrades);
      }
    }
  }, [selectedClass, grades]);

  const generateAnalytics = async (classGrades: Grade[]) => {
    setIsGeneratingInsights(true);
    try {
      const result = analyzePerformance(classGrades);
      setAnalytics(result);
    } catch (error) {
      console.error("Analytics generation failed:", error);
      toast({
        title: "Analytics Failed",
        description: "Failed to generate analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleAddGrade = () => {
    if (
      !newGrade.studentId ||
      !newGrade.subject ||
      !newGrade.assessmentName ||
      !newGrade.score ||
      !selectedClass
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const student = students.find((s) => s.id === newGrade.studentId);
    if (!student) {
      toast({
        title: "Student Not Found",
        description: "Please select a valid student",
        variant: "destructive",
      });
      return;
    }

    const grade: Grade = {
      id: `grade_${Date.now()}`,
      studentId: newGrade.studentId,
      studentName: student.name,
      subject: newGrade.subject,
      assessmentName: newGrade.assessmentName,
      score: parseInt(newGrade.score),
      maxScore: parseInt(newGrade.maxScore),
      date: newGrade.date,
      class: selectedClass,
    };

    setGrades((prev) => [...prev, grade]);
    setNewGrade({
      studentId: "",
      subject: "",
      assessmentName: "",
      score: "",
      maxScore: "100",
      date: new Date().toISOString().split("T")[0],
    });

    toast({
      title: "Grade Added",
      description: `Grade recorded for ${student.name}`,
    });
  };

  const getClassGrades = () => {
    return grades.filter((g) => g.class === selectedClass);
  };

  const getClassOverviewData = () => {
    const classGrades = getClassGrades();
    if (classGrades.length === 0) return [];

    const subjects = [...new Set(classGrades.map((g) => g.subject))];

    return subjects.map((subject) => {
      const subjectGrades = classGrades.filter((g) => g.subject === subject);
      const average =
        subjectGrades.reduce(
          (sum, g) => sum + (g.score / g.maxScore) * 100,
          0,
        ) / subjectGrades.length;
      const passRate =
        (subjectGrades.filter((g) => (g.score / g.maxScore) * 100 >= 50)
          .length /
          subjectGrades.length) *
        100;

      return {
        subject,
        average: Math.round(average),
        passRate: Math.round(passRate),
        assessments: subjectGrades.length,
      };
    });
  };

  const getStudentProgressData = () => {
    const classGrades = getClassGrades();

    return students.map((student) => {
      const studentGrades = classGrades.filter(
        (g) => g.studentId === student.id,
      );
      const average =
        studentGrades.length > 0
          ? studentGrades.reduce(
              (sum, g) => sum + (g.score / g.maxScore) * 100,
              0,
            ) / studentGrades.length
          : 0;

      return {
        name: student.name,
        average: Math.round(average),
        assessments: studentGrades.length,
        gender: student.gender,
      };
    });
  };

  const getTrendData = () => {
    const classGrades = getClassGrades();
    const dateGroups = classGrades.reduce(
      (acc, grade) => {
        const date = grade.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push((grade.score / grade.maxScore) * 100);
        return acc;
      },
      {} as Record<string, number[]>,
    );

    return Object.entries(dateGroups)
      .map(([date, scores]) => ({
        date,
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        assessments: scores.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Last 10 data points
  };

  const getGradeDistribution = () => {
    const classGrades = getClassGrades();
    const percentages = classGrades.map((g) => (g.score / g.maxScore) * 100);

    const distribution = {
      distinction: percentages.filter((p) => p >= 75).length,
      credit: percentages.filter((p) => p >= 65 && p < 75).length,
      merit: percentages.filter((p) => p >= 50 && p < 65).length,
      pass: percentages.filter((p) => p >= 35 && p < 50).length,
      fail: percentages.filter((p) => p < 35).length,
    };

    return [
      {
        name: "Distinction (75%+)",
        value: distribution.distinction,
        color: "#22c55e",
      },
      { name: "Credit (65-74%)", value: distribution.credit, color: "#3b82f6" },
      { name: "Merit (50-64%)", value: distribution.merit, color: "#f59e0b" },
      { name: "Pass (35-49%)", value: distribution.pass, color: "#ef4444" },
      { name: "Fail (<35%)", value: distribution.fail, color: "#6b7280" },
    ].filter((item) => item.value > 0);
  };

  const currentClass = classes.find((c) => c.id === selectedClass);
  const classGrades = getClassGrades();
  const classOverview = getClassOverviewData();
  const studentProgress = getStudentProgressData();
  const trendData = getTrendData();
  const gradeDistribution = getGradeDistribution();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Performance Tracker
            </h1>
            <p className="text-muted-foreground">
              Track and analyze student academic performance with AI insights
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button className="catalyst-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Grade
            </Button>
          </div>
        </div>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
            <CardDescription>
              Choose a class to view performance analytics
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
              {currentClass && (
                <div className="space-y-2">
                  <Label>Class Information</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{currentClass.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentClass.grade} • {currentClass.students.length}{" "}
                      students • {classGrades.length} assessments
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedClass ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Class Overview</TabsTrigger>
              <TabsTrigger value="individual">Individual Progress</TabsTrigger>
              <TabsTrigger value="insights">AI Analytics</TabsTrigger>
              <TabsTrigger value="add-grades">Add Grades</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Students
                        </p>
                        <p className="text-2xl font-bold">{students.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BookOpen className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Assessments
                        </p>
                        <p className="text-2xl font-bold">
                          {classGrades.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Class Average
                        </p>
                        <p className="text-2xl font-bold">
                          {classGrades.length > 0
                            ? Math.round(
                                classGrades.reduce(
                                  (sum, g) =>
                                    sum + (g.score / g.maxScore) * 100,
                                  0,
                                ) / classGrades.length,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          Pass Rate
                        </p>
                        <p className="text-2xl font-bold">
                          {classGrades.length > 0
                            ? Math.round(
                                (classGrades.filter(
                                  (g) => (g.score / g.maxScore) * 100 >= 50,
                                ).length /
                                  classGrades.length) *
                                  100,
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Performance</CardTitle>
                    <CardDescription>
                      Average scores and pass rates by subject
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {classOverview.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={classOverview}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="average"
                            fill="#3b82f6"
                            name="Average %"
                          />
                          <Bar
                            dataKey="passRate"
                            fill="#22c55e"
                            name="Pass Rate %"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No assessment data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                    <CardDescription>
                      Distribution of grades across ECZ grade bands
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gradeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={gradeDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {gradeDistribution.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-300 flex items-center justify-center text-muted-foreground">
                        No grade data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>
                    Class average performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Class Average %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-muted-foreground">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="individual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Individual Student Progress</CardTitle>
                  <CardDescription>
                    Performance overview for each student in the class
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentProgress.length > 0 ? (
                    <div className="space-y-4">
                      {studentProgress.map((student) => (
                        <div
                          key={student.name}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-catalyst-100">
                              <span className="text-sm font-medium text-catalyst-700">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {student.gender} • {student.assessments}{" "}
                                assessments
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {student.average}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Average
                              </p>
                            </div>
                            <div className="flex items-center">
                              {student.average >= 75 ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Distinction
                                </Badge>
                              ) : student.average >= 65 ? (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Credit
                                </Badge>
                              ) : student.average >= 50 ? (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Merit
                                </Badge>
                              ) : student.average >= 35 ? (
                                <Badge className="bg-orange-100 text-orange-800">
                                  Pass
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Fail</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No student data available for this class
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-catalyst-600" />
                    <span>AI-Generated Insights</span>
                  </CardTitle>
                  <CardDescription>
                    Intelligent analysis of class performance with ECZ alignment
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
                  ) : analytics ? (
                    <div className="space-y-6">
                      {/* Overview Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-catalyst-600">
                            {analytics.overview.average}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Class Average
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {analytics.overview.highest}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Highest Score
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">
                            {analytics.overview.lowest}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Lowest Score
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {analytics.overview.totalStudents}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Students
                          </p>
                        </div>
                      </div>

                      {/* Insights */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Key Insights</h3>
                        {analytics.insights.map(
                          (insight: any, index: number) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border-l-4 ${
                                insight.type === "positive"
                                  ? "border-green-500 bg-green-50"
                                  : insight.type === "warning"
                                    ? "border-yellow-500 bg-yellow-50"
                                    : "border-blue-500 bg-blue-50"
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                {insight.type === "positive" ? (
                                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                                ) : insight.type === "warning" ? (
                                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                ) : (
                                  <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5" />
                                )}
                                <p className="text-sm">{insight.message}</p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Recommendations</h3>
                        <ul className="space-y-2">
                          {analytics.recommendations.map(
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

                      {/* ECZ Alignment */}
                      {analytics.eczAlignment && (
                        <div className="p-4 bg-catalyst-50 rounded-lg border-l-4 border-catalyst-500">
                          <h4 className="font-medium text-catalyst-900 mb-2">
                            ECZ Alignment Assessment
                          </h4>
                          <p className="text-sm text-catalyst-700">
                            {analytics.eczAlignment}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        No analytics available yet. Add grades to generate AI
                        insights.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add-grades" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Grade</CardTitle>
                  <CardDescription>
                    Record assessment results for students in this class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student">Student *</Label>
                      <Select
                        value={newGrade.studentId}
                        onValueChange={(value) =>
                          setNewGrade((prev) => ({ ...prev, studentId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select
                        value={newGrade.subject}
                        onValueChange={(value) =>
                          setNewGrade((prev) => ({ ...prev, subject: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">
                            Mathematics
                          </SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Geography">Geography</SelectItem>
                          <SelectItem value="Civic Education">
                            Civic Education
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assessment">Assessment Name *</Label>
                      <Input
                        id="assessment"
                        placeholder="e.g., Mid-term Test, Quiz 1"
                        value={newGrade.assessmentName}
                        onChange={(e) =>
                          setNewGrade((prev) => ({
                            ...prev,
                            assessmentName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newGrade.date}
                        onChange={(e) =>
                          setNewGrade((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="score">Score *</Label>
                      <Input
                        id="score"
                        type="number"
                        placeholder="e.g., 85"
                        value={newGrade.score}
                        onChange={(e) =>
                          setNewGrade((prev) => ({
                            ...prev,
                            score: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxScore">Maximum Score *</Label>
                      <Input
                        id="maxScore"
                        type="number"
                        placeholder="e.g., 100"
                        value={newGrade.maxScore}
                        onChange={(e) =>
                          setNewGrade((prev) => ({
                            ...prev,
                            maxScore: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddGrade} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Grade
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Grades */}
              {classGrades.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Grades</CardTitle>
                    <CardDescription>
                      Latest assessment results for this class
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {classGrades
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime(),
                        )
                        .slice(0, 10)
                        .map((grade) => (
                          <div
                            key={grade.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{grade.studentName}</p>
                              <p className="text-sm text-muted-foreground">
                                {grade.subject} • {grade.assessmentName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {grade.score}/{grade.maxScore}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {Math.round(
                                  (grade.score / grade.maxScore) * 100,
                                )}
                                %
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select a class to view performance analytics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PerformanceTracker;
