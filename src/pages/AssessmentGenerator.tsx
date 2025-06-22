import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Target, FileCheck, Plus } from "lucide-react";

const AssessmentGenerator: React.FC = () => {
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
              Create tests and assignments with automated marking schemes
            </p>
          </div>
          <Button className="bg-warning hover:bg-warning/90 text-warning-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Generate Assessment
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-16">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-warning/10">
                <ClipboardList className="w-12 h-12 text-warning" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                AI Assessment Generator
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Generate comprehensive assessments in ECZ format with automatic
                marking schemes. Create tests, quizzes, and assignments tailored
                to your curriculum.
              </CardDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
              <div className="space-y-2">
                <Target className="w-8 h-8 mx-auto text-warning" />
                <h3 className="font-semibold">ECZ Format</h3>
                <p className="text-sm text-muted-foreground">
                  Questions generated in official ECZ format
                </p>
              </div>
              <div className="space-y-2">
                <ClipboardList className="w-8 h-8 mx-auto text-warning" />
                <h3 className="font-semibold">Multiple Types</h3>
                <p className="text-sm text-muted-foreground">
                  MCQs, short answers, and essay questions
                </p>
              </div>
              <div className="space-y-2">
                <FileCheck className="w-8 h-8 mx-auto text-warning" />
                <h3 className="font-semibold">Auto Marking</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic marking schemes generated
                </p>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                This module is currently under development and will be available
                soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AssessmentGenerator;
