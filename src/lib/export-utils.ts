import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  ImageRun,
  Media,
} from "docx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ================
// TYPE DEFINITIONS
// ================

interface LessonPlan {
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string | number;
  duration: number;
  objectives: string[];
  materials: string[];
  introduction: string;
  lessonDevelopment: string | string[];
  activities: string[];
  assessment: string;
  conclusion: string;
  generatedAt: string;
}

interface Question {
  number: number;
  type: string;
  text: string;
  marks: number;
  options?: string[];
}

interface ModelAnswer {
  number: number;
  type: string;
  marks: number;
  model_answer: string;
  key_points?: string[];
  partial_credit?: { description: string; marks: number }[];
  ecz_code?: string;
  bloom_level?: string;
}

interface QuestionPaper {
  title: string;
  subject: string;
  topic: string;
  grade_level: number;
  difficulty: string;
  total_marks: number;
  duration_minutes: number;
  instructions: string;
  questions: Question[];
  syllabus_code: string;
  generated_at: string;
}

interface MarkingScheme {
  title: string;
  subject: string;
  topic: string;
  grade_level: number;
  total_marks: number;
  questions: ModelAnswer[];
  grading_notes: string;
  syllabus_code: string;
  generated_at: string;
}

// ================
// HELPER FUNCTIONS
// ================

function normalizeLessonPlan(lp: any): LessonPlan {
  return {
    title: lp.title || "Lesson Plan",
    subject: lp.subject || "Unknown",
    topic: lp.topic || "General Topic",
    gradeLevel: lp.gradeLevel ?? lp.grade_level ?? "N/A",
    duration: lp.duration ?? lp.duration_minutes ?? 60,
    objectives: lp.objectives || [],
    materials: lp.materials || [],
    introduction: lp.introduction || lp.lesson_introduction || "Not specified",
    lessonDevelopment: lp.lessonDevelopment ?? lp.lesson_development ?? "Not specified",
    activities: lp.activities || [],
    assessment: lp.assessment || "Not specified",
    conclusion: lp.conclusion || "Not specified",
    generatedAt: lp.generatedAt ?? lp.generated_at ?? new Date().toISOString(),
  };
}

// PDF Utilities
function addHeader(pdf: jsPDF, title: string, subtitle?: string) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;

  // School/brand header (optional)
  // pdf.addImage(schoolLogo, 'PNG', margin, 20, 40, 40);

  // Title
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(29, 78, 216); // ECZ blue
  pdf.text(title, pageWidth / 2, 50, { align: "center" });

  if (subtitle) {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(subtitle, pageWidth / 2, 65, { align: "center" });
  }

  // Decorative line
  pdf.setDrawColor(230, 230, 230);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 75, pageWidth - margin, 75);
  pdf.setTextColor(0, 0, 0);
}

function addFooter(pdf: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Page ${pageNumber} of ${totalPages} • Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    pdf.internal.pageSize.getHeight() - 20,
    { align: "center" },
  );
}

function safeSplitText(pdf: jsPDF, text: string, maxWidth: number): string[] {
  try {
    return pdf.splitTextToSize(text, maxWidth);
  } catch {
    return [text.substring(0, 200) + "..."];
  }
}

