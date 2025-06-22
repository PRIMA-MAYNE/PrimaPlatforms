import React, { useState } from "react";
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
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for students
const mockStudents = [
  { id: 1, name: "John Doe", gender: "Male", status: null },
  { id: 2, name: "Jane Smith", gender: "Female", status: null },
  { id: 3, name: "Michael Johnson", gender: "Male", status: null },
  { id: 4, name: "Emily Brown", gender: "Female", status: null },
  { id: 5, name: "David Wilson", gender: "Male", status: null },
  { id: 6, name: "Sarah Davis", gender: "Female", status: null },
  { id: 7, name: "Robert Miller", gender: "Male", status: null },
  { id: 8, name: "Lisa Anderson", gender: "Female", status: null },
  { id: 9, name: "James Taylor", gender: "Male", status: null },
  { id: 10, name: "Amy Wilson", gender: "Female", status: null },
];

const mockClasses = [
  { id: 1, name: "Grade 10A - Mathematics", students: 28 },
  { id: 2, name: "Grade 9B - Science", students: 24 },
  { id: 3, name: "Grade 11C - Chemistry", students: 22 },
  { id: 4, name: "Grade 8A - English", students: 30 },
];

type AttendanceStatus = "present" | "absent" | "late" | "sick" | null;

const AttendanceTracker: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [rollCallActive, setRollCallActive] = useState(false);

  const updateAttendanceStatus = (
    studentId: number,
    status: AttendanceStatus,
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student,
      ),
    );
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
              Track student attendance and generate comprehensive reports
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant={rollCallActive ? "destructive" : "default"}
              onClick={() => setRollCallActive(!rollCallActive)}
            >
              {rollCallActive ? "End Roll Call" : "Start Roll Call"}
            </Button>
          </div>
        </div>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
            <CardDescription>Choose a class to take attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-select">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} ({cls.students} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-select">Date</Label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="roll-call" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roll-call">Roll Call</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
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

            {/* Student List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Student Roll Call
                  {stats.pending > 0 && (
                    <Badge variant="outline">{stats.pending} pending</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Mark attendance for each student. Click on status buttons to
                  update.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                            {student.gender}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
                <CardDescription>
                  Comprehensive overview of today's attendance
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

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>
                  Export attendance data in various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Download className="w-6 h-6" />
                    <span>Export as PDF</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Download className="w-6 h-6" />
                    <span>Export as Excel</span>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Reports include attendance summary, gender-based breakdown,
                  and individual student records.
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
