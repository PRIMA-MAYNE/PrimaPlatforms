import * as React from "react";
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
  RefreshCw,
  AlertTriangle,
  Loader2,
  Camera,
  Trash2,
  Microphone,
  ImageIcon,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentManagement } from "@/components/attendance/StudentManagement";
import { VoiceRollCall } from "@/components/attendance/VoiceRollCall";
import {
  exportAttendanceToExcel,
  exportDayAttendanceToExcel,
} from "@/lib/export-utils";
import { toast } from "@/hooks/use-toast";
import { fetchAttendanceForDate, upsertAttendance } from "@/lib/attendance-supabase";

// 🔥 UPDATED STUDENT INTERFACE WITH BIOMETRIC FIELDS
interface Student {
  id: string;
  name: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  admissionNumber: string;
  class: string;
  status: "present" | "absent" | "late" | "sick" | null;
  imageId?: string; // Encrypted base64 of captured photo
  faceEmbedding?: number[]; // 128-dim array from MediaPipe
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
  // State management with optimized initial state
  const [classes, setClasses] = React.useState<Class[]>(() => {
    const saved = localStorage.getItem("catalyst-classes");
    try {
      return saved ? JSON.parse(saved) : [
        {
          id: "demo-class",
          name: "Grade 10A - Mathematics",
          grade: "Grade 10",
          students: [],
        },
      ];
    } catch (error) {
      console.error("Error loading classes from localStorage:", error);
      return [
        {
          id: "demo-class",
          name: "Grade 10A - Mathematics",
          grade: "Grade 10",
          students: [],
        },
      ];
    }
  });
  const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem("catalyst-attendance");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading attendance from localStorage:", error);
      return [];
    }
  });
  const [selectedClass, setSelectedClass] = React.useState<string>("");
  const [students, setStudents] = React.useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [rollCallActive, setRollCallActive] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [currentTerm, setCurrentTerm] = React.useState("Term 1");
  const [isLoading, setIsLoading] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<"idle" | "syncing" | "success" | "error">("idle");

  // Ref to prevent state updates after unmount
  const isMountedRef = React.useRef(true);

  // Memoized term options for scalability
  const TERMS = [
    { value: "Term 1", label: "Term 1" },
    { value: "Term 2", label: "Term 2" },
    { value: "Term 3", label: "Term 3" },
  ];

  // Save data to localStorage with debounced writes
  React.useEffect(() => {
    const saveClasses = () => {
      try {
        localStorage.setItem("catalyst-classes", JSON.stringify(classes));
      } catch (error) {
        console.error("Failed to save classes to localStorage:", error);
      }
    };
    const timer = setTimeout(saveClasses, 500);
    return () => clearTimeout(timer);
  }, [classes]);

  React.useEffect(() => {
    const saveAttendance = () => {
      try {
        localStorage.setItem("catalyst-attendance", JSON.stringify(attendanceRecords));
      } catch (error) {
        console.error("Failed to save attendance to localStorage:", error);
      }
    };
    const timer = setTimeout(saveAttendance, 500);
    return () => clearTimeout(timer);
  }, [attendanceRecords]);

  // Update students when class or date changes — with safety
  React.useEffect(() => {
    const updateStudentsWithAttendance = async () => {
      if (!selectedClass || !isMountedRef.current) return;
      setIsLoading(true);
      setSyncStatus("syncing");
      try {
        const currentClass = classes.find((c) => c.id === selectedClass);
        if (!currentClass) {
          setStudents([]);
          return;
        }

        // Start with local base data
        let studentsWithStatus = currentClass.students.map((student) => ({
          ...student,
          status: getTodayAttendanceStatus(student.id, currentDate),
        }));

        // Fetch cloud data — authoritative source
        const cloudData = await fetchAttendanceForDate(selectedClass, currentDate);
        if (!isMountedRef.current) return;

        // Merge: Cloud data overrides local if present; else keep local
        if (cloudData.size > 0) {
          studentsWithStatus = studentsWithStatus.map((s) => ({
            ...s,
            status: cloudData.get(s.id) ?? s.status,
          }));
          setSyncStatus("success");
        } else {
          setSyncStatus("idle"); // No cloud data, use local
        }

        setStudents(studentsWithStatus);
      } catch (error) {
        console.error("Error fetching attendance from server:", error);
        setSyncStatus("error");
        toast({
          title: "Sync Failed",
          description: "Could not sync attendance with server. Using local data.",
          variant: "destructive",
        });
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    updateStudentsWithAttendance();
    return () => {
      isMountedRef.current = false;
    };
  }, [selectedClass, classes, currentDate]);

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
    const schoolWeek = Math.min(8, Math.ceil(weekNumber / 5));
    const schoolDay = dayOfWeek === 0 || dayOfWeek === 6 ? 5 : dayOfWeek; // Sat/Sun → Friday
    return { week: schoolWeek, day: schoolDay };
  };

  const updateAttendanceStatus = React.useCallback(
    async (studentId: string, status: AttendanceStatus) => {
      // Optimistic update
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId ? { ...student, status } : student,
        ),
      );
      if (!status) return;

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

      // Optimistic update of local records
      setAttendanceRecords((prev) => {
        if (existingRecordIndex >= 0) {
          return prev.map((r, i) => (i === existingRecordIndex ? record : r));
        } else {
          return [...prev, record];
        }
      });

      // Sync to server
      if (selectedClass) {
        try {
          await upsertAttendance({
            student_id: studentId,
            class_id: selectedClass,
            date: currentDate,
            status: status as any,
          });
          setSyncStatus("success");
          toast({
            title: "Attendance Updated",
            description: "Successfully synced with server",
            variant: "default",
          });
        } catch (error) {
          console.error("Failed to sync attendance:", error);
          setSyncStatus("error");
          toast({
            title: "Sync Failed",
            description: "Attendance updated locally but failed to sync with server",
            variant: "destructive",
          });
        }
      }
    },
    [attendanceRecords, currentDate, currentTerm, selectedClass]
  );

  // Memoized stats for performance
  const stats = React.useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === "present").length;
    const absent = students.filter((s) => s.status === "absent").length;
    const late = students.filter((s) => s.status === "late").length;
    const sick = students.filter((s) => s.status === "sick").length;
    const pending = students.filter((s) => s.status === null).length;
    return { total, present, absent, late, sick, pending };
  }, [students]);

  const termStats = React.useMemo(() => {
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
  }, [attendanceRecords, currentTerm, students]);

  const filteredStudents = React.useMemo(() =>
    students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  [students, searchTerm]);

  const handleClassUpdate = (updatedClasses: Class[]) => {
    setClasses(updatedClasses);
    if (selectedClass && !updatedClasses.some(c => c.id === selectedClass)) {
      setSelectedClass(updatedClasses[0]?.id || "");
    }
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
    try {
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
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate Excel file. Try again.",
        variant: "destructive",
      });
    }
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
    try {
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
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate Excel file. Try again.",
        variant: "destructive",
      });
    }
  };

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

  const resetSyncStatus = () => {
    setSyncStatus("idle");
  };

  // Validate date input format
  const isValidDate = (str: string): boolean => {
    const date = new Date(str);
    return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === str;
  };

  // ========================
  // VIDEO ROLL CALL — REAL MEDIAPIPE FACE RECOGNITION
  // ========================
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [detectedStudents, setDetectedStudents] = React.useState<Set<string>>(new Set());
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const [mediaPipeReady, setMediaPipeReady] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Load MediaPipe models once on mount
  React.useEffect(() => {
    const loadMediaPipe = async () => {
      try {
        // Dynamically import only when needed
        await import('@mediapipe/face_detection');
        await import('@mediapipe/face_recognition');
        setMediaPipeReady(true);
      } catch (err) {
        console.error('Failed to load MediaPipe:', err);
        toast({
          title: 'MediaPipe Loading Failed',
          description: 'Face recognition will not work until libraries are loaded.',
          variant: 'destructive',
        });
      }
    };
    loadMediaPipe();
  }, []);

  // Real face detection using MediaPipe
  const detectAndMatchFaces = React.useCallback(async (): Promise<string[]> => {
    if (!mediaPipeReady || !videoRef.current || students.length === 0) return [];

    const enrolledStudents = students.filter(
      s => s.faceEmbedding && s.faceEmbedding.length === 128
    );

    if (enrolledStudents.length === 0) {
      setVideoError("No student has an enrolled photo. Go to 'Manage Students' and add photos.");
      return [];
    }

    const detectedIds = new Set<string>();
    const detector = new (await import('@mediapipe/face_detection')).FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });
    const recognizer = new (await import('@mediapipe/face_recognition')).FaceRecognition({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_recognition/${file}`,
    });

    await Promise.all([detector.load(), recognizer.load()]);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Extract 10 frames at even intervals
    const frameCount = 10;
    const promises: Promise<void>[] = [];

    for (let i = 0; i < frameCount; i++) {
      const time = (i / (frameCount - 1)) * video.duration;
      promises.push(new Promise((resolve) => {
        video.currentTime = time;
        video.onseeked = async () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const detections = await detector.detect(video);
            if (!detections?.length) return;

            for (const detection of detections) {
              const embedding = await recognizer.generateEmbedding(video, detection.boundingBox);
              const float32Values = Array.from(embedding.float32Values);

              // Compare against each enrolled student
              for (const student of enrolledStudents) {
                const similarity = cosineSimilarity(float32Values, student.faceEmbedding!);
                if (similarity > 0.65) {
                  detectedIds.add(student.id);
                  break;
                }
              }
            }
          } catch (err) {
            console.warn("Face recognition failed on frame:", err);
          }
          resolve();
        };
      }));
    }

    await Promise.all(promises);
    return Array.from(detectedIds);
  }, [students, mediaPipeReady]);

  // Helper: Cosine similarity between two 128-dim arrays
  const cosineSimilarity = (a: number[], b: number[]): number => {
    if (a.length !== 128 || b.length !== 128) return 0;
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < 128; i++) {
      dotProduct += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  };

  // Start recording video
  const startRecording = async () => {
    setVideoError(null);
    setDetectedStudents(new Set());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const chunks: Blob[] = [];
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        processVideo(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDetectedStudents(new Set());
      toast({
        title: "Recording Started",
        description: "Walk slowly past all students. Faces with enrolled photos will be auto-marked present.",
        variant: "default",
      });
    } catch (err) {
      console.error("Camera access denied:", err);
      setVideoError("Could not access camera. Please grant permission and try again.");
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access in browser settings.",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Process recorded video
  const processVideo = async (blob: Blob) => {
    setIsProcessing(true);
    setVideoError(null);
    try {
      const videoUrl = URL.createObjectURL(blob);
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      videoRef.current = video;
      const detectedIds = await detectAndMatchFaces();

      // Mark ALL detected students as present
      const newDetected = Array.from(detectedIds);
      newDetected.forEach((studentId) => {
        onMarkStatus(studentId, "present");
      });
      setDetectedStudents(new Set(detectedIds));

      // Show success
      if (newDetected.length > 0) {
        toast({
          title: `${newDetected.length} Students Marked Present`,
          description: "All visible students with enrolled photos have been automatically marked present.",
          variant: "default",
        });
      } else {
        toast({
          title: "No Matches Found",
          description: "No enrolled faces were recognized. Ensure students have added photos.",
          variant: "warning",
        });
      }

      // Clean up
      URL.revokeObjectURL(videoUrl);
      setTimeout(() => {
        setVideoUrl(null);
        videoRef.current = null;
      }, 2000);
    } catch (err) {
      console.error("Processing failed:", err);
      setVideoError("Failed to process video. Try again with better lighting and full class visibility.");
      toast({
        title: "Processing Failed",
        description: "The system couldn't recognize faces. Ensure students have enrolled photos.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // On successful face detection, mark present
  const onMarkStatus = React.useCallback((studentId: string, status: "present") => {
    updateAttendanceStatus(studentId, status);
  }, [updateAttendanceStatus]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // ========================
  // UI: Highlight students without enrolled photos
  // ========================
  const studentsWithoutPhoto = students.filter(s => !s.imageId || !s.faceEmbedding);
  const hasUnenrolledStudents = studentsWithoutPhoto.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 px-4 pb-12">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl truncate">
              Attendance Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-md truncate">
              Track student attendance and generate comprehensive 40-day registers
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDailyAttendance}
              className="flex-1 sm:flex-none min-w-[120px]"
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Export Today</span>
              <span className="sm:hidden">Today</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport40DayRegister}
              className="flex-1 sm:flex-none min-w-[120px]"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">40-Day Register</span>
              <span className="sm:hidden">Register</span>
            </Button>
            <Button
              variant={rollCallActive ? "destructive" : "default"}
              onClick={() => setRollCallActive(!rollCallActive)}
              className="flex-1 sm:flex-none min-w-[140px]"
            >
              {rollCallActive ? "End Roll Call" : "Start Roll Call"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSyncStatus}
              disabled={syncStatus !== "error"}
              className="flex items-center gap-1 min-w-[100px] px-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Retry Sync</span>
              <span className="sm:hidden">Retry</span>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Class Selector */}
              <div className="space-y-2">
                <Label htmlFor="class-select">Class</Label>
                <Select
                  value={selectedClass}
                  onValueChange={(value) => {
                    setSelectedClass(value);
                    setSyncStatus("idle");
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <SelectItem value="" disabled>No classes available</SelectItem>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.students.length})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Date Selector */}
              <div className="space-y-2">
                <Label htmlFor="date-select">Date</Label>
                <Input
                  type="date"
                  value={currentDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isValidDate(val)) {
                      setCurrentDate(val);
                      setSyncStatus("idle");
                    }
                  }}
                  max={new Date().toISOString().split("T")[0]}
                  className="h-10"
                />
              </div>
              {/* Term Selector */}
              <div className="space-y-2">
                <Label htmlFor="term-select">Term</Label>
                <Select
                  value={currentTerm}
                  onValueChange={(value) => {
                    setCurrentTerm(value);
                    setSyncStatus("idle");
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMS.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Sync Status Indicator */}
              <div className="flex items-end justify-end">
                <div className="flex items-center gap-1 text-xs">
                  {syncStatus === "syncing" && (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">Syncing...</span>
                    </>
                  )}
                  {syncStatus === "success" && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Synced</span>
                    </>
                  )}
                  {syncStatus === "error" && (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">Failed</span>
                    </>
                  )}
                  {syncStatus === "idle" && (
                    <span className="text-muted-foreground">Ready</span>
                  )}
                </div>
              </div>
            </div>

            {/* Student Management Component — Now includes full enrollment flow */}
            <StudentManagement
              classes={classes}
              selectedClass={selectedClass}
              onClassUpdate={handleClassUpdate}
              onStudentAdd={handleStudentAdd}
            />

            {/* Warning Banner for Missing Photos */}
            {hasUnenrolledStudents && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <AlertOctagon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-yellow-800">⚠️ {studentsWithoutPhoto.length} student{studentsWithoutPhoto.length !== 1 ? 's' : ''} need photos for facial recognition.</strong>
                    <p className="text-yellow-700 mt-1">
                      Go to “Manage Students” → tap “Add Photo” next to their name to enable automatic roll call.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="roll-call" className="space-y-6">
          <TabsList className="grid grid-cols-6 gap-1 overflow-x-auto scrollbar-hide md:overflow-visible">
            <TabsTrigger value="roll-call" className="text-xs md:text-sm">
              Roll Call
            </TabsTrigger>
            <TabsTrigger value="photo" className="text-xs md:text-sm">
              <ImageIcon className="w-4 h-4 mr-1" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs md:text-sm">
              <Microphone className="w-4 h-4 mr-1" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-xs md:text-sm">
              Summary
            </TabsTrigger>
            <TabsTrigger value="term-stats" className="text-xs md:text-sm">
              Term Stats
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm">
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Roll Call Tab */}
          <TabsContent value="roll-call" className="space-y-6">
            {/* Live Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatsCard
                title="Total"
                value={stats.total}
                icon={Users}
                className="text-center h-24"
              />
              <StatsCard
                title="Present"
                value={stats.present}
                icon={CheckCircle}
                className="text-center h-24"
              />
              <StatsCard
                title="Absent"
                value={stats.absent}
                icon={XCircle}
                className="text-center h-24"
              />
              <StatsCard
                title="Late"
                value={stats.late}
                icon={Clock}
                className="text-center h-24"
              />
              <StatsCard
                title="Sick"
                value={stats.sick}
                icon={Thermometer}
                className="text-center h-24"
              />
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Student List */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  Student Roll Call
                  {stats.pending > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {stats.pending} pending
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Mark attendance for each student. Changes are automatically saved.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {students.length === 0
                        ? "No Students in Class"
                        : "No Students Found"}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {students.length === 0
                        ? "Add students to your class to start taking attendance."
                        : "Try adjusting your search term."}
                    </p>
                    {students.length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('student-management-tab')?.click()}
                        className="mt-2"
                      >
                        Add Students Now
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-border max-h-[50vh] overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className={cn(
                          "flex items-center justify-between p-3 sm:p-4 hover:bg-accent transition-colors",
                          getStatusColor(student.status),
                        )}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-catalyst-100">
                            <span className="text-sm font-medium text-catalyst-700">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {student.admissionNumber} • {student.gender}
                            </p>
                            {!student.imageId && !student.faceEmbedding && (
                              <p className="text-xs text-orange-500 mt-1 italic">
                                No photo enrolled
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(student.status)}
                          <div className="flex space-x-1">
                            <Button
                              variant={
                                student.status === "present"
                                  ? "default"
                                  : "outline"
                              }
                              size="xs"
                              onClick={() =>
                                updateAttendanceStatus(student.id, "present")
                              }
                              className="px-2 h-7 min-w-[50px] text-[10px]"
                            >
                              P
                            </Button>
                            <Button
                              variant={
                                student.status === "absent"
                                  ? "destructive"
                                  : "outline"
                              }
                              size="xs"
                              onClick={() =>
                                updateAttendanceStatus(student.id, "absent")
                              }
                              className="px-2 h-7 min-w-[50px] text-[10px]"
                            >
                              A
                            </Button>
                            <Button
                              variant={
                                student.status === "late"
                                  ? "secondary"
                                  : "outline"
                              }
                              size="xs"
                              onClick={() =>
                                updateAttendanceStatus(student.id, "late")
                              }
                              className="px-2 h-7 min-w-[50px] text-[10px]"
                            >
                              L
                            </Button>
                            <Button
                              variant={
                                student.status === "sick"
                                  ? "secondary"
                                  : "outline"
                              }
                              size="xs"
                              onClick={() =>
                                updateAttendanceStatus(student.id, "sick")
                              }
                              className="px-2 h-7 min-w-[50px] text-[10px]"
                            >
                              S
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

          {/* Video Roll Call Tab — REAL MEDIAPIPE INTEGRATION */}
          <TabsContent value="photo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Roll Call</CardTitle>
                <CardDescription>
                  Walk around the class while recording. Students with enrolled photos are auto-marked present.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isRecording && !isProcessing && !videoUrl && (
                  <Button
                    onClick={startRecording}
                    disabled={students.length === 0 || !mediaPipeReady || hasUnenrolledStudents}
                    className={`w-full ${students.length === 0 || !mediaPipeReady || hasUnenrolledStudents ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  >
                    {students.length === 0 ? (
                      <>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Add Students First
                      </>
                    ) : !mediaPipeReady ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading AI...
                      </>
                    ) : hasUnenrolledStudents ? (
                      <>
                        <AlertOctagon className="w-5 h-5 mr-2" />
                        Enroll Photos First ({studentsWithoutPhoto.length} missing)
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mr-2" />
                        Record Video (Walk Around Class)
                      </>
                    )}
                  </Button>
                )}

                {isRecording && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-pulse">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                    <p className="text-red-600 font-medium">Recording…</p>
                    <p className="text-sm text-gray-600">Walk slowly past all students. 60–90 seconds recommended.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopRecording}
                      className="mt-2"
                    >
                      Stop Recording
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <p className="text-blue-600 font-medium">Analyzing video...</p>
                    <p className="text-sm text-gray-600">Matching faces with enrolled photos...</p>
                  </div>
                )}

                {videoUrl && !isProcessing && (
                  <div className="relative w-full max-w-md">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className="w-full rounded-lg shadow-md"
                      autoPlay
                      muted
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setVideoUrl(null);
                        URL.revokeObjectURL(videoUrl);
                        toast({
                          title: "Video Deleted",
                          description: "Your recording has been permanently removed.",
                          variant: "default",
                        });
                      }}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {detectedStudents.size > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 text-success mr-1" />
                      Automatically Marked Present:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(detectedStudents).map((studentId) => {
                        const student = students.find(s => s.id === studentId);
                        return (
                          <Badge
                            key={studentId}
                            variant="default"
                            className="bg-success/10 text-success border-success/20"
                          >
                            {student?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {videoError && (
                  <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
                    {videoError}
                  </div>
                )}

                <div className="mt-6 text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-md">
                  <p><strong>How to use:</strong></p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Ensure all students have enrolled photos via “Manage Students”</li>
                    <li>Tap “Record Video”</li>
                    <li>Walk slowly past every student for 60–90 seconds — ensure their face is visible</li>
                    <li>Tap “Stop Recording” — <strong>no further action needed</strong></li>
                    <li>✅ All enrolled students seen are marked present automatically</li>
                  </ol>
                  <p className="mt-2 italic">No audio recorded. No upload. No storage. Privacy guaranteed.</p>
                </div>

                {/* Hidden canvas for MediaPipe processing */}
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Tab — Unchanged, now works with enrolled students */}
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voice Roll Call</CardTitle>
                <CardDescription>
                  Say a student's name and status: “Emma Carter, present.” Changes appear instantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceRollCall students={students} onMarkStatus={updateAttendanceStatus} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary Tab */}
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
                    <h3 className="font-semibold text-lg">Overall Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attendance Rate:</span>
                        <span className="font-medium text-success">
                          {stats.total > 0
                            ? Math.round((stats.present / stats.total) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Present:</span>
                        <span className="font-medium">{stats.present}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Absent:</span>
                        <span className="font-medium">{stats.absent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Late Arrivals:</span>
                        <span className="font-medium">{stats.late}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sick Students:</span>
                        <span className="font-medium">{stats.sick}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-medium">{stats.pending}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Gender Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Boys Present:</span>
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
                        <span className="text-muted-foreground">Girls Present:</span>
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
                        <span className="text-muted-foreground">Boys Absent:</span>
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
                        <span className="text-muted-foreground">Girls Absent:</span>
                        <span className="font-medium">
                          {
                            students.filter(
                              (s) =>
                                s.gender === "Female" && s.status === "absent",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Boys:</span>
                        <span className="font-medium">
                          {students.filter(s => s.gender === "Male").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Girls:</span>
                        <span className="font-medium">
                          {students.filter(s => s.gender === "Female").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Term Stats Tab */}
          <TabsContent value="term-stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Term Attendance Statistics</CardTitle>
                <CardDescription>
                  Individual student attendance rates for {currentTerm}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {termStats.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No attendance data recorded for this term yet.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('roll-call-tab')?.click()}
                      className="mt-4"
                    >
                      Go to Roll Call
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {termStats.map((stat) => (
                      <div
                        key={stat.studentId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors text-sm"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            <span className="text-xs font-medium">
                              {stat.studentName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span className="font-medium truncate">{stat.studentName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">
                            {stat.present}/{stat.total}
                          </span>
                          <Badge
                            variant={
                              stat.percentage >= 80
                                ? "default"
                                : stat.percentage >= 60
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs px-2 py-1"
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

          {/* Reports Tab */}
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
                    className="h-20 flex-col space-y-2 text-sm"
                    onClick={handleExportDailyAttendance}
                  >
                    <Download className="w-6 h-6" />
                    <span>Export Daily Attendance</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 text-sm"
                    onClick={handleExport40DayRegister}
                  >
                    <FileSpreadsheet className="w-6 h-6" />
                    <span>Export 40-Day Register</span>
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                  <p>
                    <strong>Daily Attendance:</strong> Current day's attendance with timestamps, suitable for daily logs
                  </p>
                  <p>
                    <strong>40-Day Register:</strong> Complete 8-week register with 5 days per week format, formatted for official school records
                  </p>
                  <p className="italic">
                    All exports include student ID, name, class, and attendance status.
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
