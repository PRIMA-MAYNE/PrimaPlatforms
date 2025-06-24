// Simple AI Test Verification
// This tests the immediate-ai functions to ensure they're working

import {
  generateLessonPlan,
  generateAssessment,
  generateEducationalInsights,
} from "./lib/immediate-ai.ts";

console.log("🧪 Testing AI Functions...");

// Test 1: Lesson Plan Generation
console.log("\n1️⃣ Testing Lesson Plan Generation:");
try {
  const lessonPlan = generateLessonPlan({
    subject: "Mathematics",
    topic: "Linear Equations",
    gradeLevel: "Grade 10",
    duration: 40,
  });
  console.log("✅ Lesson Plan Generated:");
  console.log("- Title:", lessonPlan.title);
  console.log("- Objectives:", lessonPlan.objectives.length, "items");
  console.log("- Materials:", lessonPlan.materials.length, "items");
  console.log(
    "- All sections present:",
    lessonPlan.introduction ? "✅" : "❌",
    lessonPlan.lessonDevelopment ? "✅" : "❌",
    lessonPlan.activities ? "✅" : "❌",
    lessonPlan.assessment ? "✅" : "❌",
    lessonPlan.conclusion ? "✅" : "❌",
  );
} catch (error) {
  console.error("❌ Lesson Plan Failed:", error);
}

// Test 2: Assessment Generation
console.log("\n2️⃣ Testing Assessment Generation:");
try {
  const assessment = generateAssessment({
    subject: "Mathematics",
    topic: "Linear Equations",
    gradeLevel: "Grade 10",
    questionCount: 3,
    questionType: "multiple_choice",
    difficulty: "medium",
  });
  console.log("✅ Assessment Generated:");
  console.log("- Title:", assessment.title);
  console.log("- Questions:", assessment.questions.length);
  console.log("- Total Marks:", assessment.totalMarks);
  console.log(
    "- First Question:",
    assessment.questions[0]?.question?.substring(0, 50) + "...",
  );
} catch (error) {
  console.error("❌ Assessment Failed:", error);
}

// Test 3: Educational Insights
console.log("\n3️⃣ Testing Educational Insights:");
try {
  const insights = generateEducationalInsights({
    students: [{ name: "Test Student", grade: 75 }],
    attendance: [{ status: "present" }],
    performance: { average: 75 },
  });
  console.log("✅ Educational Insights Generated:");
  console.log("- Insights Count:", insights.length);
  console.log("- First Insight:", insights[0]?.substring(0, 50) + "...");
} catch (error) {
  console.error("❌ Educational Insights Failed:", error);
}

console.log("\n🎉 AI Function Testing Complete!");
