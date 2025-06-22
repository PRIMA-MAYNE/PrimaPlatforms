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
import { TrendingUp, LineChart, Users, Plus } from "lucide-react";

const PerformanceTracker: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Performance Tracker
            </h1>
            <p className="text-muted-foreground">
              Visual progress tracking and academic performance analytics
            </p>
          </div>
          <Button className="bg-info hover:bg-info/90 text-info-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Grades
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="text-center py-16">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-info/10">
                <TrendingUp className="w-12 h-12 text-info" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                Student Performance Analytics
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Track student progress with beautiful visualizations, identify
                trends, and provide data-driven insights for improved learning
                outcomes.
              </CardDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
              <div className="space-y-2">
                <LineChart className="w-8 h-8 mx-auto text-info" />
                <h3 className="font-semibold">Grade Visualization</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive charts and graphs
                </p>
              </div>
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 mx-auto text-info" />
                <h3 className="font-semibold">Trend Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Track improvement over time
                </p>
              </div>
              <div className="space-y-2">
                <Users className="w-8 h-8 mx-auto text-info" />
                <h3 className="font-semibold">Class Comparison</h3>
                <p className="text-sm text-muted-foreground">
                  Compare individual vs class performance
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

export default PerformanceTracker;
