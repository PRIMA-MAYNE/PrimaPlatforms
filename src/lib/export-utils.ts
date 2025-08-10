import jsPDF from "jspdf";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Export lesson plans to PDF
export function exportLessonPlanToPDF(lessonPlan: any) {
  const pdf = new jsPDF();
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = margin;

  // Helper function to add text with line breaks
  const addText = (text: string, fontSize = 10, isBold = false) => {
    pdf.setFontSize(fontSize);
    if (isBold) {
      pdf.setFont(undefined, "bold");
    } else {
      pdf.setFont(undefined, "normal");
    }

    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.4 + 5;

    // Add new page if needed
    if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Title
  addText(lessonPlan.title, 16, true);
  yPosition += 5;

  // Header information
  addText(`Subject: ${lessonPlan.subject}`, 12, true);
  addText(`Grade Level: ${lessonPlan.gradeLevel}`, 12, true);
  addText(`Duration: ${lessonPlan.duration} minutes`, 12, true);
  addText(`Topic: ${lessonPlan.topic}`, 12, true);
  yPosition += 10;

  // Learning Objectives
  addText("LEARNING OBJECTIVES", 14, true);
  lessonPlan.objectives.forEach((objective: string, index: number) => {
    addText(`${index + 1}. ${objective}`);
  });
  yPosition += 10;

  // Required Materials
  addText("REQUIRED MATERIALS", 14, true);
  lessonPlan.materials.forEach((material: string) => {
    addText(`• ${material}`);
  });
  yPosition += 10;

  // Introduction
  addText("INTRODUCTION", 14, true);
  addText(lessonPlan.introduction);
  yPosition += 10;

  // Lesson Development
  addText("LESSON DEVELOPMENT", 14, true);
  addText(lessonPlan.lessonDevelopment);
  yPosition += 10;

  // Activities
  addText("ACTIVITIES", 14, true);
  lessonPlan.activities.forEach((activity: string, index: number) => {
    addText(`${index + 1}. ${activity}`);
  });
  yPosition += 10;

  // Assessment
  addText("ASSESSMENT", 14, true);
  addText(lessonPlan.assessment);
  yPosition += 10;

  // Conclusion
  addText("CONCLUSION", 14, true);
  addText(lessonPlan.conclusion);
  yPosition += 10;

  // Footer
  addText(
    `Generated on: ${new Date(lessonPlan.generatedAt).toLocaleDateString()}`,
    8,
  );

  // Save the PDF
  pdf.save(`${lessonPlan.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

// Export lesson plans to DOCX
export async function exportLessonPlanToDocx(lessonPlan: any) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: lessonPlan.title, bold: true, size: 32 }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Subject: ", bold: true }),
              new TextRun({ text: lessonPlan.subject }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Grade Level: ", bold: true }),
              new TextRun({ text: lessonPlan.gradeLevel }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Duration: ", bold: true }),
              new TextRun({ text: `${lessonPlan.duration} minutes` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Topic: ", bold: true }),
              new TextRun({ text: lessonPlan.topic }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "LEARNING OBJECTIVES",
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),
          ...lessonPlan.objectives.map(
            (objective: string, index: number) =>
              new Paragraph({ text: `${index + 1}. ${objective}` }),
          ),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "REQUIRED MATERIALS", bold: true, size: 24 }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),
          ...lessonPlan.materials.map(
            (material: string) => new Paragraph({ text: `• ${material}` }),
          ),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "INTRODUCTION", bold: true, size: 24 }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: lessonPlan.introduction }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "LESSON DEVELOPMENT", bold: true, size: 24 }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: lessonPlan.lessonDevelopment }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "ACTIVITIES", bold: true, size: 24 }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),
          ...lessonPlan.activities.map(
            (activity: string, index: number) =>
              new Paragraph({ text: `${index + 1}. ${activity}` }),
          ),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "ASSESSMENT", bold: true, size: 24 }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: lessonPlan.assessment }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "CONCLUSION", bold: true, size: 24 }),
            ],
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: lessonPlan.conclusion }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Generated on: ", italic: true }),
              new TextRun({
                text: new Date(lessonPlan.generatedAt).toLocaleDateString(),
                italic: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  saveAs(blob, `${lessonPlan.title.replace(/[^a-zA-Z0-9]/g, "_")}.docx`);
}

// Export assessments to PDF
export function exportAssessmentToPDF(assessment: any, includeAnswers = false) {
  const pdf = new jsPDF();
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = margin;

  const addText = (text: string, fontSize = 10, isBold = false) => {
    pdf.setFontSize(fontSize);
    if (isBold) {
      pdf.setFont(undefined, "bold");
    } else {
      pdf.setFont(undefined, "normal");
    }

    const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.4 + 5;

    if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Header
  addText(assessment.title, 16, true);
  addText(
    `Subject: ${assessment.subject} | Grade: ${assessment.gradeLevel}`,
    12,
  );
  addText(
    `Duration: ${assessment.duration} minutes | Total Marks: ${assessment.totalMarks}`,
    12,
  );
  yPosition += 10;

  // Instructions
  addText("INSTRUCTIONS", 14, true);
  addText(assessment.instructions);
  yPosition += 15;

  // Questions
  addText("QUESTIONS", 14, true);
  yPosition += 5;

  assessment.questions.forEach((question: any) => {
    addText(
      `${question.number}. ${question.question} [${question.marks} marks]`,
      11,
      true,
    );

    if (question.options) {
      question.options.forEach((option: string, index: number) => {
        addText(`   ${String.fromCharCode(65 + index)}. ${option}`, 10);
      });
    }

    if (includeAnswers) {
      addText(`Answer: ${question.answer}`, 10, true);
      addText(`Explanation: ${question.explanation}`, 9);
    }

    yPosition += 10;
  });

  const filename = includeAnswers
    ? `${assessment.title.replace(/[^a-zA-Z0-9]/g, "_")}_with_answers.pdf`
    : `${assessment.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  pdf.save(filename);
}

// Export assessments to DOCX
export async function exportAssessmentToDocx(
  assessment: any,
  includeAnswers = false,
) {
  const children = [
    new Paragraph({
      children: [new TextRun({ text: assessment.title, bold: true, size: 32 })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Subject: ${assessment.subject} | Grade: ${assessment.gradeLevel}`,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Duration: ${assessment.duration} minutes | Total Marks: ${assessment.totalMarks}`,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "INSTRUCTIONS", bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: assessment.instructions }),
    new Paragraph({ text: "" }),
    new Paragraph({
      children: [new TextRun({ text: "QUESTIONS", bold: true, size: 24 })],
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  assessment.questions.forEach((question: any) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${question.number}. ${question.question} [${question.marks} marks]`,
            bold: true,
          }),
        ],
      }),
    );

    if (question.options) {
      question.options.forEach((option: string, index: number) => {
        children.push(
          new Paragraph({
            text: `   ${String.fromCharCode(65 + index)}. ${option}`,
          }),
        );
      });
    }

    if (includeAnswers) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Answer: ", bold: true }),
            new TextRun({ text: question.answer }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Explanation: ", bold: true }),
            new TextRun({ text: question.explanation }),
          ],
        }),
      );
    }

    children.push(new Paragraph({ text: "" }));
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const filename = includeAnswers
    ? `${assessment.title.replace(/[^a-zA-Z0-9]/g, "_")}_with_answers.docx`
    : `${assessment.title.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;

  saveAs(blob, filename);
}

// Export attendance register to Excel (40-day format)
export async function exportAttendanceToExcel(
  students: any[],
  attendanceData: any[],
  className: string,
) {
  // Create 40-day workbook (8 weeks x 5 days)
  const weeks = 8;
  const daysPerWeek = 5;
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance Register");

  // Prepare headers
  const headers = ["Student Name", "Student ID"];
  for (let week = 1; week <= weeks; week++) {
    for (let day = 0; day < daysPerWeek; day++) {
      headers.push(`Week ${week} - ${dayNames[day]}`);
    }
  }
  headers.push("Total Present", "Total Absent", "Attendance %");

  // Add headers to worksheet
  worksheet.addRow(headers);

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  // Add data rows
  students.forEach((student) => {
    const row = [student.name, student.id];
    let totalPresent = 0;
    let totalDays = 0;

    // Add 40 days of attendance
    for (let week = 1; week <= weeks; week++) {
      for (let day = 0; day < daysPerWeek; day++) {
        // Find attendance record for this day (if exists)
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
    worksheet.addRow(row);
  });

  // Set column widths
  worksheet.getColumn(1).width = 20; // Student Name
  worksheet.getColumn(2).width = 12; // Student ID

  // Set widths for all 40 days
  for (let i = 3; i <= 42; i++) {
    worksheet.getColumn(i).width = 8;
  }

  // Set widths for summary columns
  worksheet.getColumn(43).width = 12; // Total Present
  worksheet.getColumn(44).width = 12; // Total Absent
  worksheet.getColumn(45).width = 12; // Attendance %

  // Save file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${className}_Attendance_Register_40_Days.xlsx`);
}

// Export current day attendance to Excel
export async function exportDayAttendanceToExcel(
  students: any[],
  date: string,
  className: string,
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Daily Attendance");

  // Add data rows
  worksheet.addRow(["Daily Attendance Report"]);
  worksheet.addRow(["Class:", className]);
  worksheet.addRow(["Date:", date]);
  worksheet.addRow([]);
  worksheet.addRow(["Student Name", "Student ID", "Status", "Time"]);

  students.forEach((student) => {
    worksheet.addRow([
      student.name,
      student.id,
      student.status || "Not Marked",
      new Date().toLocaleTimeString(),
    ]);
  });

  // Set column widths
  worksheet.getColumn(1).width = 20; // Student Name
  worksheet.getColumn(2).width = 12; // Student ID
  worksheet.getColumn(3).width = 12; // Status
  worksheet.getColumn(4).width = 12; // Time

  // Style headers
  const headerRow = worksheet.getRow(5);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  // Style title
  const titleRow = worksheet.getRow(1);
  titleRow.font = { bold: true, size: 14 };

  // Save file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${className}_Attendance_${date.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`);
}
