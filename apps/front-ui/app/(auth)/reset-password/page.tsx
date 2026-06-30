"use client";

import { GlowButton } from "@/components/seraui/GlowButton";
import { useToast } from "@/components/toast-provider";
import { RESEND_OTP, RESET_PASSWORD } from "@/graphql/auth.gql";
import { useMutation } from "@apollo/client";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  LockIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  TimerIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 600; // 10 minutes

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const { showToast } = useToast();

  const [step, setStep] = useState<"otp" | "password" | "success">("otp");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resetPassword, { loading: resetting }] = useMutation(RESET_PASSWORD);
  const [resendOtp, { loading: resending }] = useMutation(RESEND_OTP);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // OTP input handlers
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  }, []);

  const otpValue = otp.join("");
  const isOtpComplete = otpValue.length === OTP_LENGTH;

  const handleVerifyOtp = () => {
    if (isOtpComplete) setStep("password");
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast(
        "error",
        "Error",
        "Password must be at least 6 characters",
        true,
        6000,
        "bottom-right",
      );
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: {
          input: { email, otp: otpValue, newPassword },
        },
      });

      if (data?.resetPassword?.success) {
        setStep("success");
        showToast(
          "success",
          "Success",
          data.resetPassword.message,
          true,
          6000,
          "bottom-right",
        );
      }
    } catch (err: any) {
      showToast(
        "error",
        "Reset Failed",
        err.message,
        true,
        8000,
        "bottom-right",
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      const { data } = await resendOtp({
        variables: { input: { email, purpose: "PASSWORD_RESET" } },
      });
      if (data?.resendOtp?.success) {
        setTimeLeft(OTP_EXPIRY_SECONDS);
        setOtp(Array(OTP_LENGTH).fill(""));
        showToast(
          "success",
          "Code Sent",
          "A new verification code has been sent",
          true,
          6000,
          "bottom-right",
        );
      }
    } catch (err: any) {
      showToast("error", "Error", err.message, true, 8000, "bottom-right");
    }
  };

  // Password strength
  const getPasswordStrength = (pw: string) => {
    if (pw.length < 6) return 0;
    let score = 1;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  };

  const strength = getPasswordStrength(newPassword);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-yellow-500",
    "bg-primary",
    "bg-green-500",
  ];

  if (!email) {
    return (
      <div className="relative w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <KeyIcon className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">No Email Provided</h2>
          <p className="text-muted-foreground">
            Please start the password reset process from the forgot password
            page.
          </p>
          <Link href="/forgot-password">
            <GlowButton className="mt-4 h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold px-8">
              Go to Forgot Password
            </GlowButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-background flex overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-200 h-200 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 w-150 h-150 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 border-r border-border bg-gradient-to-br from-primary/10 dark:from-primary/20 via-transparent to-accent/5 dark:to-accent/10 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 dark:from-primary/5 via-transparent to-accent/5 mix-blend-overlay" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">U</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              USCOR MARKETPLACE
            </span>
          </div>

          <div className="mt-16 space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                Reset Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent">
                Password
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Enter the verification code we sent to your email and create a new
              secure password.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-8 border-t border-border dark:border-white/10">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Your password is encrypted with argon2 hashing
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative">
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">U</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              USCOR
            </span>
          </div>

          {step === "success" ? (
            /* Success */
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                Password Reset!
              </h2>
              <p className="text-muted-foreground">
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>
              <GlowButton
                onClick={() => router.push("/login")}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Sign In
              </GlowButton>
            </div>
          ) : step === "otp" ? (
            /* OTP Input */
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <KeyIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent mb-2">
                  Enter Code
                </h2>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to{" "}
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              {/* OTP Inputs */}
              <div
                className="flex justify-center gap-3 mb-6"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold rounded-xl border transition-all duration-300 bg-muted/50 dark:bg-white/5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                      digit
                        ? "border-primary/50 shadow-lg shadow-primary/10"
                        : "border-border dark:border-white/10"
                    }`}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <TimerIcon
                  className={`h-4 w-4 ${timeLeft > 60 ? "text-muted-foreground" : "text-red-400"}`}
                />
                <span
                  className={`text-sm font-medium ${timeLeft > 60 ? "text-muted-foreground" : "text-red-400"}`}
                >
                  {timeLeft > 0
                    ? `Code expires in ${formatTime(timeLeft)}`
                    : "Code expired"}
                </span>
              </div>

              <GlowButton
                onClick={handleVerifyOtp}
                disabled={!isOtpComplete || timeLeft <= 0}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4"
              >
                Verify Code
              </GlowButton>

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={resending || timeLeft > OTP_EXPIRY_SECONDS - 60}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCwIcon
                    className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
                  />
                  Resend Code
                </button>
              </div>
            </>
          ) : (
            /* New Password */
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <LockIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent mb-2">
                  New Password
                </h2>
                <p className="text-muted-foreground">
                  Create a strong password for your account
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-foreground font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <LockIcon className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-12 pr-12 text-foreground bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl px-4 py-3 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password strength */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            strength >= level
                              ? strengthColors[level]
                              : "bg-muted dark:bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {strengthLabels[strength] || "Too short"}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <GlowButton
                    onClick={() => setStep("otp")}
                    className="flex-1 h-12 rounded-xl bg-card/50 dark:bg-white/5 border border-border dark:border-white/10 text-foreground font-semibold hover:bg-card dark:hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ArrowLeftIcon className="h-4 w-4" /> Back
                  </GlowButton>
                  <GlowButton
                    onClick={handleResetPassword}
                    disabled={resetting || newPassword.length < 6}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {resetting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Resetting...
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </GlowButton>
                </div>
              </div>
            </>
          )}

          <div className="text-center mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground/60">
              © 2026 USCOR. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
