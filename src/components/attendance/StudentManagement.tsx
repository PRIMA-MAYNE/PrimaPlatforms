import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Users,
  UserPlus,
  FileSpreadsheet,
} from "lucide-react";

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

interface StudentManagementProps {
  classes: Class[];
  selectedClass: string;
  onClassUpdate: (classes: Class[]) => void;
  onStudentAdd: (students: Student[]) => void;
}

export function StudentManagement({
  classes,
  selectedClass,
  onClassUpdate,
  onStudentAdd,
}: StudentManagementProps) {
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isBulkImport, setIsBulkImport] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    gender: "Male" as "Male" | "Female",
    dateOfBirth: "",
    admissionNumber: "",
    class: selectedClass,
  });
  const [newClass, setNewClass] = useState({
    name: "",
    grade: "",
  });

  const currentClass = classes.find((c) => c.id === selectedClass);

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.admissionNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const student: Student = {
      id: `student_${Date.now()}`,
      name: newStudent.name,
      gender: newStudent.gender,
      dateOfBirth: newStudent.dateOfBirth,
      admissionNumber: newStudent.admissionNumber,
      class: newStudent.class,
      status: null,
    };

    const updatedClasses = classes.map((cls) => {
      if (cls.id === newStudent.class) {
        return {
          ...cls,
          students: [...cls.students, student],
        };
      }
      return cls;
    });

    onClassUpdate(updatedClasses);

    // If this is the current class, also update the attendance tracker
    if (newStudent.class === selectedClass) {
      onStudentAdd([...(currentClass?.students || []), student]);
    }

    setNewStudent({
      name: "",
      gender: "Male",
      dateOfBirth: "",
      admissionNumber: "",
      class: selectedClass,
    });

    toast({
      title: "Student Added",
      description: `${student.name} has been added to the class`,
    });

    setIsAddingStudent(false);
  };

  const handleAddClass = () => {
    if (!newClass.name || !newClass.grade) {
      toast({
        title: "Missing Information",
        description: "Please provide class name and grade",
        variant: "destructive",
      });
      return;
    }

    const classObj: Class = {
      id: `class_${Date.now()}`,
      name: newClass.name,
      grade: newClass.grade,
      students: [],
    };

    onClassUpdate([...classes, classObj]);

    setNewClass({ name: "", grade: "" });
    toast({
      title: "Class Created",
      description: `${classObj.name} has been created`,
    });

    setIsAddingClass(false);
  };

  const handleRemoveStudent = (studentId: string) => {
    const updatedClasses = classes.map((cls) => ({
      ...cls,
      students: cls.students.filter((s) => s.id !== studentId),
    }));

    onClassUpdate(updatedClasses);

    // Update current class students if needed
    if (currentClass) {
      const updatedStudents = currentClass.students.filter(
        (s) => s.id !== studentId,
      );
      onStudentAdd(updatedStudents);
    }

    toast({
      title: "Student Removed",
      description: "Student has been removed from the class",
    });
  };

  const handleDeleteClass = (classId: string) => {
    const classToDelete = classes.find((c) => c.id === classId);
    if (!classToDelete) return;

    const updatedClasses = classes.filter((c) => c.id !== classId);
    onClassUpdate(updatedClasses);

    toast({
      title: "Class Deleted",
      description: `${classToDelete.name} has been deleted`,
    });
  };

  const handleBulkImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").slice(1); // Skip header

      const newStudents: Student[] = lines
        .filter((line) => line.trim())
        .map((line, index) => {
          const [name, gender, dob, admissionNumber] = line
            .split(",")
            .map((s) => s.trim());
          return {
            id: `student_${Date.now()}_${index}`,
            name: name || `Student ${index + 1}`,
            gender: (gender === "Female" ? "Female" : "Male") as
              | "Male"
              | "Female",
            dateOfBirth: dob || "",
            admissionNumber: admissionNumber || `ADM${Date.now()}${index}`,
            class: selectedClass,
            status: null,
          };
        });

      if (newStudents.length > 0) {
        const updatedClasses = classes.map((cls) => {
          if (cls.id === selectedClass) {
            return {
              ...cls,
              students: [...cls.students, ...newStudents],
            };
          }
          return cls;
        });

        onClassUpdate(updatedClasses);
        onStudentAdd([...(currentClass?.students || []), ...newStudents]);

        toast({
          title: "Students Imported",
          description: `${newStudents.length} students imported successfully`,
        });
      }
    };

    reader.readAsText(file);
    setIsBulkImport(false);
  };

  const downloadTemplate = () => {
    const csvContent =
      "Name,Gender,Date of Birth,Admission Number\nJohn Doe,Male,2010-01-15,ADM001\nJane Smith,Female,2010-03-22,ADM002";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Management Controls */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
          <DialogTrigger asChild>
            <Button size="sm" className="catalyst-gradient">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Add a new student to the selected class
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Full Name *</Label>
                  <Input
                    id="studentName"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    placeholder="Enter student's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionNumber">Admission Number *</Label>
                  <Input
                    id="admissionNumber"
                    value={newStudent.admissionNumber}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        admissionNumber: e.target.value,
                      })
                    }
                    placeholder="e.g., ADM001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={newStudent.gender}
                    onValueChange={(value: "Male" | "Female") =>
                      setNewStudent({ ...newStudent, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newStudent.dateOfBirth}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentClass">Class</Label>
                <Select
                  value={newStudent.class}
                  onValueChange={(value) =>
                    setNewStudent({ ...newStudent, class: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleAddStudent} className="flex-1">
                  Add Student
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingStudent(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingClass} onOpenChange={setIsAddingClass}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Create a new class to manage students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name *</Label>
                <Input
                  id="className"
                  value={newClass.name}
                  onChange={(e) =>
                    setNewClass({ ...newClass, name: e.target.value })
                  }
                  placeholder="e.g., 10A, Mathematics Advanced"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classGrade">Grade Level *</Label>
                <Select
                  value={newClass.grade}
                  onValueChange={(value) =>
                    setNewClass({ ...newClass, grade: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                        Grade {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleAddClass} className="flex-1">
                  Create Class
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingClass(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isBulkImport} onOpenChange={setIsBulkImport}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Import Students</DialogTitle>
              <DialogDescription>
                Import multiple students from a CSV file
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with student data
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkImport}
                  className="hidden"
                  id="csvImport"
                />
                <Button asChild variant="outline">
                  <label htmlFor="csvImport" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose CSV File
                  </label>
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">CSV Format:</p>
                <p className="text-xs text-muted-foreground">
                  Name, Gender, Date of Birth, Admission Number
                </p>
                <Button size="sm" variant="ghost" onClick={downloadTemplate}>
                  <Download className="w-3 h-3 mr-1" />
                  Download Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Manage Classes
          </CardTitle>
          <CardDescription>
            View and manage all classes in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No classes created yet. Add your first class to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-catalyst-100">
                      <span className="text-sm font-medium text-catalyst-700">
                        {cls.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {cls.grade} • {cls.students.length} students
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Set as current class if not already selected
                        if (selectedClass !== cls.id) {
                          onStudentAdd(cls.students);
                        }
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Class Students */}
      {currentClass && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {currentClass.name} Students
              </span>
              <Badge variant="secondary">
                {currentClass.students.length} students
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentClass.students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No students in this class yet. Add students to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentClass.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
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
                        <div className="flex space-x-2 text-sm text-muted-foreground">
                          <span>{student.admissionNumber}</span>
                          <span>•</span>
                          <span>{student.gender}</span>
                          {student.dateOfBirth && (
                            <>
                              <span>•</span>
                              <span>{student.dateOfBirth}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost">
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