// DOCX Utilities
const createDocxHeader = (title: string, subtitle?: string) => [
  new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 32, color: "1D4ED8" })],
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  subtitle
    ? new Paragraph({
        children: [new TextRun({ text: subtitle, italics: true, size: 10, color: "6B7280" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    : new Paragraph({ text: "", spacing: { after: 300 } }),
];

// ================
// LESSON PLAN EXPORTS
// ================

export function exportLessonPlanToPDF(lessonPlan: any) {
  try {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 90; // Start after header
    const plan = normalizeLessonPlan(lessonPlan);

    addHeader(pdf, "LESSON PLAN", `${plan.subject} • Grade ${plan.gradeLevel}`);

    const addSection = (title: string, content: string | string[], isList = false) => {
      if (yPosition > 700) {
        pdf.addPage();
        yPosition = 50;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(29, 78, 216);
      pdf.text(title, margin, yPosition);
      yPosition += 18;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      if (Array.isArray(content)) {
        content.forEach((item, index) => {
          const prefix = isList ? `${index + 1}. ` : "• ";
          const lines = safeSplitText(pdf, prefix + item, pageWidth - 2 * margin);
          pdf.text(lines, margin + (isList ? 0 : 15), yPosition);
          yPosition += lines.length * 12 + 5;
          if (yPosition > 750) {
            pdf.addPage();
            yPosition = 50;
          }
        });
      } else {
        const lines = safeSplitText(pdf, content as string, pageWidth - 2 * margin);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * 12 + 10;
      }

      yPosition += 10;
    };

    // Metadata
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Subject: ${plan.subject}`, margin, yPosition);
    yPosition += 15;
    pdf.text(`Grade Level: ${plan.gradeLevel}`, margin, yPosition);
    yPosition += 15;
    pdf.text(`Duration: ${plan.duration} minutes`, margin, yPosition);
    yPosition += 15;
    pdf.text(`Topic: ${plan.topic}`, margin, yPosition);
    yPosition += 25;

    // Content sections
    addSection("LEARNING OBJECTIVES", plan.objectives, true);
    addSection("REQUIRED MATERIALS", plan.materials);
    addSection("INTRODUCTION", plan.introduction);
    addSection("LESSON DEVELOPMENT", plan.lessonDevelopment);
    addSection("ACTIVITIES", plan.activities, true);
    addSection("ASSESSMENT", plan.assessment);
    addSection("CONCLUSION", plan.conclusion);

    // Footer
    addFooter(pdf, 1, 1);

    pdf.save(`${plan.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  } catch (error) {
    console.error("PDF Export Failed:", error);
    alert("Failed to export PDF. Please try again.");
  }
}

export async function exportLessonPlanToDocx(lessonPlan: any) {
  try {
    const plan = normalizeLessonPlan(lessonPlan);

    const createSection = (title: string, content: string | string[], isList = false) => {
      const elements = [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 24, color: "1D4ED8" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        }),
      ];

      if (Array.isArray(content)) {
        content.forEach((item, index) => {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: isList ? `${index + 1}. ` : "• ",
                  bold: isList,
                }),
                new TextRun({ text: item }),
              ],
              spacing: { after: 50 },
            }),
          );
        });
      } else {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: content as string })],
            spacing: { after: 100 },
          }),
        );
      }

      return elements;
    };

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Calibri",
              size: 22,
            },
          },
        },
      },
      sections: [
        {
          children: [
            ...createDocxHeader("LESSON PLAN", `${plan.subject} • Grade ${plan.gradeLevel}`),
            new Paragraph({
              children: [
                new TextRun({ text: "Subject: ", bold: true }),
                new TextRun({ text: plan.subject }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Grade Level: ", bold: true }),
                new TextRun({ text: String(plan.gradeLevel) }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Duration: ", bold: true }),
                new TextRun({ text: `${plan.duration} minutes` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Topic: ", bold: true }),
                new TextRun({ text: plan.topic }),
              ],
            }),
            new Paragraph({ text: "", spacing: { after: 200 } }),
            ...createSection("LEARNING OBJECTIVES", plan.objectives, true),
            ...createSection("REQUIRED MATERIALS", plan.materials),
            ...createSection("INTRODUCTION", plan.introduction),
            ...createSection("LESSON DEVELOPMENT", plan.lessonDevelopment),
            ...createSection("ACTIVITIES", plan.activities, true),
            ...createSection("ASSESSMENT", plan.assessment),
            ...createSection("CONCLUSION", plan.conclusion),
            new Paragraph({ text: "", pageBreakBefore: true }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated on: ${new Date(plan.generatedAt).toLocaleString()}`,
                  italics: true,
                  size: 18,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
      `${plan.title.replace(/[^a-zA-Z0-9]/g, "_")}.docx`,
    );
  } catch (error) {
    console.error("DOCX Export Failed:", error);
    alert("Failed to export DOCX. Please try again.");
  }
}

// ================
// ASSESSMENT EXPORTS — ✅ UPDATED FOR DUAL DOCUMENTS
// ================

export function exportAssessmentToPDF(assessment: any, includeAnswers = false) {
  try {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 90;
    let pageNumber = 1;

    // Determine which document to export
    const docType = includeAnswers ? "marking_scheme" : "question_paper";
    const source = assessment[docType] || assessment; // fallback to root if needed

    const title = includeAnswers ? "MARKING SCHEME" : "QUESTION PAPER";
    const subtitle = `${source.subject} • Grade ${source.grade_level} • ${source.total_marks} Marks`;

    addHeader(pdf, title, subtitle);

    const addSection = (text: string, fontSize = 11, isBold = false, isItalic = false) => {
      if (yPosition > 750) {
        addFooter(pdf, pageNumber, 1); // placeholder total
        pdf.addPage();
        pageNumber++;
        yPosition = 50;
      }

      pdf.setFontSize(fontSize);
      pdf.setFont(
        "helvetica",
        `${isBold ? "bold" : ""}${isItalic ? "italic" : ""}` as any,
      );
      if (isBold) pdf.setTextColor(29, 78, 216);

      const lines = safeSplitText(pdf, text, pageWidth - 2 * margin);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * (fontSize * 0.4 + 2) + 5;

      if (!isBold) pdf.setTextColor(0, 0, 0);
    };

    // Instructions
    if (source.instructions) {
      addSection("INSTRUCTIONS", 14, true);
      addSection(source.instructions, 10);
      yPosition += 10;
    }

    // Questions or Marking Scheme
    if (includeAnswers) {
      // Marking Scheme
      addSection("MARKING SCHEME", 14, true);
      yPosition += 10;

      source.questions.forEach((q: ModelAnswer) => {
        addSection(`Question ${q.number} (${q.marks} marks)`, 12, true);
        addSection(`Model Answer: ${q.model_answer}`, 10);
        
        if (q.key_points?.length) {
          addSection("Key Points:", 10, true);
          q.key_points.forEach(point => addSection(`• ${point}`, 9));
        }

        if (q.partial_credit?.length) {
          addSection("Partial Credit:", 10, true);
          q.partial_credit.forEach(pc => 
            addSection(`• ${pc.description} → ${pc.marks} marks`, 9)
          );
        }

        if (q.ecz_code || q.bloom_level) {
          let meta = [];
          if (q.ecz_code) meta.push(`ECZ: ${q.ecz_code}`);
          if (q.bloom_level) meta.push(`Bloom: ${q.bloom_level}`);
          addSection(meta.join(" | "), 8, false, true);
        }

        yPosition += 15;
      });

      if (source.grading_notes) {
        addSection("GRADING NOTES", 12, true);
        addSection(source.grading_notes, 10, false, true);
      }
    } else {
      // Question Paper
      addSection("QUESTIONS", 14, true);
      yPosition += 10;

      source.questions.forEach((q: Question) => {
        addSection(`${q.number}. ${q.text} [${q.marks} marks]`, 11, true);

        if (q.options) {
          q.options.forEach((option, idx) => {
            addSection(`   ${String.fromCharCode(65 + idx)}. ${option}`, 10);
          });
        }

        yPosition += 15;
      });
    }

    addFooter(pdf, pageNumber, pageNumber); // Update if you implement real pagination

    const filenamePrefix = source.title.replace(/[^a-zA-Z0-9]/g, "_");
    const suffix = includeAnswers ? "_Marking_Scheme" : "_Question_Paper";
    pdf.save(`${filenamePrefix}${suffix}.pdf`);

  } catch (error) {
    console.error("Assessment PDF Export Failed:", error);
    alert("Failed to export assessment PDF. Please try again.");
  }
}

export async function exportAssessmentToDocx(assessment: any, includeAnswers = false) {
  try {
    const docType = includeAnswers ? "marking_scheme" : "question_paper";
    const source = assessment[docType] || assessment;

    const title = includeAnswers ? "MARKING SCHEME" : "QUESTION PAPER";
    const subtitle = `${source.subject} • Grade ${source.grade_level} • ${source.total_marks} Marks`;

    const children = [
      ...createDocxHeader(title, subtitle),
    ];

    if (source.instructions) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "INSTRUCTIONS", bold: true, size: 24, color: "1D4ED8" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: source.instructions })],
          spacing: { after: 200 },
        }),
      );
    }

    if (includeAnswers) {
      // Marking Scheme
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "MARKING SCHEME", bold: true, size: 24, color: "1D4ED8" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        }),
      );

      source.questions.forEach((q: ModelAnswer) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Question ${q.number} (${q.marks} marks)`,
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 150, after: 50 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Model Answer: ", bold: true }),
              new TextRun({ text: q.model_answer }),
            ],
            spacing: { after: 50 },
          }),
        );

        if (q.key_points?.length) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: "Key Points:", bold: true })],
              spacing: { before: 50, after: 50 },
            }),
            ...q.key_points.map(point => 
              new Paragraph({
                children: [new TextRun({ text: `• ${point}` })],
                spacing: { after: 30 },
              })
            ),
          );
        }

        if (q.partial_credit?.length) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: "Partial Credit:", bold: true })],
              spacing: { before: 50, after: 50 },
            }),
            ...q.partial_credit.map(pc => 
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${pc.description} → `, bold: true }),
                  new TextRun({ text: `${pc.marks} marks` }),
                ],
                spacing: { after: 30 },
              })
            ),
          );
        }

        if (q.ecz_code || q.bloom_level) {
          const metaParts = [];
          if (q.ecz_code) metaParts.push(`ECZ Code: ${q.ecz_code}`);
          if (q.bloom_level) metaParts.push(`Bloom Level: ${q.bloom_level}`);

          children.push(
            new Paragraph({
              children: [new TextRun({ text: metaParts.join(" | "), italics: true, size: 18 })],
              spacing: { before: 50, after: 100 },
            }),
          );
        }
      });

      if (source.grading_notes) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: "GRADING NOTES", bold: true, size: 24, color: "1D4ED8" })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: source.grading_notes, italics: true })],
            spacing: { after: 200 },
          }),
        );
      }
    } else {
      // Question Paper
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "QUESTIONS", bold: true, size: 24, color: "1D4ED8" })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        }),
      );

      source.questions.forEach((q: Question) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${q.number}. ${q.text} [${q.marks} marks]`,
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 150, after: 50 },
          }),
        );

        if (q.options) {
          q.options.forEach((option, idx) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${String.fromCharCode(65 + idx)}. `,
                    bold: true,
                  }),
                  new TextRun({ text: option }),
                ],
                spacing: { after: 30 },
              }),
            );
          });
        }

        children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      });
    }

    children.push(
      new Paragraph({ text: "", pageBreakBefore: true }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on: ${new Date(source.generated_at).toLocaleString()}`,
            italics: true,
            size: 18,
          }),
        ],
        alignment: AlignmentType.RIGHT,
      }),
    );

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Calibri",
              size: 22,
            },
          },
        },
      },
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filenamePrefix = source.title.replace(/[^a-zA-Z0-9]/g, "_");
    const suffix = includeAnswers ? "_Marking_Scheme" : "_Question_Paper";
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
      `${filenamePrefix}${suffix}.docx`,
    );
  } catch (error) {
    console.error("Assessment DOCX Export Failed:", error);
    alert("Failed to export assessment DOCX. Please try again.");
  }
}

