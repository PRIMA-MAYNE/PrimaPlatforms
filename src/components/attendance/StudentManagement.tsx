// components/attendance/StudentManagement.tsx
import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Camera, Trash2, Upload, AlertTriangle, Loader2, Image as ImageIcon, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Student, Class } from "@/app/attendance/AttendanceTracker";
import { generateFaceEmbedding, extractFaceCrop, detectFaces } from "@/lib/mediapipe-face";
import { encryptData, decryptData } from "@/lib/encryption";

interface StudentManagementProps {
  classes: Class[];
  selectedClass: string;
  onClassUpdate: (updatedClasses: Class[]) => void;
  onStudentAdd: (updatedStudents: Student[]) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  classes,
  selectedClass,
  onClassUpdate,
  onStudentAdd,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState("");
  const [gender, setGender] = React.useState<"Male" | "Female">("Male");
  const [image, setImage] = React.useState<string | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [bulkUpload, setBulkUpload] = React.useState(false);
  const [csvError, setCsvError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const currentClass = classes.find((c) => c.id === selectedClass);
  const students = currentClass?.students || [];

  // Filter students by search term
  const filteredStudents = React.useMemo(() =>
    students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [students, searchTerm]);

  // Handle Add New Student
  const handleAddStudent = () => {
    setEditingStudent(null);
    setName("");
    setAge("");
    setGender("Male");
    setImage(null);
    setIsModalOpen(true);
    setCsvError(null);
    setSearchTerm("");
  };

  // Handle Edit Existing Student
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setAge(new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear());
    setGender(student.gender);
    setImage(student.imageId ? student.imageId : null);
    setIsModalOpen(true);
    setCsvError(null);
  };

  // Handle Delete Student
  const handleDeleteStudent = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student? This cannot be undone.")) return;

    const updatedClasses = classes.map((cls) =>
      cls.id === selectedClass
        ? {
            ...cls,
            students: cls.students.filter((s) => s.id !== id),
          }
        : cls
    );

