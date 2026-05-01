"use client";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  Building2Icon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  CREATE_BUSINESS,
  CREATE_CLIENT,
  CREATE_WORKER,
  getLoginMutation,
} from "@/graphql/auth.gql";
import { setAuthToken } from "@/lib/auth";

// Business types
const businessTypes = [
  { value: "ARTISAN", label: "Artisan & Handcrafted Goods", icon: "🎨" },
  { value: "BOOKSTORE", label: "Bookstore & Stationery", icon: "📚" },
  { value: "ELECTRONICS", label: "Electronics & Gadgets", icon: "📱" },
  { value: "HARDWARE", label: "Hardware & Tools", icon: "🔧" },
  { value: "GROCERY", label: "Grocery & Convenience", icon: "🛒" },
  { value: "CAFE", label: "Café & Coffee Shops", icon: "☕" },
  { value: "RESTAURANT", label: "Restaurant & Dining", icon: "🍽️" },
  { value: "RETAIL", label: "Retail & General Stores", icon: "🏪" },
  { value: "BAR", label: "Bar & Pub", icon: "🍺" },
  { value: "CLOTHING", label: "Clothing & Accessories", icon: "👕" },
];

const workerRoles = [
  { value: "ADMIN", label: "Administrator", icon: "👑" },
  { value: "MANAGER", label: "Manager", icon: "💼" },
  { value: "STAFF", label: "Staff Member", icon: "👤" },
  { value: "FREELANCER", label: "Freelancer", icon: "🎯" },
  { value: "SUPERVISOR", label: "Supervisor", icon: "👁️" },
  { value: "PRIMARY", label: "Primary Worker", icon: "⭐" },
  { value: "ASSISTANT", label: "Assistant", icon: "🤝" },
];

// Zod Schema
const schema = z
  .object({
    role: z.enum(["Client", "Business", "Worker"], {
      message: "Please select a role",
    }),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    workerRole: z
      .enum([
        "ADMIN",
        "STAFF",
        "MANAGER",
        "FREELANCER",
        "SUPERVISOR",
        "PRIMARY",
        "ASSISTANT",
      ])
      .optional(),
    businessId: z.string().optional(),
    businessType: z.string().optional(),
  })
  .refine(
    (data) => data.role !== "Worker" || (data.workerRole && data.businessId),
    {
      message: "Worker role and business ID are required for Worker accounts",
      path: ["workerRole"],
    },
  );

type FormData = z.infer<typeof schema>;

