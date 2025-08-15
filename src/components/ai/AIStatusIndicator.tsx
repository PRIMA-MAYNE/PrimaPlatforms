import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Wifi, WifiOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { OpenRouterAIService } from '@/lib/openrouter-ai-service';
import { toast } from '@/hooks/use-toast';

interface AIStatusIndicatorProps {
  className?: string;
}

export function AIStatusIndicator({ className }: AIStatusIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'fallback' | 'error'>('checking');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const checkAIStatus = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await OpenRouterAIService.testConnection();
      setStatus(isConnected ? 'connected' : 'fallback');
    } catch (error) {
      console.error('AI status check failed:', error);
      setStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    checkAIStatus();
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Checking AI',
          variant: 'secondary' as const,
          description: 'Testing DeepSeek R1 connection...'
        };
      case 'connected':
        return {
          icon: <Sparkles className="h-3 w-3" />,
          text: 'DeepSeek R1 Active',
          variant: 'default' as const,
          description: 'Real AI content generation enabled'
        };
      case 'fallback':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: 'Local AI',
          variant: 'outline' as const,
          description: 'Using local AI generation (offline mode)'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'AI Error',
          variant: 'destructive' as const,
          description: 'AI service unavailable'
        };
    }
  };

  const config = getStatusConfig();
  const useRealAI = import.meta.env.VITE_USE_REAL_AI === 'true';

  const handleTestAI = async () => {
    await checkAIStatus();
    
    if (status === 'connected') {
      toast({
        title: "AI Connection Successful",
        description: "DeepSeek R1 is ready for content generation",
      });
    } else {
      toast({
        title: "AI Connection Failed",
        description: "Using local AI generation as fallback",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.text}
      </Badge>
      
      {useRealAI && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTestAI}
          disabled={isTestingConnection}
          className="h-6 px-2 text-xs"
        >
          {isTestingConnection ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Wifi className="h-3 w-3" />
          )}
          Test
        </Button>
      )}
      
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {config.description}
      </span>
    </div>
  );
}
