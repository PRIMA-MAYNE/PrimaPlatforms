import * as React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardList,
  Target,
  Download,
  Plus,
  Clock,
  FileCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileDown,
  Save,
  Trash2,
  Sparkles,
  Brain,
  Syllabus, // If you have it — else replace with BookOpen
  BookOpen,
} from "lucide-react";
import { AIService } from "@/lib/ai-service";
import {
  exportAssessmentToPDF,
  exportAssessmentToDocx,
} from "@/lib/export-utils";
import { toast } from "@/hooks/use-toast";

// Types remain unchanged
interface Assessment {
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  difficulty: "easy" | "medium" | "hard";
  totalMarks: number;
  duration: number;
  instructions: string;
  questions: Question[];
  markingScheme: MarkingCriteria[];
  eczCompliance?: string;
  syllabiSource?: string;
  generatedAt: string;
}

interface Question {
  id: string;
  number: number;
  type: string;
  question: string;
  marks: number;
  answer: string;
  options?: string[];
  explanation: string;
  eczCriteria?: string;
  syllabiAlignment?: string;
}

interface MarkingCriteria {
  questionId: string;
  marks: number;
  criteria: string;
  partialCredit: string;
  eczStandards?: string;
  syllabiAlignment?: string;
}

const AssessmentGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentAssessment, setCurrentAssessment] =
    React.useState<Assessment | null>(null);
  const [formData, setFormData] = React.useState({
    subject: "",
    topic: "",
    gradeLevel: "",
    questionCount: 10,
    difficulty: "medium" as "easy" | "medium" | "hard",
    questionTypes: ["multiple-choice", "short-answer"],
  });

  const [savedAssessments, setSavedAssessments] = React.useState<Assessment[]>(
    [],
  );

  // Load saved assessments
  React.useEffect(() => {
    const saved = localStorage.getItem("catalyst-assessments");
    if (saved) {
      try {
        setSavedAssessments(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading saved assessments:", error);
      }
    }
  }, []);

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem(
      "catalyst-assessments",
      JSON.stringify(savedAssessments),
    );
  }, [savedAssessments]);

  const questionTypeOptions = [
    { id: "multiple-choice", label: "Multiple Choice", icon: "A" },
    { id: "short-answer", label: "Short Answer", icon: "✍️" },
    { id: "essay", label: "Essay", icon: "📝" },
    { id: "true-false", label: "True/False", icon: "✅" },
    { id: "structured", label: "Structured", icon: "📊" },
    { id: "practical", label: "Practical", icon: "🧪" },
  ];

  const handleQuestionTypeChange = (typeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      questionTypes: checked
        ? [...prev.questionTypes, typeId]
        : prev.questionTypes.filter((t) => t !== typeId),
    }));
  };

  const handleGenerate = async () => {
    if (!formData.subject || !formData.topic || !formData.gradeLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.questionTypes.length === 0) {
      toast({
        title: "No Question Types Selected",
        description: "Please select at least one question type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const assessment = await AIService.generateAssessment({
        subject: formData.subject,
        topic: formData.topic,
        gradeLevel: parseInt(formData.gradeLevel),
        questionCount: formData.questionCount,
        questionTypes: formData.questionTypes,
        difficulty: formData.difficulty,
      });

      // Normalize assessment to match UI expectations
      const normalizedAssessment = {
        ...assessment,
        gradeLevel: `Grade ${formData.gradeLevel}`,
        id: Date.now().toString(),
        questions: (assessment.questions || []).map((q, idx) => ({
          ...q,
          id: `q-${idx + 1}`,
          number: q.question_number || idx + 1,
          type: q.question_type || "unknown",
          question: q.question_text || "No question text",
          answer: q.correct_answer || "No answer provided",
          explanation: q.answer_explanation || "No explanation provided",
          marks: q.marks || 1,
        })),
        markingScheme: [],
        generatedAt: new Date().toISOString(),
        eczCompliance: assessment.ecz_compliance ? "Fully compliant with ECZ standards" : undefined,
        syllabiSource: assessment.syllabi_alignment || undefined,
        duration: assessment.duration_minutes || 60,
        totalMarks: assessment.total_marks || 0,
      };

      setCurrentAssessment(normalizedAssessment);

      toast({
        title: "✨ Assessment Generated!",
        description: "Powered by AI using real ECZ syllabi content",
        className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "❌ Generation Failed",
        description: "Our AI is having trouble right now. Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (currentAssessment) {
      const existingIndex = savedAssessments.findIndex(
        (a) =>
          a.title === currentAssessment.title &&
          a.subject === currentAssessment.subject,
      );

      if (existingIndex >= 0) {
        setSavedAssessments((prev) =>
          prev.map((a, i) => (i === existingIndex ? currentAssessment : a)),
        );
        toast({
          title: "✅ Assessment Updated",
          description: "Your changes have been saved",
        });
      } else {
        setSavedAssessments((prev) => [currentAssessment, ...prev]);
        toast({
          title: "✅ Assessment Saved",
          description: "Added to your library",
        });
      }
    }
  };

  const handleDownloadPDF = (includeAnswers = false) => {
    if (!currentAssessment) return;
    try {
      exportAssessmentToPDF(currentAssessment, includeAnswers);
      toast({
        title: "📥 PDF Exported",
        description: includeAnswers ? "With marking scheme" : "Student version",
      });
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocx = async (includeAnswers = false) => {
    if (!currentAssessment) return;
    try {
      await exportAssessmentToDocx(currentAssessment, includeAnswers);
      toast({
        title: "📥 DOCX Exported",
        description: includeAnswers ? "With answers included" : "Clean copy",
      });
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Could not generate Word document",
        variant: "destructive",
      });
    }
  };

  const handleLoadAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setFormData({
      subject: assessment.subject,
      topic: assessment.topic,
      gradeLevel: assessment.gradeLevel.replace("Grade ", ""),
      questionCount: assessment.questions.length,
      difficulty: assessment.difficulty,
      questionTypes: [
        ...new Set(assessment.questions.map((q) => q.type)),
      ] as string[],
    });
  };

  const handleDeleteAssessment = (index: number) => {
    setSavedAssessments((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "🗑️ Deleted",
      description: "Assessment removed from your library",
    });
  };

  // Skeleton Loader for Generating State
  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header - Responsive Stack */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              AI Assessment Generator
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Create ECZ-compliant assessments powered by OpenAI — syllabi-aligned, intelligent, and ready to use.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" })}
            >
              <ClipboardList className="h-4 w-4" />
              Saved ({savedAssessments.length})
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-1.5"
              onClick={() => {
                setCurrentAssessment(null);
                setFormData({
                  subject: "",
                  topic: "",
                  gradeLevel: "",
                  questionCount: 10,
                  difficulty: "medium",
                  questionTypes: ["multiple-choice", "short-answer"],
                });
              }}
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger
              value="generate"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
              disabled={!currentAssessment}
            >
              <Brain className="h-4 w-4 mr-2" />
              Review
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate">
            <Card id="generate" className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-purple-600" />
                  Configure Your AI Assessment
                </CardTitle>
                <CardDescription>
                  Our AI uses real ECZ syllabi to generate meaningful, curriculum-aligned questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form Grid - Fully Responsive */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subject: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Mathematics",
                          "Biology",
                          "Chemistry",
                          "Civic Education",
                          "Physics",
                          "English",
                          "History",
                          "Geography",
                        ].map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel" className="text-sm font-medium">
                      Grade Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, gradeLevel: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {["10", "11", "12"].map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-sm font-medium">
                      Difficulty
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") =>
                        setFormData((prev) => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-medium">
                      Topic <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Quadratic Equations, Photosynthesis, Democracy"
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific — AI matches your topic to ECZ syllabi content
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionCount" className="text-sm font-medium">
                      Number of Questions
                    </Label>
                    <Select
                      value={formData.questionCount.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          questionCount: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 10, 15, 20, 25, 30].map((count) => (
                          <SelectItem key={count} value={count.toString()}>
                            {count} Questions
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Question Types</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {questionTypeOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 p-2 rounded-md border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={option.id}
                          checked={formData.questionTypes.includes(option.id)}
                          onCheckedChange={(checked) =>
                            handleQuestionTypeChange(
                              option.id,
                              checked as boolean,
                            )
                          }
                        />
                        <Label htmlFor={option.id} className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                          <span>{option.icon}</span>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mix question types for comprehensive assessment
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI is Generating Your Assessment...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review">
            {isGenerating ? (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Your Assessment...
                  </CardTitle>
                  <CardDescription>
                    Our AI is crafting syllabi-aligned questions just for you. This may take 10-30 seconds.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkeletonLoader />
                </CardContent>
              </Card>
            ) : currentAssessment ? (
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold">
                        {currentAssessment.title}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" /> {currentAssessment.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" /> {currentAssessment.gradeLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {currentAssessment.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileCheck className="h-4 w-4" /> {currentAssessment.totalMarks} marks
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className="gap-1.5"
                      >
                        <Save className="h-4 w-4" /> Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(false)}
                        className="gap-1.5"
                      >
                        <FileDown className="h-4 w-4" /> PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocx(false)}
                        className="gap-1.5"
                      >
                        <Download className="h-4 w-4" /> DOCX
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(true)}
                        className="gap-1.5"
                      >
                        <FileCheck className="h-4 w-4" /> With Answers
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentAssessment.eczCompliance && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> ECZ Compliant
                      </Badge>
                    )}
                    {currentAssessment.syllabiSource && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <BookOpen className="h-3 w-3 mr-1" /> Syllabi-Based
                      </Badge>
                    )}
                    <Badge variant="secondary" className="capitalize">
                      {currentAssessment.difficulty} Difficulty
                    </Badge>
                    <Badge variant="outline">
                      {currentAssessment.questions.length} Questions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Generation Notice */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-purple-900 mb-1">AI-Generated Content</h4>
                        <p className="text-sm text-purple-700">
                          This assessment was generated using OpenAI, aligned with ECZ syllabi and curriculum standards.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" /> Instructions
                    </h3>
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <p className="leading-relaxed">{currentAssessment.instructions}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Questions */}
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                      <FileCheck className="h-5 w-5" /> Questions ({currentAssessment.questions.length})
                    </h3>
                    <div className="space-y-6">
                      {currentAssessment.questions.map((question) => (
                        <div
                          key={question.id}
                          className="border rounded-xl p-5 bg-background hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <h4 className="font-medium text-lg">
                              Question {question.number}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {question.type.replace("-", " ")}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {question.marks} marks
                              </Badge>
                              {question.syllabiAlignment && (
                                <Badge className="text-xs bg-blue-100 text-blue-800">
                                  Syllabus: {question.syllabiAlignment}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="mb-4 leading-relaxed text-foreground">
                            {question.question}
                          </p>

                          {question.options && (
                            <div className="ml-4 mb-4 space-y-2">
                              {question.options.map((option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 rounded bg-muted/50"
                                >
                                  <span className="font-medium w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs border">
                                    {String.fromCharCode(65 + index)}
                                  </span>
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t bg-muted/30 p-4 rounded-lg">
                            <div className="grid gap-2 text-sm">
                              <div>
                                <strong className="text-foreground">Answer:</strong>{" "}
                                <span className="text-muted-foreground">{question.answer}</span>
                              </div>
                              <div>
                                <strong className="text-foreground">Explanation:</strong>{" "}
                                <span className="text-muted-foreground">{question.explanation}</span>
                              </div>
                              {question.eczCriteria && (
                                <div>
                                  <strong className="text-foreground">ECZ Criteria:</strong>{" "}
                                  <span className="text-muted-foreground">{question.eczCriteria}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-right pt-4 border-t">
                    Generated on {new Date(currentAssessment.generatedAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg text-center py-16">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">No Assessment Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Click “Generate with AI” to create your first intelligent, syllabi-aligned assessment.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const tab = document.querySelector('[data-state="active"]');
                      if (tab?.getAttribute("value") !== "generate") {
                        const event = new Event("click", { bubbles: true });
                        document.querySelector('[value="generate"]')?.dispatchEvent(event);
                      }
                    }}
                    className="mt-4"
                  >
                    Generate Your First Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Tab */}
          <TabsContent value="saved">
            {savedAssessments.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedAssessments.map((assessment, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleLoadAssessment(assessment)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {assessment.title}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span>{assessment.gradeLevel}</span>
                        <span>{assessment.questions.length} Qs</span>
                        <span>{assessment.totalMarks} marks</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {assessment.eczCompliance && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            ECZ
                          </Badge>
                        )}
                        {assessment.syllabiSource && (
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            Syllabus
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {assessment.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(assessment.generatedAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentAssessment(assessment);
                            handleDownloadPDF(false);
                          }}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" /> Export
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssessment(index);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg text-center py-16">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Your Assessment Library</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    All your saved assessments will appear here. Start creating to build your collection.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const event = new Event("click", { bubbles: true });
                      document.querySelector('[value="generate"]')?.dispatchEvent(event);
                    }}
                    className="mt-4"
                  >
                    Create Your First Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AssessmentGenerator;