export default function SignupPageV2() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const businessTypeFromUrl = params.get("businessType");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "Client",
      businessType: businessTypeFromUrl || undefined,
    },
  });

  const { handleSubmit, watch, setValue } = form;
  const role = watch("role");

  const [createClient, { loading: clientLoading }] = useMutation(CREATE_CLIENT);
  const [createBusiness, { loading: businessLoading }] =
    useMutation(CREATE_BUSINESS);
  const [createWorker, { loading: workerLoading }] = useMutation(CREATE_WORKER);
  const [signInBusiness] = useMutation(getLoginMutation("Business"));

  const loading = clientLoading || businessLoading || workerLoading;
  const { showToast } = useToast();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = async (data: FormData) => {
    try {
      let result;
      if (data.role === "Client") {
        result = await createClient({
          variables: {
            createClientInput: {
              email: data.email,
              password: data.password,
              username: data.fullName.trim(),
              fullName: data.fullName,
              phone: data.phone,
              isVerified: false,
            },
          },
        });
        result = result.data.createClient;
      } else if (data.role === "Business") {
        result = await createBusiness({
          variables: {
            createBusinessInput: {
              email: data.email,
              password: data.password,
              name: data.fullName,
              phone: data.phone,
              businessType: data.businessType || businessTypeFromUrl || "NA",
            },
          },
        });
        const createdBusiness = result.data.createBusiness;
        // Auto-login the business
        const { data: signIn } = await signInBusiness({
          variables: {
            SignInInput: { email: data.email, password: data.password },
          },
        });
        if (
          signIn?.signBusinessIn?.accessToken &&
          signIn?.signBusinessIn?.refreshToken
        ) {
          setAuthToken(
            signIn.signBusinessIn.accessToken,
            signIn.signBusinessIn.refreshToken,
          );
        }
        result = createdBusiness;
      } else if (data.role === "Worker") {
        result = await createWorker({
          variables: {
            createWorkerInput: {
              email: data.email,
              password: data.password,
              fullName: data.fullName,
              role: data.workerRole,
              businessId: data.businessId,
              isVerified: false,
            },
          },
        });
        result = result.data.createWorker;
      }

      showToast(
        "success",
        "Success",
        "Account Created Successfully",
        true,
        8000,
        "bottom-right",
      );

      if (data.role === "Business") {
        router.push("/create-business-setup");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      showToast(
        "error",
        "Registration Failed",
        err.message,
        true,
        8000,
        "bottom-right",
      );
    }
  };

  const steps = [
    { number: 1, title: "Account Type", description: "Choose your role" },
    {
      number: 2,
      title: "Personal Info",
      description: "Tell us about yourself",
    },
    { number: 3, title: "Credentials", description: "Secure your account" },
    { number: 4, title: "Review", description: "Confirm your details" },
  ];

  return (
    <div className="relative w-full min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-200 h-200 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-150 h-150 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/3 w-100 h-100 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Left Panel - Branding (Hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 border-r border-white/5 bg-linear-to-br from-primary/20 via-transparent to-accent/10 backdrop-blur-sm">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 mix-blend-overlay"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">U</span>
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              USCOR MARKETPLACE
            </span>
          </div>

          {/* Hero content */}
          <div className="mt-16 space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Start Your Journey
              </span>
              <br />
              <span className="bg-linear-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent">
                With USCOR Today
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
              Join thousands of businesses across East Africa. Manage your
              operations, grow your customer base, and thrive in the digital
              economy.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                {
                  icon: <SmartphoneIcon className="h-6 w-6" />,
                  title: "Mobile Money",
                  desc: "M-Pesa, MTN, Airtel",
                },
                {
                  icon: <ZapIcon className="h-6 w-6" />,
                  title: "Offline POS",
                  desc: "Work without internet",
                },
                {
                  icon: <GlobeIcon className="h-6 w-6" />,
                  title: "E-commerce",
                  desc: "Online marketplace",
                },
                {
                  icon: <ShieldCheckIcon className="h-6 w-6" />,
                  title: "Verified",
                  desc: "KYC protection",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="text-primary mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-white text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-linear-to-br from-primary/30 to-accent/30 border-2 border-gray-900 flex items-center justify-center text-xs text-white font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Trusted by 10,000+ businesses
              </p>
              <p className="text-xs text-gray-500">
                Join our growing community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative overflow-y-auto">
        {/* Mobile decorative elements */}
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="w-full max-w-2xl relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              USCOR MARKETPLACE
            </span>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((s, idx) => (
                <div key={s.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                        step >= s.number
                          ? "bg-linear-to-r from-primary to-accent text-white shadow-lg shadow-primary/25"
                          : "bg-white/5 text-gray-500 border border-white/10"
                      }`}
                    >
                      {step > s.number ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        s.number
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block ${step >= s.number ? "text-white" : "text-gray-500"}`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-8 sm:w-16 h-0.5 mx-2 transition-all duration-300 ${
                        step > s.number
                          ? "bg-linear-to-r from-primary to-accent"
                          : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">
                Step {step} of 4
              </span>
              <span className="text-sm text-gray-400">
                {Math.round((step / 4) * 100)}% complete
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
              {step === 1 && "Choose Your Account Type"}
              {step === 2 && "Tell Us About Yourself"}
              {step === 3 && "Secure Your Account"}
              {step === 4 && "Review Your Details"}
            </h2>
            <p className="text-gray-400">
              {step === 1 && "Select the role that best describes you"}
              {step === 2 && "Enter your personal or business information"}
              {step === 3 && "Create a strong password for security"}
              {step === 4 && "Verify everything looks correct"}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div className="space-y-4 signin-step">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-medium">
                          Account Type
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              {
                                value: "Client",
                                label: "Client",
                                icon: <UserIcon className="h-5 w-5" />,
                                desc: "Browse & shop",
                              },
                              {
                                value: "Business",
                                label: "Business",
                                icon: <Building2Icon className="h-5 w-5" />,
                                desc: "Sell & manage",
                              },
                              {
                                value: "Worker",
                                label: "Worker",
                                icon: <BriefcaseIcon className="h-5 w-5" />,
                                desc: "Work & earn",
                              },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={`group p-4 rounded-xl border transition-all duration-300 text-left ${
                                  field.value === option.value
                                    ? "bg-linear-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                                }`}
                              >
                                <div
                                  className={`mb-2 ${field.value === option.value ? "text-primary" : "text-gray-400 group-hover:text-primary"}`}
                                >
                                  {option.icon}
                                </div>
                                <h3
                                  className={`font-semibold text-sm ${field.value === option.value ? "text-white" : "text-gray-300"}`}
                                >
                                  {option.label}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {option.desc}
                                </p>
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <GlowButton
                    type="button"
                    onClick={handleNext}
                    disabled={!role}
                    className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRightIcon className="h-4 w-4" />
                  </GlowButton>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <div className="space-y-4 signin-step">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-medium">
                          {role === "Business" ? "Business Name" : "Full Name"}
                        </FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            placeholder={
                              role === "Business"
                                ? "Enter your business name"
                                : "Enter your full name"
                            }
                            className="w-full text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-medium">
                          Phone Number (Optional)
                        </FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            placeholder="+250 788 123 456"
                            className="w-full text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {role === "Business" && !businessTypeFromUrl && (
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 font-medium">
                            Business Type
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10">
                              {businessTypes.map((bt) => (
                                <button
                                  key={bt.value}
                                  type="button"
                                  onClick={() => field.onChange(bt.value)}
                                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                                    field.value === bt.value
                                      ? "bg-linear-to-br from-primary/20 to-accent/20 border-primary/50"
                                      : "bg-white/5 border-white/10 hover:bg-white/10"
                                  }`}
                                >
                                  <span className="text-lg mb-1 block">
                                    {bt.icon}
                                  </span>
                                  <span
                                    className={`text-xs font-medium ${field.value === bt.value ? "text-white" : "text-gray-400"}`}
                                  >
                                    {bt.label.split("&")[0]}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {role === "Worker" && (
                    <>
                      <FormField
                        control={form.control}
                        name="workerRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300 font-medium">
                              Your Role
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10">
                                {workerRoles.map((wr) => (
                                  <button
                                    key={wr.value}
                                    type="button"
                                    onClick={() => field.onChange(wr.value)}
                                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                                      field.value === wr.value
                                        ? "bg-linear-to-br from-primary/20 to-accent/20 border-primary/50"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                                  >
                                    <span className="text-lg mb-1 block">
                                      {wr.icon}
                                    </span>
                                    <span
                                      className={`text-xs font-medium ${field.value === wr.value ? "text-white" : "text-gray-400"}`}
                                    >
                                      {wr.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300 font-medium">
                              Business ID
                            </FormLabel>
                            <FormControl>
                              <input
                                {...field}
                                placeholder="Enter the business ID you work for"
                                className="w-full text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className="flex gap-3">
                    <GlowButton
                      type="button"
                      onClick={handleBack}
                      className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ArrowLeftIcon className="h-4 w-4" /> Back
                    </GlowButton>
                    <GlowButton
                      type="button"
                      onClick={handleNext}
                      disabled={
                        !watch("fullName") ||
                        (role === "Worker" && !watch("workerRole"))
                      }
                      className="flex-1 h-12 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      Next Step <ArrowRightIcon className="h-4 w-4" />
                    </GlowButton>
                  </div>
                </div>
              )}

              {/* Step 3: Credentials */}
              {step === 3 && (
                <div className="space-y-4 signin-step">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                              <MailIcon className="h-5 w-5" />
                            </div>
                            <input
                              {...field}
                              type="email"
                              placeholder="name@example.com"
                              className="w-full pl-12 text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-medium">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                              <LockIcon className="h-5 w-5" />
                            </div>
                            <input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              className="w-full pl-12 pr-12 text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                            >
                              {showPassword ? (
                                <EyeOffIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password strength indicator */}
                  {watch("password") && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              watch("password").length >= level * 2
                                ? level <= 2
                                  ? "bg-red-500"
                                  : level === 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {watch("password").length < 6 && "Too short"}
                        {watch("password").length >= 6 &&
                          watch("password").length < 10 &&
                          "Fair"}
                        {watch("password").length >= 10 &&
                          watch("password").length < 14 &&
                          "Good"}
                        {watch("password").length >= 14 && "Strong"}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <GlowButton
                      type="button"
                      onClick={handleBack}
                      className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ArrowLeftIcon className="h-4 w-4" /> Back
                    </GlowButton>
                    <GlowButton
                      type="button"
                      onClick={handleNext}
                      disabled={
                        !watch("email") ||
                        !watch("password") ||
                        watch("password").length < 6
                      }
                      className="flex-1 h-12 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      Next Step <ArrowRightIcon className="h-4 w-4" />
                    </GlowButton>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4 signin-step">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <SparklesIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-white">
                        Review Your Information
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-400 text-sm">
                          Account Type:
                        </span>
                        <span className="text-white font-medium flex items-center gap-2">
                          {role === "Client" && (
                            <UserIcon className="h-4 w-4" />
                          )}
                          {role === "Business" && (
                            <Building2Icon className="h-4 w-4" />
                          )}
                          {role === "Worker" && (
                            <BriefcaseIcon className="h-4 w-4" />
                          )}
                          {role}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-400 text-sm">
                          {role === "Business" ? "Business Name" : "Full Name"}:
                        </span>
                        <span className="text-white font-medium">
                          {watch("fullName")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-400 text-sm">Email:</span>
                        <span className="text-white font-medium">
                          {watch("email")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-400 text-sm">Password:</span>
                        <span className="text-white font-medium">••••••••</span>
                      </div>
                      {watch("phone") && (
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400 text-sm">Phone:</span>
                          <span className="text-white font-medium">
                            {watch("phone")}
                          </span>
                        </div>
                      )}
                      {role === "Business" && watch("businessType") && (
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400 text-sm">
                            Business Type:
                          </span>
                          <span className="text-white font-medium">
                            {businessTypes.find(
                              (bt) => bt.value === watch("businessType"),
                            )?.label || watch("businessType")}
                          </span>
                        </div>
                      )}
                      {role === "Worker" && watch("workerRole") && (
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400 text-sm">
                            Worker Role:
                          </span>
                          <span className="text-white font-medium">
                            {workerRoles.find(
                              (wr) => wr.value === watch("workerRole"),
                            )?.label || watch("workerRole")}
                          </span>
                        </div>
                      )}
                      {role === "Worker" && watch("businessId") && (
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400 text-sm">
                            Business ID:
                          </span>
                          <span className="text-white font-medium">
                            {watch("businessId")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <GlowButton
                      type="button"
                      onClick={handleBack}
                      className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ArrowLeftIcon className="h-4 w-4" /> Back
                    </GlowButton>
                    <GlowButton
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5" /> Create Account
                        </>
                      )}
                    </GlowButton>
                  </div>
                </div>
              )}
            </form>
          </Form>

          {/* Footer */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-gray-400">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-primary hover:text-accent transition-colors underline underline-offset-4"
              >
                Sign in
              </a>
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-600">
              © 2024 USCOR. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
