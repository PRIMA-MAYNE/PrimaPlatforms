import React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Download } from "lucide-react";

let deferredPrompt: any = null;

interface InstallPromptProps {
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
}

export function InstallPrompt({
  size = "sm",
  variant = "outline",
  className,
}: InstallPromptProps) {
  const [canInstall, setCanInstall] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setCanInstall(false);
    });
    return () =>
      window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    deferredPrompt = null;
    setCanInstall(false);
  };

  if (installed || !canInstall) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onInstall}
      className={className}
    >
      <Download className="h-4 w-4 mr-1" /> Install app
    </Button>
  );
}
