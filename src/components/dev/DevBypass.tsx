import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { config } from "@/lib/config";
import { toast } from "@/hooks/use-toast";
import { Settings, User, Zap } from "lucide-react";

export const DevBypass: React.FC = () => {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Don't show in production
  if (!config.isDevelopment && !config.demo.enableDemoData) {
    return null;
  }

  const handleQuickSignup = async () => {
    setIsLoading(true);
    const timestamp = Date.now();
    const demoEmail = `demo.teacher.${timestamp}@catalyst.edu`;
    const demoPassword = "CatalystDemo123!";

    try {
      const { error } = await signUp(
        demoEmail,
        demoPassword,
        "Demo Teacher",
        "Catalyst Demo School",
      );

      if (!error) {
        toast({
          title: "Demo Account Created!",
          description: "You're now signed in with a demo account.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Demo signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    // Try to sign in with a common demo account
    try {
      const { error } = await signIn("demo@catalyst.edu", "CatalystDemo123!");

      if (!error) {
        navigate("/dashboard");
      } else {
        // If demo account doesn't exist, create it
        await handleQuickSignup();
      }
    } catch (error) {
      // Create demo account if login fails
      await handleQuickSignup();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-catalyst-300 bg-catalyst-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-catalyst-600" />
            <CardTitle className="text-lg">Development Mode</CardTitle>
          </div>
          <Badge variant="outline" className="text-catalyst-700">
            Demo Access
          </Badge>
        </div>
        <CardDescription>
          Quick access options for testing and demonstration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleDemoLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <User className="w-4 h-4 mr-2" />
            Demo Teacher Login
          </Button>

          <Button
            onClick={handleQuickSignup}
            disabled={isLoading}
            className="w-full catalyst-gradient"
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Demo Signup
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Email verification is bypassed in demo mode</p>
          <p>• Demo accounts are automatically created and signed in</p>
          <p>• All features are available for immediate testing</p>
        </div>
      </CardContent>
    </Card>
  );
};
