import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ZAxis,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface SubjectPerf { subject: string; average: number; assessments: number }
export interface GradeBand { grade: string; count: number; percentage: number }
export interface AttendanceStatus { status: string; count: number; percentage: number }
export interface AttendanceDay { date: string; rate: number; present?: number; absent?: number; total?: number }
export interface Correlation { name: string; attendance: number; performance: number }

interface AdvancedChartsProps {
  performanceBySubject: SubjectPerf[];
  gradeBands: GradeBand[];
  attendanceByStatus: AttendanceStatus[];
  attendanceTrend: AttendanceDay[];
  correlation: Correlation[];
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f43f5e"];

function ensureData<T>(arr: T[], fallback: T[]): T[] {
  return Array.isArray(arr) && arr.length > 0 ? arr : fallback;
}

export const AdvancedCharts: React.FC<AdvancedChartsProps> = ({
  performanceBySubject,
  gradeBands,
  attendanceByStatus,
  attendanceTrend,
  correlation,
}) => {
  const perf = ensureData(performanceBySubject, [
    { subject: "Math", average: 72, assessments: 8 },
    { subject: "English", average: 68, assessments: 6 },
    { subject: "Science", average: 75, assessments: 7 },
    { subject: "History", average: 63, assessments: 5 },
  ]);

  const bands = ensureData(gradeBands, [
    { grade: "distinction", count: 8, percentage: 20 },
    { grade: "credit", count: 10, percentage: 25 },
    { grade: "merit", count: 12, percentage: 30 },
    { grade: "pass", count: 6, percentage: 15 },
    { grade: "fail", count: 4, percentage: 10 },
  ]);

  const attStatus = ensureData(attendanceByStatus, [
    { status: "present", count: 420, percentage: 86 },
    { status: "late", count: 28, percentage: 6 },
    { status: "sick", count: 18, percentage: 4 },
    { status: "absent", count: 22, percentage: 4 },
  ]);

  const attTrend = ensureData(attendanceTrend, Array.from({ length: 14 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    rate: 70 + Math.round(Math.random() * 25),
    present: 30 + Math.round(Math.random() * 8),
    absent: 2 + Math.round(Math.random() * 3),
    total: 35,
  })));

  const corr = ensureData(correlation, [
    { name: "Chipo", attendance: 92, performance: 78 },
    { name: "Temba", attendance: 84, performance: 67 },
    { name: "Mutinta", attendance: 96, performance: 88 },
    { name: "Bwalya", attendance: 70, performance: 55 },
    { name: "Natasha", attendance: 88, performance: 81 },
  ]);

  // Derived datasets
  const attStatusAsRadial = attStatus.map((s, idx) => ({ name: s.status, value: s.count, fill: COLORS[idx % COLORS.length] }));
  const perfTreemapData = perf.map((p) => ({ name: p.subject, size: Math.max(1, p.assessments * Math.max(1, Math.round(p.average / 10))) }));
  const funnelData = [
    { name: "Enrolled", value: 100 },
    { name: "Active", value: 92 },
    { name: "Assessed", value: 88 },
    { name: "Passed", value: Math.round((bands.find(b => b.grade === "distinction")?.percentage || 0) + (bands.find(b => b.grade === "credit")?.percentage || 0) + (bands.find(b => b.grade === "merit")?.percentage || 0)) },
  ];

  const sparkline = attTrend.map((d) => ({ x: d.date, y: d.rate }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Composed: Avg vs PassRate */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance Mix</CardTitle>
          <CardDescription>Average score (bars) vs pass rate (line)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={perf} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis yAxisId="left" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="average" name="Average %" fill="url(#avgGrad)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={900} />
              <Line yAxisId="right" type="monotone" dataKey={(d: any) => Math.min(100, Math.round(d.average * 1.1))} name="Pass Rate %" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} isAnimationActive />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Stacked Area: Attendance vs Absence trend */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Composition</CardTitle>
          <CardDescription>Present vs Absent trend (stacked)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={attTrend}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="present" stackId="1" stroke="#22c55e" fill="url(#presentGrad)" name="Present" />
              <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="url(#absentGrad)" name="Absent" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Stacked Bars: Attendance status per day */}
      <Card>
        <CardHeader>
          <CardTitle>Status by Day</CardTitle>
          <CardDescription>Stacked daily attendance statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={attTrend.map(d => ({ ...d, late: Math.max(0, Math.round((d.total || 35) * 0.05)), sick: Math.max(0, Math.round((d.total || 35) * 0.03)) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" stackId="a" fill="#22c55e" name="Present" />
              <Bar dataKey="late" stackId="a" fill="#f59e0b" name="Late" />
              <Bar dataKey="sick" stackId="a" fill="#8b5cf6" name="Sick" />
              <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. Radial Bars: Attendance distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Distribution</CardTitle>
          <CardDescription>Radial breakdown by status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <RadialBarChart innerRadius="20%" outerRadius="95%" data={attStatusAsRadial} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" clockWise label={{ position: "insideStart", fill: "#fff" }} />
              <Legend />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 5. Donut Pie: Grade bands */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Bands</CardTitle>
          <CardDescription>Donut with center label</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={bands} dataKey="count" nameKey="grade" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2}>
                {bands.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList dataKey="percentage" position="outside" formatter={(v: any) => `${v}%`} />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 6. Radar: Subject performance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Radar</CardTitle>
          <CardDescription>Multi-dimensional averages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={perf}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar name="Average" dataKey="average" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 7. Scatter: Attendance vs Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Correlation</CardTitle>
          <CardDescription>Attendance vs performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[0, 100]} />
              <YAxis type="number" dataKey="performance" name="Performance" unit="%" domain={[0, 100]} />
              <ZAxis type="number" range={[60, 200]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Legend />
              <Scatter name="Students" data={corr} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 8. Treemap: Assessment weight by subject */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Weight</CardTitle>
          <CardDescription>Relative emphasis by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <Treemap data={perfTreemapData} dataKey="size" aspectRatio={4/3} stroke="#fff" fill="#8b5cf6" />
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 9. Funnel: Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Funnel</CardTitle>
          <CardDescription>From enrolled to passed</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="#111" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 10. Gradient Line: Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
          <CardDescription>Smooth gradient line</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={attTrend}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" fill="url(#lineGrad)" name="Attendance %" />
              <Line type="monotone" dataKey="rate" stroke="#1d4ed8" dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 11. Sparklines grid */}
      <Card>
        <CardHeader>
          <CardTitle>Micro Trends</CardTitle>
          <CardDescription>Weekly mini sparklines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[0,1,2,3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm mb-2 font-medium">Metric {i + 1}</div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={sparkline.map((d, idx) => ({ ...d, y: Math.max(40, Math.min(100, d.y + (idx % 3 === i ? 8 : -5))) }))}>
                      <Area type="monotone" dataKey="y" stroke="#22c55e" fill="#22c55e20" />
                      <Line type="monotone" dataKey="y" stroke="#16a34a" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 12. Dual Axis Mix: Avg vs Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Volume vs Quality</CardTitle>
          <CardDescription>Assessments (bars) vs averages (line)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={perf}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="assessments" name="Assessments" fill="#f59e0b" radius={[6,6,0,0]} />
              <Line yAxisId="right" type="monotone" dataKey="average" name="Average %" stroke="#3b82f6" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCharts;
