import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Student { id: string; name: string; }
interface Props {
  students: Student[];
  onMarkPresent: (studentId: string) => void;
}

interface Box { x: number; y: number; w: number; h: number; studentId?: string; }

export const ImageRollCall: React.FC<Props> = ({ students, onMarkPresent }) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [boxes, setBoxes] = useState<Box[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragStart, setDragStart] = useState<{x:number;y:number}|null>(null);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      drawBoxes();
    };
    img.src = imageUrl;
  }, [imageUrl, boxes]);

  const drawBoxes = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    ctx.putImageData(imgData,0,0); // ensure image is visible
    ctx.strokeStyle = "#ec4899"; ctx.lineWidth = 2; ctx.font = "14px sans-serif"; ctx.fillStyle = "rgba(236,72,153,0.2)";
    boxes.forEach((b) => { ctx.strokeRect(b.x,b.y,b.w,b.h); ctx.fillRect(b.x,b.y,b.w,b.h); if (b.studentId){ const s = students.find(s=>s.id===b.studentId); if(s){ ctx.fillStyle = "#ec4899"; ctx.fillText(s.name, b.x+4, b.y-4); ctx.fillStyle = "rgba(236,72,153,0.2)"; }}});
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const onCanvasMouseUp = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const end = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const x = Math.min(dragStart.x, end.x);
    const y = Math.min(dragStart.y, end.y);
    const w = Math.abs(end.x - dragStart.x);
    const h = Math.abs(end.y - dragStart.y);
    if (w > 10 && h > 10) setBoxes((prev) => [...prev, { x, y, w, h }]);
    setDragStart(null);
  };

  const detectFaces = async () => {
    try {
      const pico: any = await import("picojs");
      // Expect a cascade file hosted at /facefinder
      const response = await fetch("/facefinder");
      if (!response.ok) throw new Error("facefinder not found");
      const buffer = await response.arrayBuffer();
      const bytes = new Int8Array(buffer);
      const cascade = pico.unpack_cascade(bytes);
      const update_memory = pico.instantiate_detection_memory(5);
      const params = { shiftfactor: 0.1, minsize: 60, maxsize: 1000, scalefactor: 1.1 };

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const gray = new Uint8Array(canvas.width * canvas.height);
      for (let i = 0; i < gray.length; i++) gray[i] = pixels[i * 4];

      let dets = pico.run_cascade({ image: gray, pixels: gray, nrows: canvas.height, ncols: canvas.width, ldim: canvas.width }, cascade, params);
      dets = update_memory(dets);
      dets = dets.filter((d: any) => d[3] > 50.0); // score

      const faceBoxes: Box[] = dets.map((d: any) => ({ x: d[1] - d[2] / 2, y: d[0] - d[2] / 2, w: d[2], h: d[2] }));
      setBoxes(faceBoxes);
    } catch (e) {
      console.warn("Face detection unavailable:", e);
    }
  };

  const assignStudent = (index: number, studentId: string) => {
    setBoxes((prev) => prev.map((b, i) => (i === index ? { ...b, studentId } : b)));
  };

  const markAllPresent = () => {
    boxes.forEach((b) => { if (b.studentId) onMarkPresent(b.studentId); });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <input type="file" accept="image/*" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setImageUrl(URL.createObjectURL(f));
        }} />
        <Button variant="outline" onClick={detectFaces} disabled={!imageUrl}>Detect Faces</Button>
        <Button onClick={markAllPresent} disabled={!boxes.some(b=>b.studentId)}>Mark Selected Present</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded">
          <canvas ref={canvasRef} onMouseDown={onCanvasMouseDown} onMouseUp={onCanvasMouseUp} className="max-w-full h-auto" />
        </div>
        <div className="space-y-2">
          {boxes.length === 0 ? (
            <div className="text-sm text-muted-foreground">Draw boxes on faces by dragging on the photo, or click Detect Faces.</div>
          ) : (
            boxes.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-xs w-28">Face #{i + 1}</div>
                <Select value={b.studentId} onValueChange={(v) => assignStudent(i, v)}>
                  <SelectTrigger className="w-56"><SelectValue placeholder="Assign student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s)=> (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageRollCall;
