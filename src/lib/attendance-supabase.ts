import { supabase } from "./supabase";

export type AttendanceStatus = "present" | "absent" | "late" | "sick" | "excused";

export async function upsertAttendance(params: {
  student_id: string;
  class_id: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}) {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .upsert(
        {
          student_id: params.student_id,
          class_id: params.class_id,
          date: params.date,
          status: params.status,
          notes: params.notes ?? null,
        },
        { onConflict: "student_id,date" },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn("Attendance upsert failed (offline or no table?)", e);
    return null;
  }
}

export async function fetchAttendanceForDate(class_id: string, date: string) {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("student_id,status")
      .eq("class_id", class_id)
      .eq("date", date);
    if (error) throw error;
    const map = new Map<string, AttendanceStatus>();
    for (const row of data || []) map.set(row.student_id, row.status as AttendanceStatus);
    return map;
  } catch (e) {
    console.warn("Fetch attendance failed", e);
    return new Map<string, AttendanceStatus>();
  }
}
