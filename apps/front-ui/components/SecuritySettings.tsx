"use client";

import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  LockIcon,
  LogInIcon,
  MonitorIcon,
  ShieldIcon,
  SmartphoneIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CHANGE_PASSWORD, GET_SECURITY_LOGS } from "@/graphql/auth.gql";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const ACTION_LABELS: Record<string, { label: string; icon: typeof LogInIcon; color: string }> = {
  LOGIN: { label: "Signed in", icon: LogInIcon, color: "text-green-500" },
  FAILED_LOGIN: { label: "Failed login attempt", icon: AlertTriangleIcon, color: "text-red-500" },
  PASSWORD_CHANGE: { label: "Password changed", icon: KeyIcon, color: "text-primary" },
  PASSWORD_RESET: { label: "Password reset", icon: LockIcon, color: "text-primary" },
  EMAIL_VERIFIED: { label: "Email verified", icon: CheckCircleIcon, color: "text-green-500" },
  OTP_SENT: { label: "Verification code sent", icon: SmartphoneIcon, color: "text-blue-500" },
  LOGOUT: { label: "Signed out", icon: LogInIcon, color: "text-gray-500" },
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function getDeviceIcon(userAgent?: string) {
  if (!userAgent) return MonitorIcon;
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return SmartphoneIcon;
  return MonitorIcon;
}

export default function SecuritySettings() {
  const { showToast } = useToast();
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [changePassword, { loading: changing }] = useMutation(CHANGE_PASSWORD);
  const { data: logsData, loading: logsLoading } = useQuery(GET_SECURITY_LOGS, {
    fetchPolicy: "network-only",
  });

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      const { data: result } = await changePassword({
        variables: {
          input: {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          },
        },
      });

      if (result?.changePassword?.success) {
        showToast("success", "Password Changed", result.changePassword.message, true, 6000, "bottom-right");
        form.reset();
      }
    } catch (err: any) {
      showToast("error", "Error", err.message, true, 8000, "bottom-right");
    }
  };

  const logs = logsData?.securityLogs || [];

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockIcon className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          placeholder="Enter current password"
                          {...field}
                          className="w-full pr-10 bg-transparent border rounded-md px-3 py-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showCurrentPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          placeholder="Enter new password"
                          {...field}
                          className="w-full pr-10 bg-transparent border rounded-md px-3 py-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showNewPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                        className="w-full bg-transparent border rounded-md px-3 py-2 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={changing} className="bg-primary hover:bg-primary/90">
                {changing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Changing...
                  </span>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your recent account security events</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No security events recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {logs.map((log: any) => {
                const actionConfig = ACTION_LABELS[log.action] || {
                  label: log.action,
                  icon: ShieldIcon,
                  color: "text-gray-500",
                };
                const Icon = actionConfig.icon;
                const DeviceIcon = getDeviceIcon(log.userAgent);

                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-muted ${actionConfig.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{actionConfig.label}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DeviceIcon className="h-3 w-3" />
                        <span>{log.ipAddress || "Unknown IP"}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(log.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
