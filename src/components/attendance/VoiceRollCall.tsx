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
  className?: string;
}

export const VoiceRollCall: React.FC<Props> = ({ students, onMarkStatus, className }) => {
  const [active, setActive] = React.useState(false);
  const [lastRecognized, setLastRecognized] = React.useState<{ student: Student | null; status: AttendanceStatus | null } | null>(null);
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);
  const logRef = React.useRef<string[]>([]); // Avoid re-renders

  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Initialize speech recognition
  React.useEffect(() => {
    if (!active) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speak("Voice input is not supported in this browser.");
      setActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();

      if (transcript.length < 3) return;

      logRef.current = [...logRef.current.slice(-9), `[Heard]: "${transcript}"`];

      // Find matching student by name or admission number
      const matchedStudent = students.find((s) =>
        s.name.toLowerCase().includes(transcript) ||
        s.admissionNumber.toLowerCase().includes(transcript)
      );

      if (!matchedStudent) return;

      // Detect status keywords
      let status: AttendanceStatus = null;
      if (transcript.includes("present")) status = "present";
      else if (transcript.includes("absent")) status = "absent";
      else if (transcript.includes("late")) status = "late";
      else if (transcript.includes("sick")) status = "sick";

      if (!status) return;

      // ✅ VALID COMMAND — Update state immediately
      onMarkStatus(matchedStudent.id, status);

      // Optional: whisper confirmation to teacher
      speak(`${matchedStudent.name} marked ${status}.`);

      // Show visual hint in UI
      setLastRecognized({ student: matchedStudent, status });

      // Auto-hide after 3s
      setTimeout(() => setLastRecognized(null), 3000);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      // Don't interrupt — silently retry
    };

    recognition.onend = () => {
      if (active) {
        setIsListening(false);
        recognition.start(); // Restart listening
      }
    };

    // Start listening
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [active, students, onMarkStatus]);

  // Auto-hide last recognized hint
  React.useEffect(() => {
    if (lastRecognized) {
      const timer = setTimeout(() => setLastRecognized(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastRecognized]);

  // Handle toggle with audio feedback
  const toggleActive = () => {
    if (!active) {
      speak("Voice command activated. Say a student's name and their status, like 'Emma Carter, present'.");
    } else {
      speak("Voice command deactivated.");
    }
    setActive(!active);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Activation Button */}
      <Button
        variant={active ? "default" : "outline"}
        onClick={toggleActive}
        size="sm"
        className="w-full justify-start gap-2 text-sm"
      >
        {active ? (
          <>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Listening...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Start Voice Command
          </>
        )}
      </Button>

      {/* Visual Feedback — Appears only when a command is successfully processed */}
      {lastRecognized && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-md text-xs text-primary">
          <CheckCircle className="w-4 h-4" />
          <span>
            <strong>{lastRecognized.student?.name}</strong> marked{" "}
            <span className="capitalize">{lastRecognized.status}</span>
          </span>
        </div>
      )}

      {/* Hidden Debug Log — Only show during development */}
      {/* 
      <details className="mt-2 text-xs text-muted-foreground">
        <summary>Debug Log</summary>
        <div className="max-h-32 overflow-y-auto bg-muted/50 p-2 rounded mt-1 text-xs">
          {logRef.current.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </details> 
      */}
    </div>
  );
};

export default VoiceRollCall;
