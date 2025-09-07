import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

let deferredPrompt: any = null;

export function InstallPrompt() {
  const [canInstall, setCanInstall] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler as any);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setCanInstall(false);
    });
    return () => window.removeEventListener('beforeinstallprompt', handler as any);
  }, []);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    deferredPrompt = null;
    setCanInstall(false);
  };

  if (installed || !canInstall) return null;

  return (
    <Button variant="outline" size="sm" onClick={onInstall} className="h-8">
      <Download className="h-4 w-4 mr-1" /> Install app
    </Button>
  );
}
