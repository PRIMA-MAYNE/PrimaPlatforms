import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, User, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { DemoDataService } from '@/lib/demo-data-service';

interface DemoSignInProps {
  className?: string;
}

export function DemoSignIn({ className }: DemoSignInProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [demoStatus, setDemoStatus] = useState<'ready' | 'signing-in' | 'success' | 'error'>('ready');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const DEMO_CREDENTIALS = {
    email: import.meta.env.VITE_DEMO_EMAIL || 'demo@catalyst.edu',
    password: import.meta.env.VITE_DEMO_PASSWORD || 'CatalystDemo2024!'
  };

  const handleDemoSignIn = async () => {
    setIsSigningIn(true);
    setDemoStatus('signing-in');

    try {
      const { data, error } = await signIn(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);

      if (error) {
        throw new Error(error.message);
      }

      setDemoStatus('success');

      toast({
        title: "Demo Access Granted!",
        description: "Setting up demo data with sample students, lessons, and assessments...",
      });

      // Populate demo data in background
      if (data?.user?.id) {
        try {
          await DemoDataService.populateDemoData(data.user.id);
          toast({
            title: "Demo Data Ready!",
            description: "Explore the system with pre-loaded educational content",
          });
        } catch (demoError) {
          console.warn('Demo data population failed:', demoError);
          // Don't fail the login process if demo data fails
        }
      }

      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Demo sign-in failed:', error);
      setDemoStatus('error');

      toast({
        title: "Demo Sign-In Failed",
        description: error instanceof Error ? error.message : "Please try again or use manual sign-in",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const getStatusIcon = () => {
    switch (demoStatus) {
      case 'signing-in':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (demoStatus) {
      case 'signing-in':
        return 'Authenticating...';
      case 'success':
        return 'Access Granted';
      case 'error':
        return 'Try Again';
      default:
        return 'Quick Demo Access';
    }
  };

  const isDemoEnabled = import.meta.env.VITE_DEMO_MODE === 'true';

  if (!isDemoEnabled) {
    return null;
  }

  return (
    <Card className={`border-2 border-dashed border-primary/30 bg-primary/5 ${className}`}>
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            🚀 Quick Demo Access
          </Badge>
        </div>
        <CardTitle className="text-lg">Instant System Inspection</CardTitle>
        <CardDescription className="text-sm">
          One-click access to explore all features with pre-loaded demo data
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <User className="h-3 w-3 text-gray-600" />
            <span className="font-mono text-gray-700">demo@catalyst.edu</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Lock className="h-3 w-3 text-gray-600" />
            <span className="font-mono text-gray-700">••••••••••••</span>
          </div>
        </div>

        <Button
          onClick={handleDemoSignIn}
          disabled={isSigningIn}
          className="w-full"
          size="lg"
        >
          {getStatusIcon()}
          {getStatusText()}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🎓 <strong>Includes:</strong> Sample students, lessons, assessments</p>
          <p>⚡ <strong>AI Features:</strong> Real DeepSeek R1 integration</p>
          <p>📊 <strong>Analytics:</strong> Pre-generated insights and reports</p>
        </div>
      </CardContent>
    </Card>
  );
}
