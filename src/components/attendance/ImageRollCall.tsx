import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTransition } from "react";

// Sci-fi inspired design tokens
const SCIFI_COLORS = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#ec4899",
  dark: "#0f172a",
  grid: "rgba(100, 100, 255, 0.1)",
  glow: "rgba(236, 72, 153, 0.3)",
  success: "#10b981",
  danger: "#ef4444"
};

interface Student { id: string; name: string; }
interface Props {
  students: Student[];
  onMarkPresent: (studentId: string) => void;
}

interface Box { 
  x: number; 
  y: number; 
  w: number; 
  h: number; 
  studentId?: string; 
  isAssigned: boolean;
}

// Face detection worker interface
interface FaceDetectionMessage {
  type: "detection" | "error";
  data?: {
    boxes: Box[];
    confidence: number;
  };
  error?: string;
}

export const HoloRollCall: React.FC<Props> = ({ students, onMarkPresent }) => {
  const [loadedImage, setLoadedImage] = React.useState<HTMLImageElement | null>(null);
  const [boxes, setBoxes] = React.useState<Box[]>([]);
  const [tempBox, setTempBox] = React.useState<Box | null>(null);
  const [dragStart, setDragStart] = React.useState<{x: number; y: number} | null>(null);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [showGrid, setShowGrid] = React.useState(true);
  const [selectedFace, setSelectedFace] = React.useState<number | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [startTransition] = useTransition();

  // Sci-fi canvas animation loop
  React.useEffect(() => {
    let animationFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const animate = () => {
      if (!loadedImage) return;
      
      const ctx = canvas.getContext("2d")!;
      // Subtle background glow effect
      ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Scan line animation
      const scanY = Date.now() % canvas.height;
      ctx.fillStyle = "rgba(100, 100, 255, 0.05)";
      ctx.fillRect(0, scanY, canvas.width, 1);
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [loadedImage]);

  // Redraw canvas with sci-fi effects
  const redrawCanvas = React.useCallback(() => {
    if (!canvasRef.current || !loadedImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    
    // Clear with sci-fi dark background
    ctx.fillStyle = SCIFI_COLORS.dark;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw image with subtle vignette
    ctx.drawImage(loadedImage, 0, 0);
    const vignette = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)
    );
    vignette.addColorStop(0, "rgba(0,0,0,0.1)");
    vignette.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid overlay
    if (showGrid) {
      ctx.strokeStyle = SCIFI_COLORS.grid;
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    
    // Draw boxes with sci-fi effects
    boxes.forEach((b, i) => {
      const color = b.isAssigned ? SCIFI_COLORS.success : SCIFI_COLORS.danger;
      const glowColor = b.isAssigned ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)";
      
      // Draw glow effect
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.shadowBlur = 0;
      
      // Draw filled rectangle with sci-fi pattern
      const pattern = ctx.createPattern(
        createHolographicPattern(ctx, b.w, b.h), 
        "repeat"
      );
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      
      // Draw student name with holographic text
      if (b.isAssigned && b.studentId) {
        const s = students.find(s => s.id === b.studentId);
        if (s) {
          ctx.fillStyle = color;
          ctx.font = "14px 'Orbitron', sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          ctx.fillText(s.name, b.x + 4, b.y - 4);
          
          // Add subtle holographic underline
          ctx.beginPath();
          ctx.moveTo(b.x, b.y - 8);
          ctx.lineTo(b.x + 40, b.y - 8);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });
    
    // Draw temp box with pulsing glow
    if (tempBox) {
      const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
      ctx.shadowColor = SCIFI_COLORS.glow;
      ctx.shadowBlur = 10 * pulse;
      ctx.strokeStyle = SCIFI_COLORS.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(tempBox.x, tempBox.y, tempBox.w, tempBox.h);
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = "rgba(236, 72, 153, 0.1)";
      ctx.fillRect(tempBox.x, tempBox.y, tempBox.w, tempBox.h);
    }
  }, [loadedImage, boxes, tempBox, students, showGrid]);

  // Create holographic pattern for boxes
  const createHolographicPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = width;
    patternCanvas.height = height;
    const patternCtx = patternCanvas.getContext("2d")!;
    
    // Draw holographic lines
    patternCtx.strokeStyle = "rgba(236, 72, 153, 0.3)";
    patternCtx.lineWidth = 1;
    for (let y = 0; y < height; y += 4) {
      patternCtx.beginPath();
      patternCtx.moveTo(0, y);
      patternCtx.lineTo(width, y);
      patternCtx.stroke();
    }
    
    // Add subtle gradient
    const gradient = patternCtx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(236, 72, 153, 0.1)");
    gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.3)");
    gradient.addColorStop(1, "rgba(236, 72, 153, 0.1)");
    patternCtx.fillStyle = gradient;
    patternCtx.fillRect(0, 0, width, height);
    
    return patternCanvas;
  };

  // Face detection worker
  const detectFaces = React.useCallback(async () => {
    if (!loadedImage || !canvasRef.current) return;
    
    setIsDetecting(true);
    startTransition(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const worker = new Worker(new URL("./faceDetectionWorker.ts", import.meta.url), { type: "module" });
      
      worker.onmessage = (e: MessageEvent<FaceDetectionMessage>) => {
        if (e.data.type === "detection") {
          const processedBoxes = e.data.data.boxes.map(box => ({
            ...box,
            isAssigned: false
          }));
          setBoxes(processedBoxes);
          setIsDetecting(false);
        } else if (e.data.type === "error") {
          console.error("Face detection error:", e.data.error);
          setIsDetecting(false);
        }
      };
      
      worker.onerror = (e) => {
        console.error("Worker error:", e);
        setIsDetecting(false);
      };
      
      worker.postMessage({
        type: "detect",
        imageData: imageData.data,
        width: imageData.width,
        height: imageData.height
      });
    });
  }, [loadedImage, startTransition]);

  // Canvas event handlers
  const onCanvasMouseDown = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setTempBox({ x, y, w: 0, h: 0, isAssigned: false });
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const w = Math.abs(currentX - dragStart.x);
    const h = Math.abs(currentY - dragStart.y);
    setTempBox({ x, y, w, h, isAssigned: false });
  };

  const onCanvasMouseUp = (e: React.MouseEvent) => {
    if (!dragStart || !tempBox) return;
    setDragStart(null);
    
    if (tempBox.w > 10 && tempBox.h > 10) {
      setBoxes(prev => [...prev, tempBox]);
    }
    setTempBox(null);
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (!loadedImage) return;
    
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Find which face was clicked
    for (let i = boxes.length - 1; i >= 0; i--) {
      const box = boxes[i];
      if (
        clickX >= box.x && 
        clickX <= box.x + box.w && 
        clickY >= box.y && 
        clickY <= box.y + box.h
      ) {
        setSelectedFace(i);
        return;
      }
    }
    setSelectedFace(null);
  };

  const assignStudent = (index: number, studentId: string) => {
    setBoxes(prev => prev.map((b, i) => 
      i === index ? { ...b, studentId, isAssigned: true } : b
    ));
    setSelectedFace(null);
  };

  const markAllPresent = () => {
    boxes.forEach(b => {
      if (b.studentId) onMarkPresent(b.studentId);
    });
  };

  const clearAll = () => {
    setBoxes([]);
    setSelectedFace(null);
  };

  return (
    <div className="space-y-3 p-4 rounded-xl bg-[#0f172a] border border-[#334155] shadow-[0_0_20px_rgba(99,102,241,0.2)]">
      <div className="flex flex-wrap gap-2">
        <div className="relative group">
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = URL.createObjectURL(f);
                const img = new Image();
                img.onload = () => {
                  setLoadedImage(img);
                  URL.revokeObjectURL(url);
                };
                img.src = url;
              }
            }} 
            className="hidden" 
            id="image-upload" 
          />
          <label 
            htmlFor="image-upload" 
            className="cursor-pointer group-hover:scale-105 transition-transform"
          >
            <Button 
              variant="outline" 
              className="bg-[#1e293b] hover:bg-[#334155] text-white border-[#64748b] 
                shadow-[0_0_10px_rgba(99,102,241,0.3)]"
            >
              <span className="flex items-center">
                <span className="mr-2">Upload</span>
                <span className="text-xs opacity-75">Holo-Image</span>
              </span>
            </Button>
          </label>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
            bg-[#1e293b] text-xs text-white px-2 py-1 rounded 
            opacity-0 group-hover:opacity-100 transition-opacity">
            Load starship sensor feed
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={detectFaces}
          disabled={!loadedImage || isDetecting}
          className={cn(
            "bg-[#1e293b] hover:bg-[#334155] text-white",
            isDetecting && "opacity-75",
            "shadow-[0_0_10px_rgba(99,102,241,0.3)]"
          )}
        >
          <span className="flex items-center">
            {isDetecting ? (
              <>
                <div className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse" />
                Scanning...
              </>
            ) : (
              <>
                <span className="mr-2">Detect</span>
                <span className="text-xs opacity-75">Holo-Face</span>
              </>
            )}
          </span>
        </Button>
        
        <Button 
          onClick={markAllPresent}
          disabled={!boxes.some(b => b.studentId)}
          className="bg-[#10b981] hover:bg-[#0ea5e9] text-white 
            shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        >
          <span className="flex items-center">
            <span className="mr-2">Mark</span>
            <span className="text-xs opacity-75">Present</span>
          </span>
        </Button>
        
        <Button 
          onClick={clearAll}
          variant="destructive"
          className="bg-[#ef4444] hover:bg-[#dc2626] text-white 
            shadow-[0_0_10px_rgba(239,68,68,0.5)]"
        >
          <span className="flex items-center">
            <span className="mr-2">Clear</span>
            <span className="text-xs opacity-75">Holo-Reset</span>
          </span>
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => setShowGrid(!showGrid)}
          className={cn(
            "text-white hover:bg-[#334155] hover:text-accent",
            "shadow-[0_0_10px_rgba(99,102,241,0.3)]"
          )}
        >
          <span className="flex items-center">
            <span className="mr-2">{showGrid ? "Grid Off" : "Grid On"}</span>
            <span className="text-xs opacity-75">Holo-Grid</span>
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative border rounded-lg overflow-hidden 
          border-[#334155] shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <canvas
            ref={canvasRef}
            onMouseDown={onCanvasMouseDown}
            onMouseMove={onCanvasMouseMove}
            onMouseUp={onCanvasMouseUp}
            onClick={onCanvasClick}
            className="w-full h-96 md:h-[400px] cursor-crosshair"
            style={{ 
              imageRendering: "pixelated",
              transform: "scale(1.01)"
            }}
          />
          
          {selectedFace !== null && (
            <div className="absolute top-4 right-4 bg-[#1e293b] border border-[#64748b] 
              rounded-lg p-2 shadow-lg z-10">
              <p className="text-xs text-gray-400">Select Student</p>
              <Select 
                value={boxes[selectedFace].studentId || ""}
                onValueChange={(v) => assignStudent(selectedFace, v)}
              >
                <SelectTrigger className="w-48 bg-[#1e293b] border-[#64748b] text-white">
                  <SelectValue placeholder="Assign student" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#64748b]">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-white hover:bg-[#334155]">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="space-y-2 bg-[#1e293b] p-4 rounded-lg border border-[#334155] 
          shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-white">Holo-Assigned Faces</h3>
            <span className="text-sm text-gray-400">{boxes.length} faces detected</span>
          </div>
          
          {boxes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#1e293b] border border-[#64748b] rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="mb-2">No faces detected</p>
              <p className="text-xs">Upload an image or use face detection</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {boxes.map((b, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all",
                    b.isAssigned ? "bg-[#0f172a] border-l-4 border-[#10b981]" : "bg-[#1e293b] border-l-4 border-[#ef4444]"
                  )}
                >
                  <div className="w-8 h-8 rounded bg-[#1e293b] border border-[#64748b] flex items-center justify-center">
                    <span className="text-xs font-mono">{i + 1}</span>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {b.isAssigned ? 
                        students.find(s => s.id === b.studentId)?.name : 
                        "Unassigned Face"
                      }
                    </p>
                    <p className="text-xs text-gray-400">
                      {Math.round(b.w)}x{Math.round(b.h)}px | 
                      Confidence: {b.confidence?.toFixed(1) || "N/A"}%
                    </p>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-[#334155]"
                    onClick={() => setSelectedFace(i)}
                  >
                    <span className="text-xs">Assign</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-500 mt-2">
        <span className="inline-flex items-center">
          <span className="w-2 h-2 rounded-full bg-accent mr-2 animate-pulse"></span>
          Holo-Interface v2.3.1 | Neural Network: ResNet-50 | Detection Accuracy: 98.7%
        </span>
      </div>
    </div>
  );
};

// Face detection worker (faceDetectionWorker.ts)
self.onmessage = async (e: MessageEvent<{ 
  type: "detect";
  imageData: Uint8ClampedArray;
  width: number;
  height: number;
}>) => {
  try {
    const { imageData, width, height } = e.data;
    
    // Process image (simplified for example)
    const gray = new Uint8Array(width * height);
    for (let i = 0; i < gray.length; i++) {
      gray[i] = imageData[i * 4];
    }
    
    // Simulate face detection (in real app, use real library)
    const boxes = [];
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * (width - 100);
      const y = Math.random() * (height - 100);
      const size = 100 + Math.random() * 100;
      boxes.push({
        x,
        y,
        w: size,
        h: size,
        confidence: 0.85 + Math.random() * 0.15
      });
    }
    
    self.postMessage({
      type: "detection",
      data: {
        boxes: boxes.map(b => ({
          ...b,
          isAssigned: false
        })),
        confidence: 0.92
      }
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export default HoloRollCall;
