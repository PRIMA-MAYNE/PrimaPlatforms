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
import { FileText, Sparkles, Download, Plus } from "lucide-react";

const LessonPlanning: React.FC = () => {
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
          <Button className="catalyst-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-16">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-24 h-24 rounded-full catalyst-gradient">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                AI-Powered Lesson Planning
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                This powerful module will generate complete lesson plans based
                on your subject and topic input. Features will include
                objectives, materials, activities, and assessment strategies.
              </CardDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
              <div className="space-y-2">
                <FileText className="w-8 h-8 mx-auto text-catalyst-600" />
                <h3 className="font-semibold">Easy Input</h3>
                <p className="text-sm text-muted-foreground">
                  Simply select class and type lesson topic
                </p>
              </div>
              <div className="space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-catalyst-600" />
                <h3 className="font-semibold">AI Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Complete plans with best teaching practices
                </p>
              </div>
              <div className="space-y-2">
                <Download className="w-8 h-8 mx-auto text-catalyst-600" />
                <h3 className="font-semibold">Export Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Download in Word or PDF format
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

export default LessonPlanning;
