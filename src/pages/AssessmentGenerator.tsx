import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { AIService } from "@/lib/ai-service";
import {
  exportAssessmentToPDF,
  exportAssessmentToDocx,
} from "@/lib/export-utils";
import { toast } from "@/hooks/use-toast";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(
    null,
  );
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    gradeLevel: "",
    questionCount: 10,
    difficulty: "medium" as "easy" | "medium" | "hard",
    questionTypes: ["multiple-choice", "short-answer"],
  });

  const [savedAssessments, setSavedAssessments] = useState<Assessment[]>([]);

  // Load saved assessments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("catalyst-assessments");
    if (saved) {
      try {
        setSavedAssessments(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading saved assessments:", error);
      }
    }
  }, []);

  // Save assessments to localStorage
  useEffect(() => {
    localStorage.setItem(
      "catalyst-assessments",
      JSON.stringify(savedAssessments),
    );
  }, [savedAssessments]);

  const questionTypeOptions = [
    { id: "multiple-choice", label: "Multiple Choice Questions" },
    { id: "short-answer", label: "Short Answer Questions" },
    { id: "essay", label: "Essay Questions" },
    { id: "true-false", label: "True/False Questions" },
    { id: "structured", label: "Structured Questions" },
    { id: "practical", label: "Practical Questions" },
  ];

  const handleQuestionTypeChange = (typeId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      questionTypes: checked
        ? [...prev.questionTypes, typeId]
        : prev.questionTypes.filter((t) => t !== typeId),
    }));
  };

  const handleGenerate = () => {
    console.log("🔥 Generate button clicked!", formData);

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

    console.log("✅ Starting assessment generation...");
    setIsGenerating(true);

    try {
      const assessment = generateAssessment({
        subject: formData.subject,
        topic: formData.topic,
        gradeLevel: formData.gradeLevel,
        questionCount: formData.questionCount,
        questionType: formData.questionTypes[0] || "multiple_choice",
        difficulty: formData.difficulty,
      });

      console.log("✅ Assessment generated:", assessment);
      setCurrentAssessment(assessment);

      toast({
        title: "Assessment Generated!",
        description: "Your assessment with intelligent questions is ready",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate assessment. Please try again.",
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
          title: "Assessment Updated",
          description: "Existing assessment has been updated",
        });
      } else {
        setSavedAssessments((prev) => [currentAssessment, ...prev]);
        toast({
          title: "Assessment Saved",
          description: "Assessment has been saved to your collection",
        });
      }
    }
  };

  const handleDownloadPDF = (includeAnswers = false) => {
    if (!currentAssessment) return;
    try {
      exportAssessmentToPDF(currentAssessment, includeAnswers);
      toast({
        title: "Download Started",
        description: `Assessment PDF ${includeAnswers ? "with answers" : ""} download initiated`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocx = async (includeAnswers = false) => {
    if (!currentAssessment) return;
    try {
      await exportAssessmentToDocx(currentAssessment, includeAnswers);
      toast({
        title: "Download Started",
        description: `Assessment DOCX ${includeAnswers ? "with answers" : ""} download initiated`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export DOCX. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLoadAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setFormData({
      subject: assessment.subject,
      topic: assessment.topic,
      gradeLevel: assessment.gradeLevel,
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
      title: "Assessment Deleted",
      description: "Assessment has been removed",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Assessment Generator
            </h1>
            <p className="text-muted-foreground">
              Create ECZ-compliant assessments with syllabi-aligned meaningful
              questions
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <ClipboardList className="w-4 h-4 mr-2" />
              Saved ({savedAssessments.length})
            </Button>
            <Button className="bg-warning hover:bg-warning/90 text-warning-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate Assessment</TabsTrigger>
            <TabsTrigger value="review">Review & Export</TabsTrigger>
            <TabsTrigger value="saved">Saved Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-warning" />
                  <span>Syllabi-Based Assessment Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure your assessment parameters for AI generation using
                  actual ECZ syllabi content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subject: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Civic Education">
                          Civic Education
                        </SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Geography">Geography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level *</Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, gradeLevel: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade 10">Grade 10</SelectItem>
                        <SelectItem value="Grade 11">Grade 11</SelectItem>
                        <SelectItem value="Grade 12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") =>
                        setFormData((prev) => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Assessment Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="Enter the specific topic (e.g., Quadratic Functions, Cell Division, Constitutional Law)"
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      AI will match your topic with relevant syllabi content
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionCount">Number of Questions</Label>
                    <Select
                      value={formData.questionCount.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          questionCount: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                        <SelectItem value="25">25 Questions</SelectItem>
                        <SelectItem value="30">30 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Question Types</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {questionTypeOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2"
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
                        <Label htmlFor={option.id} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI will generate meaningful, non-repeating questions
                    directly from ECZ syllabi
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-warning hover:bg-warning/90 text-warning-foreground text-base h-12"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Syllabi-Based Assessment...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Generate Assessment from Syllabi
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            {currentAssessment ? (
              <>
                {/* Assessment Preview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {currentAssessment.title}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-2">
                          <span>{currentAssessment.subject}</span>
                          <span>{currentAssessment.gradeLevel}</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{currentAssessment.duration} minutes</span>
                          </span>
                          <span>{currentAssessment.totalMarks} marks</span>
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleSave}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadPDF(false)}
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadDocx(false)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          DOCX
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadPDF(true)}
                        >
                          <FileCheck className="w-4 h-4 mr-2" />
                          With Answers
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {currentAssessment.eczCompliance && (
                        <Badge className="bg-warning/10 text-warning">
                          ECZ Compliant
                        </Badge>
                      )}
                      {currentAssessment.syllabiSource && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Syllabi-Based
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {currentAssessment.difficulty.charAt(0).toUpperCase() +
                          currentAssessment.difficulty.slice(1)}{" "}
                        Level
                      </Badge>
                      <Badge variant="secondary">
                        {currentAssessment.questions.length} Questions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Syllabi Alignment */}
                    {currentAssessment.syllabiSource && (
                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-900 mb-1">
                          Syllabi Alignment
                        </h4>
                        <p className="text-sm text-blue-700">
                          Questions generated from actual ECZ syllabi content
                          for {currentAssessment.subject}
                        </p>
                      </div>
                    )}

                    {/* ECZ Compliance */}
                    {currentAssessment.eczCompliance && (
                      <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                        <h4 className="font-medium text-amber-900 mb-1">
                          ECZ Compliance
                        </h4>
                        <p className="text-sm text-amber-700">
                          {currentAssessment.eczCompliance}
                        </p>
                      </div>
                    )}

                    {/* Instructions */}
                    <div>
                      <h3 className="font-semibold mb-2">Instructions</h3>
                      <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {currentAssessment.instructions}
                      </p>
                    </div>

                    <Separator />

                    {/* Questions */}
                    <div>
                      <h3 className="font-semibold mb-4">Questions</h3>
                      <div className="space-y-6">
                        {currentAssessment.questions.map((question) => (
                          <div
                            key={question.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-medium">
                                Question {question.number}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {question.type}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {question.marks} marks
                                </Badge>
                                {question.syllabiAlignment && (
                                  <Badge className="text-xs bg-blue-100 text-blue-800">
                                    Syllabi-aligned
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="mb-3 leading-relaxed">
                              {question.question}
                            </p>

                            {question.options && (
                              <div className="ml-4 space-y-1 mb-3">
                                {question.options.map((option, index) => (
                                  <div key={index} className="text-sm">
                                    {String.fromCharCode(65 + index)}. {option}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="bg-muted/50 p-3 rounded text-sm">
                              <div className="mb-2">
                                <strong>Answer:</strong> {question.answer}
                              </div>
                              <div className="mb-2">
                                <strong>Explanation:</strong>{" "}
                                {question.explanation}
                              </div>
                              {question.eczCriteria && (
                                <div className="mb-2">
                                  <strong>ECZ Criteria:</strong>{" "}
                                  {question.eczCriteria}
                                </div>
                              )}
                              {question.syllabiAlignment && (
                                <div>
                                  <strong>Syllabi Alignment:</strong>{" "}
                                  {question.syllabiAlignment}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="text-xs text-muted-foreground">
                      Generated on:{" "}
                      {new Date(currentAssessment.generatedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Assessment Generated
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Generate an assessment to review and export it here.
                  </p>
                  <Button variant="outline">
                    Generate Your First Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {savedAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedAssessments.map((assessment, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {assessment.title}
                      </CardTitle>
                      <CardDescription>
                        {assessment.gradeLevel} • {assessment.questions.length}{" "}
                        questions • {assessment.totalMarks} marks
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {assessment.difficulty}
                          </Badge>
                          {assessment.eczCompliance && (
                            <Badge className="text-xs bg-warning/10 text-warning">
                              ECZ Compliant
                            </Badge>
                          )}
                          {assessment.syllabiSource && (
                            <Badge className="text-xs bg-blue-100 text-blue-800">
                              Syllabi-Based
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {assessment.subject} • {assessment.duration} minutes
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated on{" "}
                          {new Date(
                            assessment.generatedAt,
                          ).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadAssessment(assessment)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCurrentAssessment(assessment);
                              handleDownloadPDF(false);
                            }}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAssessment(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Saved Assessments
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your generated assessments will appear here once you start
                    creating them.
                  </p>
                  <Button variant="outline">
                    Generate Your First Assessment
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
