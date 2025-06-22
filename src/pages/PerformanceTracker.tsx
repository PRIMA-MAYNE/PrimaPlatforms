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
  TrendingUp,
  LineChart,
  Users,
  Plus,
  Target,
  Award,
  AlertTriangle,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { analyzePerformance } from "@/lib/ai-service";
import { toast } from "@/hooks/use-toast";

interface Grade {
  studentId: string;
  studentName: string;
  assessmentId: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  date: string;
  subject: string;
}

interface Student {
  id: string;
  name: string;
  gender: string;
  class: string;
}

const PerformanceTracker: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Alice Johnson", gender: "Female", class: "Grade 10A" },
    { id: "2", name: "Bob Smith", gender: "Male", class: "Grade 10A" },
    { id: "3", name: "Carol Brown", gender: "Female", class: "Grade 10A" },
    { id: "4", name: "David Wilson", gender: "Male", class: "Grade 10A" },
    { id: "5", name: "Emma Davis", gender: "Female", class: "Grade 10A" },
  ]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [newGrade, setNewGrade] = useState({
    studentId: "",
    assessmentName: "",
    score: "",
    maxScore: "100",
    subject: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Sample data for demonstration
  useEffect(() => {
    const sampleGrades: Grade[] = [
      {
        studentId: "1",
        studentName: "Alice Johnson",
        assessmentId: "a1",
        assessmentName: "Math Test 1",
        score: 85,
        maxScore: 100,
        date: "2024-01-15",
        subject: "Mathematics",
      },
      {
        studentId: "1",
        studentName: "Alice Johnson",
        assessmentId: "a2",
        assessmentName: "Math Test 2",
        score: 92,
        maxScore: 100,
        date: "2024-02-15",
        subject: "Mathematics",
      },
      {
        studentId: "2",
        studentName: "Bob Smith",
        assessmentId: "a1",
        assessmentName: "Math Test 1",
        score: 78,
        maxScore: 100,
        date: "2024-01-15",
        subject: "Mathematics",
      },
      {
        studentId: "2",
        studentName: "Bob Smith",
        assessmentId: "a2",
        assessmentName: "Math Test 2",
        score: 82,
        maxScore: 100,
        date: "2024-02-15",
        subject: "Mathematics",
      },
    ];
    setGrades(sampleGrades);
  }, []);

  useEffect(() => {
    if (grades.length > 0) {
      const analyticsData = analyzePerformance(grades);
      setAnalytics(analyticsData);
    }
  }, [grades]);

  const handleAddGrade = () => {
    if (
      !newGrade.studentId ||
      !newGrade.assessmentName ||
      !newGrade.score ||
      !newGrade.subject
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const student = students.find((s) => s.id === newGrade.studentId);
    if (!student) return;

    const grade: Grade = {
      studentId: newGrade.studentId,
      studentName: student.name,
      assessmentId: `a${Date.now()}`,
      assessmentName: newGrade.assessmentName,
      score: parseFloat(newGrade.score),
      maxScore: parseFloat(newGrade.maxScore),
      date: newGrade.date,
      subject: newGrade.subject,
    };

    setGrades((prev) => [...prev, grade]);
    setNewGrade({
      studentId: "",
      assessmentName: "",
      score: "",
      maxScore: "100",
      subject: "",
      date: new Date().toISOString().split("T")[0],
    });

    toast({
      title: "Grade Added",
      description: "Student grade has been recorded successfully",
    });
  };

  const getStudentPerformanceData = (studentId: string) => {
    return grades
      .filter((g) => g.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((g) => ({
        date: new Date(g.date).toLocaleDateString(),
        percentage: Math.round((g.score / g.maxScore) * 100),
        assessment: g.assessmentName,
      }));
  };

  const getClassOverviewData = () => {
    const assessmentMap = new Map();
    grades.forEach((grade) => {
      const key = grade.assessmentName;
      if (!assessmentMap.has(key)) {
        assessmentMap.set(key, []);
      }
      assessmentMap.get(key).push((grade.score / grade.maxScore) * 100);
    });

    return Array.from(assessmentMap.entries()).map(([assessment, scores]) => ({
      assessment:
        assessment.length > 15
          ? assessment.substring(0, 15) + "..."
          : assessment,
      average: Math.round(
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      ),
      count: scores.length,
    }));
  };

  const getSubjectPerformanceData = () => {
    const subjectMap = new Map();
    grades.forEach((grade) => {
      const subject = grade.subject;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, []);
      }
      subjectMap.get(subject).push((grade.score / grade.maxScore) * 100);
    });

    return Array.from(subjectMap.entries()).map(([subject, scores]) => ({
      subject,
      average: Math.round(
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      ),
      students: new Set(
        grades.filter((g) => g.subject === subject).map((g) => g.studentId),
      ).size,
    }));
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
              Visual progress tracking and academic performance analytics
            </p>
          </div>
          <Button className="bg-info hover:bg-info/90 text-info-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Class Overview</TabsTrigger>
            <TabsTrigger value="individual">Individual Progress</TabsTrigger>
            <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
            <TabsTrigger value="add-grades">Add Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Class Average
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.overview?.average || 0}%
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
                        Highest Score
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.overview?.highest || 0}%
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Students Tracked
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.overview?.totalStudents || 0}
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
                        Assessments
                      </p>
                      <p className="text-2xl font-bold">
                        {analytics?.overview?.totalAssessments || 0}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Class Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Class Performance by Assessment</CardTitle>
                <CardDescription>
                  Average scores across different assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getClassOverviewData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="assessment" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar
                      dataKey="average"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
                <CardDescription>
                  Comparative analysis across different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getSubjectPerformanceData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="average"
                        label={({ subject, average }) =>
                          `${subject}: ${average}%`
                        }
                      >
                        {getSubjectPerformanceData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {getSubjectPerformanceData().map((subject, index) => (
                      <div
                        key={subject.subject}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="font-medium">{subject.subject}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {subject.average}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subject.students} students
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Student Progress</CardTitle>
                <CardDescription>
                  Select a student to view their detailed performance analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Label>Select Student:</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Choose a student" />
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
              </CardContent>
            </Card>

            {/* Individual Performance Chart */}
            {selectedStudent && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Progress for{" "}
                    {students.find((s) => s.id === selectedStudent)?.name}
                  </CardTitle>
                  <CardDescription>Performance trend over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={getStudentPerformanceData(selectedStudent)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics ? (
              <>
                {/* Performance Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-info" />
                      <span>AI Performance Insights</span>
                    </CardTitle>
                    <CardDescription>
                      Intelligent analysis of student performance patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analytics.insights?.map((insight: any, index: number) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          insight.type === "positive"
                            ? "bg-success/10 border-success"
                            : insight.type === "warning"
                              ? "bg-warning/10 border-warning"
                              : "bg-info/10 border-info"
                        }`}
                      >
                        <p className="font-medium">{insight.message}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Performance Trends */}
                {analytics.trends && analytics.trends.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Trends</CardTitle>
                      <CardDescription>
                        Class performance over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={analytics.trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="average"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                    <CardDescription>
                      Data-driven suggestions for improving student outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.recommendations?.map(
                        (recommendation: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <Target className="w-5 h-5 text-catalyst-600 mt-0.5" />
                            <p>{recommendation}</p>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Prediction */}
                {analytics.predictions && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Prediction</CardTitle>
                      <CardDescription>
                        AI-powered forecast based on current trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                        {analytics.predictions.trend === "improving" ? (
                          <TrendingUp className="w-8 h-8 text-success" />
                        ) : analytics.predictions.trend === "declining" ? (
                          <TrendingDown className="w-8 h-8 text-destructive" />
                        ) : (
                          <LineChart className="w-8 h-8 text-info" />
                        )}
                        <div>
                          <p className="font-semibold">
                            Predicted Next Performance:{" "}
                            {analytics.predictions.predicted}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Trend: {analytics.predictions.trend} • Confidence:{" "}
                            {analytics.predictions.confidence}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Analytics Available
                  </h3>
                  <p className="text-muted-foreground">
                    Add some grades to see AI-powered performance analytics
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="add-grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Student Grade</CardTitle>
                <CardDescription>
                  Record a new grade for performance tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Student *</Label>
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
                    <Label>Subject *</Label>
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
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assessment Name *</Label>
                    <Input
                      placeholder="e.g., Math Test 1, Science Quiz"
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
                    <Label>Date</Label>
                    <Input
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
                    <Label>Score *</Label>
                    <Input
                      type="number"
                      placeholder="Student's score"
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
                    <Label>Maximum Score</Label>
                    <Input
                      type="number"
                      placeholder="Total possible score"
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

                <Button
                  onClick={handleAddGrade}
                  className="w-full bg-info hover:bg-info/90 text-info-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grade
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PerformanceTracker;
