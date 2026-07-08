"use client";

import { useMutation } from "@apollo/client";
import {
  CheckCircleIcon,
  MailIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  TimerIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlowButton } from "@/components/seraui/GlowButton";
import { useToast } from "@/components/toast-provider";
import { RESEND_OTP, VERIFY_EMAIL } from "@/graphql/auth.gql";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 600;

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || params.get("to") || "";
  const { showToast } = useToast();

  const [verified, setVerified] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyEmail, { loading: verifying }] = useMutation(VERIFY_EMAIL);
  const [resendOtp, { loading: resending }] = useMutation(RESEND_OTP);

  // Timer
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

  // OTP handlers
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
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }, []);

  const otpValue = otp.join("");
  const isOtpComplete = otpValue.length === OTP_LENGTH;

  const handleVerify = async () => {
    if (!isOtpComplete) return;
    try {
      const { data } = await verifyEmail({
        variables: { input: { email, otp: otpValue } },
      });
      if (data?.verifyEmail?.success) {
        setVerified(true);
        showToast(
          "success",
          "Verified!",
          data.verifyEmail.message,
          true,
          6000,
          "bottom-right",
        );
      }
    } catch (err: any) {
      showToast(
        "error",
        "Verification Failed",
        err.message,
        true,
        8000,
        "bottom-right",
      );
    }
  };

  const handleResend = async () => {
    try {
      const { data } = await resendOtp({
        variables: { input: { email, purpose: "EMAIL_VERIFICATION" } },
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

  return (
    <div className="relative w-full min-h-screen bg-background flex overflow-hidden">
      {/* Background */}
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
                Verify Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent">
                Email Address
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Email verification keeps your account secure and helps us
              communicate important updates about your business.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                {
                  icon: <MailIcon className="h-6 w-6" />,
                  title: "Quick Setup",
                  desc: "2 minutes to verify",
                },
                {
                  icon: <ShieldCheckIcon className="h-6 w-6" />,
                  title: "Secure",
                  desc: "OTP verification",
                },
              ].map((feature, idx) => (
                <div
                  key={feature.title}
                  className="group p-4 rounded-xl bg-card/50 dark:bg-white/5 border border-border dark:border-white/10 hover:bg-card dark:hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <span className="text-primary mb-2 block">
                    {feature.icon}
                  </span>
                  <h3 className="font-semibold text-foreground text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-8 border-t border-border dark:border-white/10">
          <p className="text-sm text-muted-foreground">
            Already verified?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-accent transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
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

          {verified ? (
            /* Success */
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                Email Verified!
              </h2>
              <p className="text-muted-foreground">
                Your email has been verified successfully. You can now sign in
                to your account.
              </p>
              <GlowButton
                onClick={() => router.push("/login")}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Sign In
              </GlowButton>
            </div>
          ) : !email ? (
            /* No email */
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
                <MailIcon className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                Check Your Email
              </h2>
              <p className="text-muted-foreground">
                We've sent a verification link to your email address. Please
                check your inbox and click the link to verify.
              </p>
              <Link href="/login">
                <GlowButton className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 mt-4">
                  Go to Sign In
                </GlowButton>
              </Link>
            </div>
          ) : (
            /* OTP Form */
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <MailIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent mb-2">
                  Verify Email
                </h2>
                <p className="text-muted-foreground">
                  Enter the 6-digit code sent to{" "}
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
                onClick={handleVerify}
                disabled={!isOtpComplete || verifying || timeLeft <= 0}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-4"
              >
                {verifying ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </GlowButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
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
          )}

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
