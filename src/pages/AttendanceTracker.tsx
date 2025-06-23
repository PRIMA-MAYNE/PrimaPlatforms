import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Thermometer,
  Calendar,
  Download,
  Search,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentManagement } from "@/components/attendance/StudentManagement";
import {
  exportAttendanceToExcel,
  exportDayAttendanceToExcel,
} from "@/lib/export-utils";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  admissionNumber: string;
  class: string;
  status: "present" | "absent" | "late" | "sick" | null;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  students: Student[];
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "present" | "absent" | "late" | "sick";
  week: number;
  day: number;
  term: string;
}

type AttendanceStatus = "present" | "absent" | "late" | "sick" | null;

const AttendanceTracker: React.FC = () => {
  // State management
  const [classes, setClasses] = useState<Class[]>([
    {
      id: "demo-class",
      name: "Grade 10A - Mathematics",
      grade: "Grade 10",
      students: [],
    },
  ]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rollCallActive, setRollCallActive] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [currentTerm, setCurrentTerm] = useState("Term 1");

  // Load saved data from localStorage
  useEffect(() => {
    const savedClasses = localStorage.getItem("catalyst-classes");
    const savedAttendance = localStorage.getItem("catalyst-attendance");

    if (savedClasses) {
      try {
        const parsedClasses = JSON.parse(savedClasses);
        setClasses(parsedClasses);
      } catch (error) {
        console.error("Error loading classes:", error);
      }
    }

    if (savedAttendance) {
      try {
        const parsedAttendance = JSON.parse(savedAttendance);
        setAttendanceRecords(parsedAttendance);
      } catch (error) {
        console.error("Error loading attendance:", error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("catalyst-classes", JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(
      "catalyst-attendance",
      JSON.stringify(attendanceRecords),
    );
  }, [attendanceRecords]);

  // Update students when class selection changes
  useEffect(() => {
    if (selectedClass) {
      const currentClass = classes.find((c) => c.id === selectedClass);
      if (currentClass) {
        // Reset status for new session
        const studentsWithStatus = currentClass.students.map((student) => ({
          ...student,
          status: getTodayAttendanceStatus(student.id, currentDate),
        }));
        setStudents(studentsWithStatus);
      }
    }
  }, [selectedClass, classes, currentDate, attendanceRecords]);

  const getTodayAttendanceStatus = (
    studentId: string,
    date: string,
  ): AttendanceStatus => {
    const record = attendanceRecords.find(
      (r) => r.studentId === studentId && r.date === date,
    );
    return record?.status || null;
  };

  const getCurrentWeekAndDay = (date: string) => {
    const dateObj = new Date(date);
    const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((dateObj.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7,
    );
    const dayOfWeek = dateObj.getDay();

    // Convert to school week (1-8 for 40 days) and day (1-5 for Mon-Fri)
    const schoolWeek = Math.min(8, Math.ceil(weekNumber / 5));
    const schoolDay = dayOfWeek === 0 ? 5 : dayOfWeek === 6 ? 5 : dayOfWeek; // Weekend maps to Friday

    return { week: schoolWeek, day: schoolDay };
  };

  const updateAttendanceStatus = (
    studentId: string,
    status: AttendanceStatus,
  ) => {
    // Update student status
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student,
      ),
    );

    // Update/create attendance record
    if (status) {
      const { week, day } = getCurrentWeekAndDay(currentDate);

      const existingRecordIndex = attendanceRecords.findIndex(
        (r) => r.studentId === studentId && r.date === currentDate,
      );

      const record: AttendanceRecord = {
        id:
          existingRecordIndex >= 0
            ? attendanceRecords[existingRecordIndex].id
            : `att_${Date.now()}_${studentId}`,
        studentId,
        date: currentDate,
        status,
        week,
        day,
        term: currentTerm,
      };

      if (existingRecordIndex >= 0) {
        setAttendanceRecords((prev) =>
          prev.map((r, i) => (i === existingRecordIndex ? record : r)),
        );
      } else {
        setAttendanceRecords((prev) => [...prev, record]);
      }
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = students.filter((s) => s.status === "present").length;
    const absent = students.filter((s) => s.status === "absent").length;
    const late = students.filter((s) => s.status === "late").length;
    const sick = students.filter((s) => s.status === "sick").length;
    const pending = students.filter((s) => s.status === null).length;

    return { total, present, absent, late, sick, pending };
  };

  const getTermStats = () => {
    const termRecords = attendanceRecords.filter((r) => r.term === currentTerm);
    const studentIds = new Set(termRecords.map((r) => r.studentId));

    const stats = Array.from(studentIds).map((studentId) => {
      const studentRecords = termRecords.filter(
        (r) => r.studentId === studentId,
      );
      const present = studentRecords.filter(
        (r) => r.status === "present",
      ).length;
      const total = studentRecords.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      const student = students.find((s) => s.id === studentId);
      return {
        studentId,
        studentName: student?.name || "Unknown",
        present,
        total,
        percentage,
      };
    });

    return stats.sort((a, b) => b.percentage - a.percentage);
  };

  const handleClassUpdate = (updatedClasses: Class[]) => {
    setClasses(updatedClasses);
  };

  const handleStudentAdd = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
  };

  const handleExportDailyAttendance = () => {
    if (!selectedClass || students.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please select a class with students",
        variant: "destructive",
      });
      return;
    }

    const currentClass = classes.find((c) => c.id === selectedClass);
    exportDayAttendanceToExcel(
      students,
      currentDate,
      currentClass?.name || "Unknown Class",
    );

    toast({
      title: "Export Successful",
      description: "Daily attendance exported to Excel",
    });
  };

  const handleExport40DayRegister = () => {
    if (!selectedClass || students.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please select a class with students",
        variant: "destructive",
      });
      return;
    }

    const currentClass = classes.find((c) => c.id === selectedClass);
    const classAttendance = attendanceRecords.filter((r) =>
      students.some((s) => s.id === r.studentId),
    );

    exportAttendanceToExcel(
      students,
      classAttendance,
      currentClass?.name || "Unknown Class",
    );

    toast({
      title: "Export Successful",
      description: "40-day attendance register exported to Excel",
    });
  };

  const stats = getAttendanceStats();
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "late":
        return <Clock className="w-5 h-5 text-warning" />;
      case "sick":
        return <Thermometer className="w-5 h-5 text-info" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
        );
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "bg-success/10 text-success border-success/20";
      case "absent":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "late":
        return "bg-warning/10 text-warning border-warning/20";
      case "sick":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Attendance Tracker
            </h1>
            <p className="text-muted-foreground">
              Track student attendance and generate comprehensive 40-day
              registers
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDailyAttendance}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport40DayRegister}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              40-Day Register
            </Button>
            <Button
              variant={rollCallActive ? "destructive" : "default"}
              onClick={() => setRollCallActive(!rollCallActive)}
            >
              {rollCallActive ? "End Roll Call" : "Start Roll Call"}
            </Button>
          </div>
        </div>

        {/* Class Selection and Management */}
        <Card>
          <CardHeader>
            <CardTitle>Class Management</CardTitle>
            <CardDescription>
              Select class and manage students for attendance tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
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
              <div className="space-y-2">
                <Label htmlFor="date-select">Date</Label>
                <Input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term-select">Term</Label>
                <Select value={currentTerm} onValueChange={setCurrentTerm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Student Management Component */}
            <StudentManagement
              classes={classes}
              selectedClass={selectedClass}
              onClassUpdate={handleClassUpdate}
              onStudentAdd={handleStudentAdd}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="roll-call" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roll-call">Roll Call</TabsTrigger>
            <TabsTrigger value="summary">Daily Summary</TabsTrigger>
            <TabsTrigger value="term-stats">Term Statistics</TabsTrigger>
            <TabsTrigger value="reports">Reports & Export</TabsTrigger>
          </TabsList>

          <TabsContent value="roll-call" className="space-y-6">
            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatsCard
                title="Total Students"
                value={stats.total}
                icon={Users}
                className="text-center"
              />
              <StatsCard
                title="Present"
                value={stats.present}
                icon={CheckCircle}
                className="text-center"
              />
              <StatsCard
                title="Absent"
                value={stats.absent}
                icon={XCircle}
                className="text-center"
              />
              <StatsCard
                title="Late"
                value={stats.late}
                icon={Clock}
                className="text-center"
              />
              <StatsCard
                title="Sick"
                value={stats.sick}
                icon={Thermometer}
                className="text-center"
              />
            </div>

            {/* Search */}
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Student Roll Call */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Student Roll Call
                  {stats.pending > 0 && (
                    <Badge variant="outline">{stats.pending} pending</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Mark attendance for each student. Changes are automatically
                  saved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {students.length === 0
                        ? "No Students in Class"
                        : "No Students Found"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {students.length === 0
                        ? "Add students to your class to start taking attendance."
                        : "Try adjusting your search term."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-colors",
                          getStatusColor(student.status),
                        )}
                      >
                        <div className="flex items-center space-x-3">
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
                              {student.admissionNumber} • {student.gender}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getStatusIcon(student.status)}
                          <div className="flex space-x-1">
                            <Button
                              variant={
                                student.status === "present"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateAttendanceStatus(student.id, "present")
                              }
                              className="text-xs"
                            >
                              Present
                            </Button>
                            <Button
                              variant={
                                student.status === "absent"
                                  ? "destructive"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateAttendanceStatus(student.id, "absent")
                              }
                              className="text-xs"
                            >
                              Absent
                            </Button>
                            <Button
                              variant={
                                student.status === "late"
                                  ? "secondary"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateAttendanceStatus(student.id, "late")
                              }
                              className="text-xs"
                            >
                              Late
                            </Button>
                            <Button
                              variant={
                                student.status === "sick"
                                  ? "secondary"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateAttendanceStatus(student.id, "sick")
                              }
                              className="text-xs"
                            >
                              Sick
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Attendance Summary</CardTitle>
                <CardDescription>
                  Overview of today's attendance for {currentDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Overall Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Attendance Rate:</span>
                        <span className="font-medium text-success">
                          {stats.total > 0
                            ? Math.round((stats.present / stats.total) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Present:</span>
                        <span className="font-medium">{stats.present}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Absent:</span>
                        <span className="font-medium">{stats.absent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Late Arrivals:</span>
                        <span className="font-medium">{stats.late}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sick Students:</span>
                        <span className="font-medium">{stats.sick}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Gender Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Boys Present:</span>
                        <span className="font-medium">
                          {
                            students.filter(
                              (s) =>
                                s.gender === "Male" && s.status === "present",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Girls Present:</span>
                        <span className="font-medium">
                          {
                            students.filter(
                              (s) =>
                                s.gender === "Female" && s.status === "present",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Boys Absent:</span>
                        <span className="font-medium">
                          {
                            students.filter(
                              (s) =>
                                s.gender === "Male" && s.status === "absent",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Girls Absent:</span>
                        <span className="font-medium">
                          {
                            students.filter(
                              (s) =>
                                s.gender === "Female" && s.status === "absent",
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="term-stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Term Attendance Statistics</CardTitle>
                <CardDescription>
                  Individual student attendance rates for {currentTerm}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getTermStats().length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No attendance data recorded for this term yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getTermStats().map((stat) => (
                      <div
                        key={stat.studentId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">{stat.studentName}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">
                            {stat.present}/{stat.total} days
                          </span>
                          <Badge
                            variant={
                              stat.percentage >= 80
                                ? "default"
                                : stat.percentage >= 60
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {stat.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>
                  Generate and download attendance reports in Excel format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={handleExportDailyAttendance}
                  >
                    <Download className="w-6 h-6" />
                    <span>Export Daily Attendance</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={handleExport40DayRegister}
                  >
                    <FileSpreadsheet className="w-6 h-6" />
                    <span>Export 40-Day Register</span>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Daily Attendance:</strong> Current day's attendance
                    with timestamps
                  </p>
                  <p>
                    <strong>40-Day Register:</strong> Complete 8-week register
                    with 5 days per week format suitable for school records
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceTracker;
