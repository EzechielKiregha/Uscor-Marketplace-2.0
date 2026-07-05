"use client";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { useOfflineAuth } from "@/hooks/use-offline-auth";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, WifiOff } from "lucide-react";
import { useMemo } from "react";

interface OfflineAccessCardProps {
  workerId?: string;
}

export function OfflineAccessCard({ workerId }: OfflineAccessCardProps) {
  const { loading, error, offlineSession, daysRemaining, isOfflineAuthenticated, requestOfflineAccess } =
    useOfflineAuth(workerId);
  const { showToast } = useToast();

  const statusText = useMemo(() => {
    if (isOfflineAuthenticated && offlineSession) {
      return `Offline access is ready for ${offlineSession.workerProfile.fullName || offlineSession.workerProfile.email}.`;
    }

    if (offlineSession) {
      return "Offline session exists but needs to be refreshed.";
    }

    return "Enable offline access so this device can be used for worker checkout and stock tasks when the connection drops.";
  }, [isOfflineAuthenticated, offlineSession]);

  const handleRequestAccess = async () => {
    const ok = await requestOfflineAccess("Current Device");
    if (ok) {
      showToast(
        "success",
        "Offline access enabled",
        "This device is now authorized for worker offline mode.",
        true,
        8000,
        "bottom-right",
      );
      return;
    }

    showToast(
      "error",
      "Unable to enable offline access",
      error || "Please try again while connected to the internet.",
      true,
      8000,
      "bottom-right",
    );
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isOfflineAuthenticated ? <ShieldCheck className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Offline access</p>
            <p className="text-sm text-muted-foreground">{statusText}</p>
            {isOfflineAuthenticated && offlineSession && (
              <p className="mt-1 text-xs text-muted-foreground">
                {daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining • {offlineSession.permissions.length} permissions enabled
              </p>
            )}
          </div>
        </div>

        <Button onClick={handleRequestAccess} disabled={loading || !workerId} className="whitespace-nowrap">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Requesting...
            </span>
          ) : isOfflineAuthenticated ? (
            "Refresh access"
          ) : (
            "Request offline access"
          )}
        </Button>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && isOfflineAuthenticated && offlineSession && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          This device is authorized for offline checkout and inventory tasks.
        </div>
      )}
    </div>
  );
}
