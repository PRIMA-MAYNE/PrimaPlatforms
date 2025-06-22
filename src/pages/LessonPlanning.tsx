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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Sparkles,
  Download,
  Plus,
  Clock,
  Users,
  Target,
  BookOpen,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { generateLessonPlan } from "@/lib/ai-service";
import { toast } from "@/hooks/use-toast";

interface LessonPlan {
  title: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  duration: number;
  objectives: string[];
  materials: string[];
  introduction: string;
  lessonDevelopment: string;
  activities: string[];
  assessment: string;
  conclusion: string;
  isAiGenerated: boolean;
  generatedAt: string;
}

const LessonPlanning: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    gradeLevel: "",
    duration: 45,
    objectives: "",
  });

  const [savedPlans, setSavedPlans] = useState<LessonPlan[]>([]);

  const handleGenerate = async () => {
    if (!formData.subject || !formData.topic || !formData.gradeLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const objectives = formData.objectives
        .split("\n")
        .filter((obj) => obj.trim())
        .map((obj) => obj.trim());

      const plan = await generateLessonPlan({
        subject: formData.subject,
        topic: formData.topic,
        gradeLevel: formData.gradeLevel,
        duration: formData.duration,
        objectives,
      });

      setCurrentPlan(plan);
      toast({
        title: "Lesson Plan Generated!",
        description: "Your AI-powered lesson plan is ready for review",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate lesson plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (currentPlan) {
      setSavedPlans((prev) => [currentPlan, ...prev]);
      toast({
        title: "Lesson Plan Saved",
        description: "Plan has been saved to your collection",
      });
    }
  };

  const handleDownload = (format: "pdf" | "docx") => {
    if (!currentPlan) return;

    // Create downloadable content
    const content = `
LESSON PLAN

Title: ${currentPlan.title}
Subject: ${currentPlan.subject}
Grade Level: ${currentPlan.gradeLevel}
Duration: ${currentPlan.duration} minutes

LEARNING OBJECTIVES:
${currentPlan.objectives.map((obj, i) => `${i + 1}. ${obj}`).join("\n")}

MATERIALS REQUIRED:
${currentPlan.materials.map((mat, i) => `• ${mat}`).join("\n")}

INTRODUCTION:
${currentPlan.introduction}

LESSON DEVELOPMENT:
${currentPlan.lessonDevelopment}

ACTIVITIES:
${currentPlan.activities.map((act, i) => `${i + 1}. ${act}`).join("\n")}

ASSESSMENT:
${currentPlan.assessment}

CONCLUSION:
${currentPlan.conclusion}

Generated on: ${new Date(currentPlan.generatedAt).toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentPlan.title.replace(/[^a-zA-Z0-9]/g, "_")}.${format === "pdf" ? "txt" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Lesson plan downloaded as ${format.toUpperCase()}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              AI Lesson Planning
            </h1>
            <p className="text-muted-foreground">
              Generate comprehensive lesson plans with AI assistance
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              My Plans ({savedPlans.length})
            </Button>
            <Button className="catalyst-gradient">
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate Plan</TabsTrigger>
            <TabsTrigger value="review">Review & Edit</TabsTrigger>
            <TabsTrigger value="saved">Saved Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-catalyst-600" />
                  <span>Generate New Lesson Plan</span>
                </CardTitle>
                <CardDescription>
                  Provide the details below and our AI will create a
                  comprehensive lesson plan for you
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
                        <SelectItem value="Religious Education">
                          Religious Education
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
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="40">40 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="80">80 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Lesson Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="Enter the specific topic for this lesson"
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
                  <Label htmlFor="objectives">
                    Learning Objectives (Optional)
                  </Label>
                  <Textarea
                    id="objectives"
                    placeholder="Enter specific learning objectives, one per line. Leave blank for AI to generate."
                    value={formData.objectives}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        objectives: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full catalyst-gradient text-base h-12"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Lesson Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Lesson Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            {currentPlan ? (
              <>
                {/* Lesson Plan Preview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {currentPlan.title}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-2">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{currentPlan.subject}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{currentPlan.gradeLevel}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{currentPlan.duration} minutes</span>
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleSave}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save Plan
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload("pdf")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload("docx")}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Word
                        </Button>
                      </div>
                    </div>
                    {currentPlan.isAiGenerated && (
                      <Badge className="w-fit bg-catalyst-100 text-catalyst-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Learning Objectives */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-catalyst-600" />
                        Learning Objectives
                      </h3>
                      <ul className="space-y-1">
                        {currentPlan.objectives.map((objective, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-catalyst-600 font-medium">
                              {index + 1}.
                            </span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Materials */}
                    <div>
                      <h3 className="font-semibold mb-3">Required Materials</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentPlan.materials.map((material, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-2 h-2 bg-catalyst-500 rounded-full" />
                            <span>{material}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    {/* Lesson Structure */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Lesson Structure</h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 text-catalyst-700">
                            Introduction
                          </h4>
                          <p className="text-muted-foreground">
                            {currentPlan.introduction}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-catalyst-700">
                            Lesson Development
                          </h4>
                          <p className="text-muted-foreground">
                            {currentPlan.lessonDevelopment}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-catalyst-700">
                            Activities
                          </h4>
                          <ul className="space-y-1">
                            {currentPlan.activities.map((activity, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <span className="text-catalyst-600 font-medium">
                                  {index + 1}.
                                </span>
                                <span className="text-muted-foreground">
                                  {activity}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-catalyst-700">
                            Assessment
                          </h4>
                          <p className="text-muted-foreground">
                            {currentPlan.assessment}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-catalyst-700">
                            Conclusion
                          </h4>
                          <p className="text-muted-foreground">
                            {currentPlan.conclusion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Lesson Plan Generated
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Generate a lesson plan in the "Generate Plan" tab to review
                    and edit it here.
                  </p>
                  <Button variant="outline">Generate Your First Plan</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {savedPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPlans.map((plan, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <CardDescription>
                        {plan.gradeLevel} • {plan.duration} minutes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {plan.objectives.length} objectives
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated on{" "}
                          {new Date(plan.generatedAt).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPlan(plan)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload("pdf")}
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
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Plans</h3>
                  <p className="text-muted-foreground mb-4">
                    Your saved lesson plans will appear here once you start
                    generating and saving them.
                  </p>
                  <Button variant="outline">Generate Your First Plan</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlanning;
