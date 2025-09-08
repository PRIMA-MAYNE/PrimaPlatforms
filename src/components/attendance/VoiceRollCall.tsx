import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type AttendanceStatus = "present" | "absent" | "late" | "sick" | null;

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
}

interface Props {
  students: Student[];
  onMarkStatus: (studentId: string, status: AttendanceStatus) => void;
}

export const VoiceRollCall: React.FC<Props> = ({ students, onMarkStatus }) => {
  const [active, setActive] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const recognitionRef = useRef<any>(null);
  const [log, setLog] = useState<string[]>([]);

  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!active) return;
    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setLog((l) => ["Voice input not supported.", ...l]);
      speak("Voice input not available in your browser");
      setActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      setLog((l) => [`Heard: ${transcript}`, ...l]);

      if (!currentStudent) {
        const student = students.find(
          (s) =>
            s.name.toLowerCase().includes(transcript) ||
            s.admissionNumber.toLowerCase().includes(transcript),
        );
        if (student) {
          setCurrentStudent(student);
          speak(`Selected ${student.name}. Say present, absent, late, or sick.`);
        } else {
          speak("Student not found. Try again.");
        }
      } else {
        let status: AttendanceStatus = null;
        if (transcript.includes("present")) status = "present";
        else if (transcript.includes("absent")) status = "absent";
        else if (transcript.includes("late")) status = "late";
        else if (transcript.includes("sick")) status = "sick";

        if (status) {
          onMarkStatus(currentStudent.id, status);
          speak(`${currentStudent.name} marked ${status}.`);
          setCurrentStudent(null);
        } else {
          speak("Please say: present, absent, late, or sick.");
        }
      }
    };

    recognition.onerror = () => {
      setLog((l) => ["Speech recognition error", ...l]);
      speak("Error listening. Please try again.");
    };

    recognition.onend = () => {
      if (active) recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [active, students, currentStudent]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button onClick={() => setActive((v) => !v)}>
          {active ? "Stop Voice Roll Call" : "Start Voice Roll Call"}
        </Button>
        {currentStudent && (
          <Badge>Selected: {currentStudent.name}</Badge>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        Say a student's name or admission number, then say their status.
      </div>
      <div className="max-h-40 overflow-auto text-xs border rounded p-2 bg-muted/20">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
};

export default VoiceRollCall;
