"use client";

import { GlowButton } from "@/components/seraui/GlowButton";
import { useToast } from "@/components/toast-provider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FORGOT_PASSWORD } from "@/graphql/auth.gql";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  KeyIcon,
  MailIcon,
  ShieldIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { showToast } = useToast();

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: result } = await forgotPassword({
        variables: { input: { email: data.email } },
      });

      if (result?.forgotPassword?.success) {
        setSent(true);
        setSentEmail(data.email);
        showToast(
          "success",
          "Email Sent",
          result.forgotPassword.message,
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
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-200 h-200 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 w-150 h-150 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Left Panel — Branding */}
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
                Account Recovery
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              We'll send you a secure verification code to reset your password.
              Your account security is our priority.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                {
                  icon: <MailIcon className="h-6 w-6" />,
                  title: "Email Verification",
                  desc: "Secure OTP delivery",
                },
                {
                  icon: <ShieldIcon className="h-6 w-6" />,
                  title: "Encrypted",
                  desc: "End-to-end security",
                },
                {
                  icon: <KeyIcon className="h-6 w-6" />,
                  title: "10 Min Expiry",
                  desc: "Time-limited codes",
                },
                {
                  icon: <CheckCircleIcon className="h-6 w-6" />,
                  title: "Quick Reset",
                  desc: "Back in 2 minutes",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group p-4 rounded-xl bg-card/50 dark:bg-white/5 border border-border dark:border-white/10 hover:bg-card dark:hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <span className="text-primary mb-2 block">
                    {feature.icon}
                  </span>
                  <h3 className="font-semibold text-foreground text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-8 border-t border-border dark:border-white/10">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-accent transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
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

          {sent ? (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
                <CheckCircleIcon className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                Check Your Email
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We've sent a 6-digit verification code to{" "}
                <span className="text-foreground font-medium">{sentEmail}</span>.
                Enter it on the next page to reset your password.
              </p>

              <Link
                href={`/reset-password?email=${encodeURIComponent(sentEmail)}`}
              >
                <GlowButton className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4">
                  Enter Verification Code
                </GlowButton>
              </Link>

              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    setSent(false);
                  }}
                  className="text-primary hover:text-accent transition-colors font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            /* Email Form */
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <KeyIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent mb-2">
                  Forgot Password?
                </h2>
                <p className="text-muted-foreground">
                  Enter your email and we'll send you a verification code
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <MailIcon className="h-5 w-5" />
                            </div>
                            <input
                              type="email"
                              placeholder="name@example.com"
                              {...field}
                              className="w-full pl-12 text-foreground bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl px-4 py-3 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <GlowButton
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Code"
                    )}
                  </GlowButton>
                </form>
              </Form>

              <div className="text-center mt-8">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Sign In
                </Link>
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
