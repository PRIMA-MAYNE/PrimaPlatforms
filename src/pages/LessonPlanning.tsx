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
  FileDown,
  Save,
  AlertCircle,
  HelpCircle,
  Check,
  X,
} from "lucide-react";
import { AIService } from "@/lib/ai-service";
import {
  exportLessonPlanToPDF,
  exportLessonPlanToDocx,
} from "@/lib/export-utils";
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
  eczAlignment?: string;
  isAiGenerated: boolean;
  generatedAt: string;
}

const LessonPlanning: React.FC = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState<LessonPlan | null>(null);
  const [formData, setFormData] = React.useState({
    subject: "",
    topic: "",
    gradeLevel: "",
    duration: 45,
    objectives: "",
  });

  const [savedPlans, setSavedPlans] = React.useState<LessonPlan[]>([]);
  const [activeTab, setActiveTab] = React.useState<"generate" | "review" | "saved">("generate");

  // Load saved plans from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("catalyst-lesson-plans");
    if (saved) {
      try {
        const parsedPlans = JSON.parse(saved);
        // Validate and clean saved plans
        const validPlans = parsedPlans.filter((plan: any) => 
          plan.title && plan.subject && plan.topic && plan.gradeLevel
        );
        setSavedPlans(validPlans);
      } catch (error) {
        console.error("Error loading saved plans:", error);
        localStorage.removeItem("catalyst-lesson-plans");
      }
    }
  }, []);

  // Save plans to localStorage
  React.useEffect(() => {
    localStorage.setItem("catalyst-lesson-plans", JSON.stringify(savedPlans));
  }, [savedPlans]);

  const handleGenerate = async () => {
    console.log("🔥 Generate lesson plan button clicked!", formData);

    if (!formData.subject || !formData.topic || !formData.gradeLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Starting lesson plan generation...");
    setIsGenerating(true);

    try {
      const objectives = formData.objectives
        .split("\n")
        .filter((obj) => obj.trim())
        .map((obj) => obj.trim());

      // Determine education level (primary/secondary) based on grade
      const grade = parseInt(formData.gradeLevel);
      const educationLevel = grade <= 7 ? 'primary' : 'secondary';

      const plan = await AIService.generateLessonPlan({
        subject: formData.subject,
        topic: formData.topic,
        gradeLevel: grade,
        educationLevel,
        duration: formData.duration,
        objectives: objectives.length > 0 ? objectives : undefined,
      });

      console.log("✅ Lesson plan generated:", plan);
      
      // Ensure plan has all required fields
      const validatedPlan: LessonPlan = {
        ...plan,
        title: plan.title || `${formData.subject} - ${formData.topic} Lesson Plan`,
        gradeLevel: formData.gradeLevel,
        isAiGenerated: true,
        generatedAt: new Date().toISOString()
      };
      
      setCurrentPlan(validatedPlan);
      setActiveTab("review"); // Auto-switch to review tab after generation

      toast({
        title: "ECZ-Aligned Lesson Plan Generated!",
        description: "Your plan follows Zambia's 2023 competence-based curriculum standards",
        variant: "success",
      });
    } catch (error) {
      console.error("Generation error:", error);
      
      // Fallback plan with Zambian curriculum standards
      const fallbackPlan: LessonPlan = {
        title: `Zambia Curriculum Fallback Plan for ${formData.topic}`,
        subject: formData.subject,
        topic: formData.topic,
        gradeLevel: formData.gradeLevel,
        duration: formData.duration,
        objectives: [
          "Students will develop critical thinking skills through problem-solving activities relevant to Zambian contexts",
          "Students will apply knowledge to real-world scenarios in their community",
          "Students will demonstrate understanding of core competencies in the subject area"
        ],
        materials: ["Whiteboard and markers", "Local materials for hands-on activities", "Student worksheets"],
        introduction: "This lesson introduces the topic using real-life examples from Zambian culture and environment.",
        lessonDevelopment: "Students will engage in collaborative group work using locally available resources.",
        activities: [
          "Group discussion on community-related examples",
          "Hands-on activity using local materials",
          "Problem-solving exercise with Zambian context"
        ],
        assessment: "Students will complete a short quiz and practical task aligned with ECZ standards",
        conclusion: "Review key concepts and discuss how they apply to everyday life in Zambia",
        eczAlignment: "Aligned with Zambia Education Curriculum Framework (ZECF) 2023, focusing on competence-based learning outcomes for " + formData.subject + " at Grade " + formData.gradeLevel,
        isAiGenerated: false,
        generatedAt: new Date().toISOString(),
      };

      setCurrentPlan(fallbackPlan);
      setActiveTab("review"); // Auto-switch to review tab for fallback
      toast({
        title: "AI Service Unavailable",
        description: "Using standard Zambian curriculum template",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => toast.dismiss()}>
            <Check className="w-3 h-3 mr-1" />
            Dismiss
          </Button>
        ),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!currentPlan) return;
    
    const existingIndex = savedPlans.findIndex(
      (p) => p.title === currentPlan.title && p.subject === currentPlan.subject
    );

    if (existingIndex >= 0) {
      setSavedPlans((prev) =>
        prev.map((p, i) => (i === existingIndex ? currentPlan : p))
      );
      toast({
        title: "Lesson Plan Updated",
        description: "Existing plan has been updated",
        variant: "default",
      });
    } else {
      setSavedPlans((prev) => [currentPlan, ...prev]);
      toast({
        title: "Lesson Plan Saved",
        description: "Plan has been saved to your collection",
        variant: "default",
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!currentPlan) return;
    try {
      exportLessonPlanToPDF(currentPlan);
      toast({
        title: "Download Started",
        description: "Lesson plan PDF download initiated",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocx = async () => {
    if (!currentPlan) return;
    try {
      await exportLessonPlanToDocx(currentPlan);
      toast({
        title: "Download Started",
        description: "Lesson plan DOCX download initiated",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export DOCX. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLoadPlan = (plan: LessonPlan) => {
    setCurrentPlan(plan);
    setFormData({
      subject: plan.subject,
      topic: plan.topic,
      gradeLevel: plan.gradeLevel,
      duration: plan.duration,
      objectives: plan.objectives.join("\n"),
    });
    setActiveTab("review");
  };

  const handleDeletePlan = (index: number) => {
    setSavedPlans((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Plan Deleted",
      description: "Lesson plan has been removed",
      variant: "destructive",
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
              Generate ECZ-aligned lesson plans for Zambian primary and secondary schools
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <HelpCircle className="w-4 h-4 text-catalyst-500" />
              <span className="text-sm text-muted-foreground">
                Designed for Zambia's 2023 Competence-Based Curriculum
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("saved")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Saved Plans ({savedPlans.length})
            </Button>
            <Button 
              className="catalyst-gradient" 
              size="sm"
              onClick={() => {
                setActiveTab("generate");
                setCurrentPlan(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full gap-2">
            <TabsTrigger value="generate" className="flex-1">Generate Plan</TabsTrigger>
            <TabsTrigger value="review" className="flex-1">Review & Export</TabsTrigger>
            <TabsTrigger value="saved" className="flex-1">Saved Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-catalyst-600" />
                  <span>Generate ECZ-Aligned Lesson Plan</span>
                </CardTitle>
                <CardDescription>
                  Provide details following Zambia's 2023 competence-based curriculum framework
                </CardDescription>
              </CardHeader>
              <CardContent className={`space-y-6 ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
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
                        <SelectItem value="Religious Education">
                          Religious Education
                        </SelectItem>
                        <SelectItem value="Art">Art</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
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
                          <SelectItem key={i + 1} value={`${i + 1}`}>
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
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Lesson Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="Enter the specific topic for this lesson (e.g., Quadratic Equations, Photosynthesis)"
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
                    Learning Objectives (Competency-Based)
                  </Label>
                  <Textarea
                    id="objectives"
                    placeholder="Enter competency-based objectives, one per line. Example: 'Students will analyze historical events using local Zambian examples' 
Leave blank for AI to generate ECZ-aligned objectives based on Zambia's 2023 curriculum"
                    value={formData.objectives}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        objectives: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <HelpCircle className="w-3 h-3" />
                    <span>
                      Objectives should focus on skills, knowledge, and attitudes as per Zambian competence-based curriculum standards
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full catalyst-gradient text-base h-12"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating ECZ-Aligned Lesson Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Lesson Plan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            {currentPlan ? (
              <>
                {/* Lesson Plan Preview */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{currentPlan.title}</CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{currentPlan.subject}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Grade {currentPlan.gradeLevel}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{currentPlan.duration} minutes</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>ECZ Aligned</span>
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleSave}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Plan
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPDF}>
                          <FileDown className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button variant="outline" onClick={handleDownloadDocx}>
                          <Download className="w-4 h-4 mr-2" />
                          DOCX
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {currentPlan.isAiGenerated ? (
                        <Badge className="bg-catalyst-100 text-catalyst-700">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Generated
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Fallback Template
                        </Badge>
                      )}
                      {currentPlan.eczAlignment && (
                        <Badge variant="secondary" className="flex items-center">
                          <Check className="w-3 h-3 mr-1" />
                          ECZ Aligned
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* ECZ Alignment */}
                    {currentPlan.eczAlignment && (
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start">
                          <div className="mt-1 mr-2">
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">
                              ECZ Curriculum Alignment
                            </h4>
                            <p className="text-sm text-blue-700">
                              {currentPlan.eczAlignment}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Learning Objectives */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-catalyst-600" />
                        Learning Objectives
                      </h3>
                      <ul className="space-y-1 pl-4">
                        {currentPlan.objectives.map((objective, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-catalyst-600 font-medium mt-1">
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
                          <h4 className="font-medium mb-2 text-catalyst-700 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            Introduction
                          </h4>
                          <p className="text-muted-foreground leading-relaxed pl-4">
                            {currentPlan.introduction}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-catalyst-700 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                            Lesson Development
                          </h4>
                          <p className="text-muted-foreground leading-relaxed pl-4">
                            {currentPlan.lessonDevelopment}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-catalyst-700 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                            Learning Activities
                          </h4>
                          <ul className="space-y-1 pl-6">
                            {currentPlan.activities.map((activity, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <span className="text-catalyst-600 font-medium mt-1">
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
                          <h4 className="font-medium mb-2 text-catalyst-700 flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                            Assessment
                          </h4>
                          <p className="text-muted-foreground leading-relaxed pl-4">
                            {currentPlan.assessment}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-catalyst-700 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                            Conclusion
                          </h4>
                          <p className="text-muted-foreground leading-relaxed pl-4">
                            {currentPlan.conclusion}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <div>
                        Generated on:{" "}
                        {new Date(currentPlan.generatedAt).toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-catalyst-500">Zambia Curriculum</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
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
                    and export it here.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab("generate")}
                  >
                    Generate Your First Plan
                  </Button>
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
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <span>Grade {plan.gradeLevel} • {plan.duration} min</span>
                        <Badge variant="outline" className="text-xs">
                          {plan.subject}
                        </Badge>
                        {plan.eczAlignment && (
                          <Badge variant="secondary" className="text-xs">
                            ECZ Aligned
                          </Badge>
                        )}
                        {plan.isAiGenerated ? (
                          <Badge variant="secondary" className="text-xs">
                            AI Generated
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Fallback
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
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
                            onClick={() => handleLoadPlan(plan)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCurrentPlan(plan);
                              handleDownloadPDF();
                            }}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePlan(index)}
                          >
                            <X className="w-3 h-3" />
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
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab("generate")}
                  >
                    Generate Your First Plan
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

export default LessonPlanning;