// ================
// ATTENDANCE EXPORTS (UNCHANGED BUT POLISHED)
// ================

export async function exportAttendanceToExcel(
  students: any[],
  attendanceData: any[],
  className: string,
) {
  try {
    const weeks = 8;
    const daysPerWeek = 5;
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Register");

    const headers = ["Student Name", "Student ID"];
    for (let week = 1; week <= weeks; week++) {
      for (let day = 0; day < daysPerWeek; day++) {
        headers.push(`Week ${week} - ${dayNames[day]}`);
      }
    }
    headers.push("Total Present", "Total Absent", "Attendance %");

    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1D4ED8" },
    };
    headerRow.alignment = { horizontal: "center" };

    students.forEach((student) => {
      const row = [student.name, student.id];
      let totalPresent = 0;
      let totalDays = 0;

      for (let week = 1; week <= weeks; week++) {
        for (let day = 0; day < daysPerWeek; day++) {
          const dayAttendance = attendanceData.find(
            (a) => a.studentId === student.id && a.week === week && a.day === day,
          );

          const status = dayAttendance ? dayAttendance.status : "";
          row.push(status);

          if (status === "Present" || status === "P") {
            totalPresent++;
          }
          if (status) {
            totalDays++;
          }
        }
      }

      const totalAbsent = totalDays - totalPresent;
      const attendancePercentage =
        totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

      row.push(totalPresent, totalAbsent, `${attendancePercentage}%`);
      const dataRow = worksheet.addRow(row);

      // Color code attendance
      for (let i = 3; i <= 42; i++) {
        const cell = dataRow.getCell(i);
        if (cell.value === "Present" || cell.value === "P") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD1FAE5" },
          };
          cell.font = { color: { argb: "FF0891B2" } };
        } else if (cell.value === "Absent" || cell.value === "A") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFEE2E2" },
          };
          cell.font = { color: { argb: "FFDC2626" } };
        }
      }
    });

    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 15;
    for (let i = 3; i <= 42; i++) {
      worksheet.getColumn(i).width = 10;
    }
    worksheet.getColumn(43).width = 15;
    worksheet.getColumn(44).width = 15;
    worksheet.getColumn(45).width = 15;

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${className}_Attendance_Register_40_Days.xlsx`,
    );
  } catch (error) {
    console.error("Attendance Export Failed:", error);
    alert("Failed to export attendance register. Please try again.");
  }
}

export async function exportDayAttendanceToExcel(
  students: any[],
  date: string,
  className: string,
) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Daily Attendance");

    worksheet.addRow(["DAILY ATTENDANCE REPORT"]);
    worksheet.addRow(["Class:", className]);
    worksheet.addRow(["Date:", date]);
    worksheet.addRow([]);

    const headerRow = worksheet.addRow(["Student Name", "Student ID", "Status", "Time"]);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1D4ED8" },
    };
    headerRow.alignment = { horizontal: "center" };

    students.forEach((student) => {
      const status = student.status || "Not Marked";
      const row = worksheet.addRow([
        student.name,
        student.id,
        status,
        new Date().toLocaleTimeString(),
      ]);

      const statusCell = row.getCell(3);
      if (status === "Present" || status === "P") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD1FAE5" },
        };
        statusCell.font = { color: { argb: "FF0891B2" } };
      } else if (status === "Absent" || status === "A") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEE2E2" },
        };
        statusCell.font = { color: { argb: "FFDC2626" } };
      }
    });

    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 15;

    const titleRow = worksheet.getRow(1);
    titleRow.font = { bold: true, size: 14, color: { argb: "FF1D4ED8" } };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${className}_Attendance_${date.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`,
    );
  } catch (error) {
    console.error("Daily Attendance Export Failed:", error);
    alert("Failed to export daily attendance. Please try again.");
  }
}