    onClassUpdate(updatedClasses);
    onStudentAdd([]);
    toast({
      title: "Student Deleted",
      description: "Student removed from roster.",
    });
  };

  // 🔹 Start Camera for Photo Capture
  const startCamera = () => {
    setIsCapturing(true);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        toast({
          title: "Camera Access Denied",
          description: "Please allow camera access to take photos.",
          variant: "destructive",
        });
      });
  };

  // 🔹 Stop Camera
  const closeCamera = () => {
    setIsCapturing(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // 🔹 Capture Photo + Generate & Encrypt Embedding
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect faces — ensure exactly one clear face
      const faces = await detectFaces(video);
      if (faces.length === 0) {
        throw new Error("No face detected. Please position your face clearly in the frame.");
      }
      if (faces.length > 1) {
        throw new Error("Multiple faces detected. Please ensure only one student is in view.");
      }

      // Extract clean face crop (192x192)
      const faceCropBase64 = extractFaceCrop(video, faces[0].boundingBox);

      // Generate embedding
      const embedding = await generateFaceEmbedding(video);

      // ✅ ENCRYPT both image and embedding
      const encryptedImage = await encryptData(faceCropBase64);
      const encryptedEmbedding = await encryptData(JSON.stringify(embedding));

      setImage(faceCropBase64); // For preview

      // Update or create student record
      const updatedStudents = [...students];
      const studentIndex = students.findIndex(s => s.id === editingStudent?.id);

      if (studentIndex >= 0) {
        updatedStudents[studentIndex] = {
          ...updatedStudents[studentIndex],
          name: name.trim() || updatedStudents[studentIndex].name,
          dateOfBirth: `${new Date().getFullYear() - parseInt(age || '13')}-01-01`,
          gender,
          imageId: encryptedImage,
          faceEmbedding: embedding,
        };
      } else {
        if (!name.trim()) throw new Error("Name is required");

        updatedStudents.push({
          id: crypto.randomUUID(),
          name: name.trim(),
          gender,
          dateOfBirth: `${new Date().getFullYear() - parseInt(age || '13')}-01-01`,
          admissionNumber: "",
          class: selectedClass,
          status: null,
          imageId: encryptedImage,
          faceEmbedding: embedding,
        });
      }

      const updatedClasses = classes.map(cls =>
        cls.id === selectedClass
          ? { ...cls, students: updatedStudents }
          : cls
      );

      onClassUpdate(updatedClasses);
      onStudentAdd(updatedStudents);
      toast({
        title: "Student Enrolled",
        description: "Photo and facial recognition data saved securely.",
        variant: "default",
      });

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to capture or process:", err);
      if (err instanceof Error) {
        toast({
          title: "Capture Failed",
          description: err.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Capture Failed",
          description: "Could not generate facial embedding. Try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
      setIsCapturing(false);
    }
  };

  // 🔹 Bulk Upload: ZIP + CSV
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const zipFile = files.find(f => f.name.toLowerCase().endsWith('.zip'));
    const csvFile = files.find(f => f.name.toLowerCase().endsWith('.csv'));

    if (!zipFile || !csvFile) {
      setCsvError("Please upload both a ZIP file (with photos) and a CSV file with student data.");
      return;
    }

    setCsvError(null);
    toast({
      title: "Processing Bulk Upload...",
      description: "Extracting photos and matching with CSV... This may take a moment.",
    });

    try {
      // Load JSZip dynamically
      const JSZip = await import('jszip');
      const zip = await JSZip.loadAsync(zipFile.arrayBuffer());

      // Parse CSV
      const csvText = await csvFile.text();
      const lines = csvText.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      if (!headers.includes('name') || !headers.includes('age') || !headers.includes('gender')) {
        throw new Error("CSV must have columns: Name, Age, Gender (case-insensitive)");
      }

      const studentsToEnroll: Student[] = [];
      const photoMap = new Map<string, string>(); // filename -> base64

      // Extract images from ZIP
      const imagePromises = Object.keys(zip.files)
        .filter(key => key.toLowerCase().endsWith('.jpg') || key.toLowerCase().endsWith('.png'))
        .map(async key => {
          const blob = await zip.files[key].async('blob');
          const reader = new FileReader();
          const fileName = key.replace(/\.[^/.]+$/, "").toLowerCase(); // Remove extension, lowercase
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          photoMap.set(fileName, base64);
        });

      await Promise.all(imagePromises);

      // Match CSV rows with photos
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < 3) continue;

        const name = values[headers.indexOf('name')] || '';
        const ageStr = values[headers.indexOf('age')] || '13';
        const genderRaw = (values[headers.indexOf('gender')] || '').toLowerCase();

        if (!name || !ageStr || !['male', 'female'].includes(genderRaw)) continue;

        const normalizedFileName = name.toLowerCase().replace(/\s+/g, '_');

        const base64Image = photoMap.get(normalizedFileName) || photoMap.get(name.toLowerCase()) || '';

        if (!base64Image) {
          toast({
            title: "Missing Photo",
            description: `No photo found for ${name}. Skipping.`,
            variant: "warning",
          });
          continue;
        }

        // Create image element to extract face embedding
        const img = new Image();
        img.src = base64Image;
        await new Promise<void>((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Generate embedding
        let embedding: number[] | null = null;
        try {
          embedding = await generateFaceEmbedding(img);
        } catch (err) {
          toast({
            title: "No Face Detected",
            description: `Could not detect face in ${name}'s photo. Skipping.`,
            variant: "warning",
          });
          continue;
        }

        // ✅ ENCRYPT before storing
        const encryptedImage = await encryptData(base64Image);
        const encryptedEmbedding = await encryptData(JSON.stringify(embedding));

        studentsToEnroll.push({
          id: crypto.randomUUID(),
          name: name,
          gender: genderRaw.charAt(0).toUpperCase() + genderRaw.slice(1) as "Male" | "Female",
          dateOfBirth: `${new Date().getFullYear() - parseInt(ageStr)}-01-01`,
          admissionNumber: "",
          class: selectedClass,
          status: null,
          imageId: encryptedImage,
          faceEmbedding: embedding,
        });
      }

      // Save all enrolled students
      const updatedStudents = [...students, ...studentsToEnroll];
      const updatedClasses = classes.map(cls =>
        cls.id === selectedClass
          ? { ...cls, students: updatedStudents }
          : cls
      );

      onClassUpdate(updatedClasses);
      onStudentAdd(updatedStudents);

      toast({
        title: "Bulk Enrollment Complete",
        description: `${studentsToEnroll.length} students successfully enrolled.`,
        variant: "default",
      });

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error("Bulk upload failed:", err);
      toast({
        title: "Bulk Upload Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred during bulk enrollment.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Students</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkUpload(!bulkUpload)}
            >
              <Upload className="w-4 h-4 mr-1" />
              Bulk Upload
            </Button>
            <Button size="sm" onClick={handleAddStudent}>
              <Plus className="w-4 h-4 mr-1" />
              Add Student
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Bulk Upload Panel */}
          {bulkUpload && (
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <Label htmlFor="bulk-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload ZIP + CSV
              </Label>
              <input
                type="file"
                id="bulk-upload"
                ref={fileInputRef}
                accept=".zip,.csv"
                multiple
                onChange={handleBulkUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                • ZIP must contain JPG/PNG photos named after students (e.g., “Amina_Yusuf.jpg”)  
                • CSV must have columns: <strong>Name, Age, Gender</strong> (case-insensitive)  
                • Example: <code>Amina Yusuf,13,Female</code>
              </p>
              {csvError && (
                <p className="mt-2 text-sm text-red-500">{csvError}</p>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {/* Student List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {students.length === 0
                  ? "No students added yet. Click ‘Add Student’ to begin."
                  : "No students match your search."}
              </p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {student.imageId ? (
                      <img
                        src={student.imageId}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.age || "Age unknown"} • {student.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditStudent(student)}
                      className="h-7 w-7 p-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5l6 6 1.5-1.5L11.207 5.5z"/>
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStudent(student.id)}
                      className="h-7 w-7 p-0 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Add/Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStudent ? "Edit Student" : "Add Student"}
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amina Yusuf"
                  required
                />
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="13"
                  min="10"
                  max="18"
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <Label>Photo</Label>
                {!image ? (
                  <Button
                    onClick={startCamera}
                    className="w-full"
                    variant="outline"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                ) : (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 bg-red-500 text-white"
                      onClick={() => setImage(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {isCapturing && (
                <div className="border-2 border-gray-300 rounded-lg p-2 relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-48 object-cover rounded"
                  />
                  {/* Visual guidance: green box for face framing */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-32 h-32 border-2 border-green-400 rounded opacity-70"></div>
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                    Frame face clearly inside the box
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={closeCamera}
                    className="absolute top-2 right-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={capturePhoto}
                    disabled={isProcessing}
                    className="absolute bottom-2 left-2"
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                        Processing...
                      </span>
                    ) : (
                      "Use This Photo"
                    )}
                  </Button>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!name.trim() || !age) return;
                    const updatedStudents = [...students];
                    const studentIndex = students.findIndex(s => s.id === editingStudent?.id);

                    if (studentIndex >= 0) {
                      updatedStudents[studentIndex] = {
                        ...updatedStudents[studentIndex],
                        name: name.trim(),
                        gender,
                        dateOfBirth: `${new Date().getFullYear() - parseInt(age)}-01-01`,
                      };
                    } else {
                      updatedStudents.push({
                        id: crypto.randomUUID(),
                        name: name.trim(),
                        gender,
                        dateOfBirth: `${new Date().getFullYear() - parseInt(age)}-01-01`,
                        admissionNumber: "",
                        class: selectedClass,
                        status: null,
                        imageId: image || undefined,
                        faceEmbedding: image ? [] : undefined,
                      });
                    }

                    const updatedClasses = classes.map(cls =>
                      cls.id === selectedClass
                        ? { ...cls, students: updatedStudents }
                        : cls
                    );

                    onClassUpdate(updatedClasses);
                    onStudentAdd(updatedStudents);
                    setIsModalOpen(false);
                  }}
                  className="flex-1"
                  disabled={!name.trim() || !age}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for MediaPipe processing */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};
