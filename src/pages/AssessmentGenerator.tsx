import React, { useState } from "react";
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
} from "lucide-react";
import { generateAssessment } from "@/lib/ai-service";
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
}

interface MarkingCriteria {
  questionId: string;
  marks: number;
  criteria: string;
  partialCredit: string;
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

  const questionTypeOptions = [
    { id: "multiple-choice", label: "Multiple Choice Questions" },
    { id: "short-answer", label: "Short Answer Questions" },
    { id: "essay", label: "Essay Questions" },
    { id: "true-false", label: "True/False Questions" },
    { id: "fill-blanks", label: "Fill in the Blanks" },
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
      const assessment = await generateAssessment({
        subject: formData.subject,
        topic: formData.topic,
        gradeLevel: formData.gradeLevel,
        questionCount: formData.questionCount,
        questionTypes: formData.questionTypes,
        difficulty: formData.difficulty,
      });

      setCurrentAssessment(assessment);
      toast({
        title: "Assessment Generated!",
        description: "Your assessment and marking scheme are ready",
      });
    } catch (error) {
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
      setSavedAssessments((prev) => [currentAssessment, ...prev]);
      toast({
        title: "Assessment Saved",
        description: "Assessment has been saved to your collection",
      });
    }
  };

  const handleDownload = (type: "assessment" | "marking-scheme") => {
    if (!currentAssessment) return;

    let content = "";

    if (type === "assessment") {
      content = `
${currentAssessment.title}
${currentAssessment.subject} - ${currentAssessment.gradeLevel}

Instructions: ${currentAssessment.instructions}
Time Allowed: ${currentAssessment.duration} minutes
Total Marks: ${currentAssessment.totalMarks}

QUESTIONS:

${currentAssessment.questions
  .map((q) => {
    let questionText = `${q.number}. ${q.question} [${q.marks} marks]`;
    if (q.options) {
      questionText += `\n${q.options.map((opt, i) => `   ${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}`;
    }
    return questionText;
  })
  .join("\n\n")}

Generated on: ${new Date(currentAssessment.generatedAt).toLocaleDateString()}
      `;
    } else {
      content = `
MARKING SCHEME
${currentAssessment.title}

${currentAssessment.questions
  .map((q) => {
    const marking = currentAssessment.markingScheme.find(
      (m) => m.questionId === q.id,
    );
    return `Question ${q.number}: ${q.question}
Answer: ${q.answer}
Marks: ${q.marks}
Explanation: ${q.explanation}
Criteria: ${marking?.criteria || "Standard marking"}
Partial Credit: ${marking?.partialCredit || "As per teacher discretion"}`;
  })
  .join("\n\n")}

Generated on: ${new Date(currentAssessment.generatedAt).toLocaleDateString()}
      `;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentAssessment.title.replace(/[^a-zA-Z0-9]/g, "_")}_${type}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `${type === "assessment" ? "Assessment" : "Marking scheme"} downloaded`,
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
              Create comprehensive assessments with automated marking schemes
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
                  <span>Assessment Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure your assessment parameters for AI generation in ECZ
                  format
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
                        <SelectItem value="Additional Mathematics">
                          Additional Mathematics
                        </SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Geography">Geography</SelectItem>
                        <SelectItem value="Civic Education">
                          Civic Education
                        </SelectItem>
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
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                            Grade {i + 1}
                          </SelectItem>
                        ))}
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
                      placeholder="Enter the specific topic or chapter"
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                    />
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
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-warning hover:bg-warning/90 text-warning-foreground text-base h-12"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Assessment...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Generate Assessment
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
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload("assessment")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Assessment
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload("marking-scheme")}
                        >
                          <FileCheck className="w-4 h-4 mr-2" />
                          Marking Scheme
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Badge className="bg-warning/10 text-warning">
                        ECZ Format
                      </Badge>
                      <Badge variant="outline">
                        {currentAssessment.difficulty.charAt(0).toUpperCase() +
                          currentAssessment.difficulty.slice(1)}{" "}
                        Level
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
                              </div>
                            </div>

                            <p className="mb-3">{question.question}</p>

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
                              <strong>Answer:</strong> {question.answer}
                              <br />
                              <strong>Explanation:</strong>{" "}
                              {question.explanation}
                            </div>
                          </div>
                        ))}
                      </div>
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
                          <Badge className="text-xs bg-warning/10 text-warning">
                            ECZ Format
                          </Badge>
                        </div>
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
                            onClick={() => setCurrentAssessment(assessment)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload("assessment")}
                          >
                            <Download className="w-3 h-3" />
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
