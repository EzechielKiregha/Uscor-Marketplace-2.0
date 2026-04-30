"use client";

import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Beer,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Coffee,
  CreditCard,
  DollarSign,
  Dumbbell,
  Globe,
  Hammer,
  Laptop,
  MapPin,
  MessageSquare,
  Music,
  Package,
  Palette,
  PenTool,
  Shield,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  SprayCan,
  Store,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  Wrench,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { UPDATE_BUSINESS } from "@/graphql/business.gql";
import type { BusinessEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";

// Business types configuration
const businessTypes = [
  {
    value: "ARTISAN",
    label: "Artisan & Handcrafted Goods",
    icon: Palette,
    color: "from-pink-500 to-rose-500",
  },
  {
    value: "BOOKSTORE",
    label: "Bookstore & Stationery",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-500",
  },
  {
    value: "ELECTRONICS",
    label: "Electronics & Gadgets",
    icon: Laptop,
    color: "from-cyan-500 to-blue-500",
  },
  {
    value: "HARDWARE",
    label: "Hardware & Tools",
    icon: Hammer,
    color: "from-orange-500 to-amber-500",
  },
  {
    value: "GROCERY",
    label: "Grocery & Convenience",
    icon: ShoppingCart,
    color: "from-green-500 to-emerald-500",
  },
  {
    value: "CAFE",
    label: "Café & Coffee Shops",
    icon: Coffee,
    color: "from-amber-600 to-orange-600",
  },
  {
    value: "RESTAURANT",
    label: "Restaurant & Dining",
    icon: Utensils,
    color: "from-red-500 to-rose-500",
  },
  {
    value: "RETAIL",
    label: "Retail & General Stores",
    icon: Store,
    color: "from-purple-500 to-pink-500",
  },
  {
    value: "BAR",
    label: "Bar & Pub",
    icon: Beer,
    color: "from-yellow-500 to-amber-500",
  },
  {
    value: "CLOTHING",
    label: "Clothing & Accessories",
    icon: Shirt,
    color: "from-fuchsia-500 to-purple-500",
  },
];

// Service/Freelance specific types
const serviceTypes = [
  {
    value: "CONSULTING",
    label: "Consulting Services",
    icon: Briefcase,
    color: "from-blue-500 to-cyan-500",
  },
  {
    value: "TUTORING",
    label: "Tutoring & Education",
    icon: BookOpen,
    color: "from-indigo-500 to-purple-500",
  },
  {
    value: "REPAIR",
    label: "Repair & Maintenance",
    icon: Wrench,
    color: "from-orange-500 to-red-500",
  },
  {
    value: "BEAUTY",
    label: "Beauty & Wellness",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
  },
  {
    value: "FITNESS",
    label: "Fitness & Training",
    icon: Dumbbell,
    color: "from-green-500 to-teal-500",
  },
  {
    value: "PHOTOGRAPHY",
    label: "Photography & Video",
    icon: Camera,
    color: "from-violet-500 to-purple-500",
  },
  {
    value: "MUSIC",
    label: "Music & Audio",
    icon: Music,
    color: "from-red-500 to-pink-500",
  },
  {
    value: "DESIGN",
    label: "Design & Creative",
    icon: PenTool,
    color: "from-cyan-500 to-blue-500",
  },
  {
    value: "TECH",
    label: "Tech Support & IT",
    icon: Laptop,
    color: "from-slate-500 to-gray-500",
  },
  {
    value: "TRANSPORT",
    label: "Transportation & Delivery",
    icon: Truck,
    color: "from-amber-500 to-orange-500",
  },
  {
    value: "CLEANING",
    label: "Cleaning Services",
    icon: SprayCan,
    color: "from-teal-500 to-green-500",
  },
  {
    value: "EVENTS",
    label: "Event Planning",
    icon: Calendar,
    color: "from-purple-500 to-fuchsia-500",
  },
];

// Sales channel options
const salesChannels = [
  {
    value: "ONLINE_STORE",
    label: "Online Store",
    desc: "Create a customizable website",
    icon: Globe,
  },
  {
    value: "IN_PERSON_RETAIL",
    label: "Retail Store",
    desc: "Brick-and-mortar location",
    icon: Store,
  },
  {
    value: "IN_PERSON_EVENTS",
    label: "Events & Markets",
    desc: "Markets, fairs, pop-ups",
    icon: Calendar,
  },
  {
    value: "EXISTING_WEBSITE",
    label: "Existing Website",
    desc: "Add Buy Button to your site",
    icon: Globe,
  },
  {
    value: "SOCIAL_MEDIA",
    label: "Social Media",
    desc: "Facebook, Instagram, TikTok",
    icon: MessageSquare,
  },
  {
    value: "MARKETPLACES",
    label: "Online Marketplaces",
    desc: "Etsy, Amazon, Jumia",
    icon: ShoppingCart,
  },
];

// Business maturity options
const businessMaturityOptions = [
  {
    value: "NEW_IDEA",
    label: "New Business or Idea",
    desc: "Just starting out",
    icon: Sparkles,
  },
  {
    value: "NEW_REGISTERED",
    label: "Newly Registered",
    desc: "Recently established",
    icon: Award,
  },
  {
    value: "EXISTING",
    label: "Existing Business",
    desc: "Already operating",
    icon: Building2,
  },
  {
    value: "EXPANDING",
    label: "Expanding Business",
    desc: "Growing operations",
    icon: TrendingUp,
  },
];

// Platform migration options
const platformOptions = [
  {
    value: "NONE",
    label: "No Platform Yet",
    desc: "Starting fresh",
    icon: Zap,
  },
  {
    value: "SHOPIFY",
    label: "Shopify",
    desc: "Migrate from Shopify",
    icon: ShoppingBag,
  },
  {
    value: "WOOCOMMERCE",
    label: "WooCommerce",
    desc: "Migrate from WooCommerce",
    icon: Globe,
  },
  {
    value: "INSTAGRAM",
    label: "Instagram",
    desc: "Selling on Instagram",
    icon: Camera,
  },
  {
    value: "FACEBOOK",
    label: "Facebook",
    desc: "Facebook Marketplace",
    icon: MessageSquare,
  },
  { value: "JUMIA", label: "Jumia", desc: "Jumia seller", icon: ShoppingCart },
  {
    value: "WHATSAPP",
    label: "WhatsApp Business",
    desc: "Using WhatsApp for sales",
    icon: Smartphone,
  },
  {
    value: "OTHER",
    label: "Other Platform",
    desc: "Different platform",
    icon: Package,
  },
];

// Product/Service type options (for product businesses)
const productTypeOptions = [
  {
    value: "SELF_MADE",
    label: "Self-Made Products",
    desc: "Products you make or buy yourself",
    icon: Palette,
  },
  {
    value: "RESELL",
    label: "Resale Products",
    desc: "Products you buy and resell",
    icon: ShoppingCart,
  },
  {
    value: "DIGITAL",
    label: "Digital Products",
    desc: "Downloads, licenses, digital art",
    icon: Laptop,
  },
  {
    value: "DROPSHIPPING",
    label: "Dropshipping",
    desc: "Third-party fulfillment",
    icon: Truck,
  },
  {
    value: "PRINT_ON_DEMAND",
    label: "Print-on-Demand",
    desc: "Custom printed products",
    icon: Shirt,
  },
  {
    value: "SUBSCRIPTION",
    label: "Subscription Box",
    desc: "Recurring product deliveries",
    icon: Package,
  },
  {
    value: "DECIDE_LATER",
    label: "I'll Decide Later",
    desc: "Not sure yet",
    icon: Clock,
  },
];

// Service type options (for service businesses)
const serviceOfferingOptions = [
  {
    value: "ONE_TIME",
    label: "One-Time Services",
    desc: "Single session services",
    icon: CheckCircle,
  },
  {
    value: "PACKAGE",
    label: "Service Packages",
    desc: "Bundled service offerings",
    icon: Package,
  },
  {
    value: "SUBSCRIPTION",
    label: "Subscription Services",
    desc: "Recurring service plans",
    icon: Calendar,
  },
  {
    value: "CUSTOM_QUOTE",
    label: "Custom Quotes",
    desc: "Project-based pricing",
    icon: DollarSign,
  },
  {
    value: "HOURLY",
    label: "Hourly Rate",
    desc: "Time-based billing",
    icon: Clock,
  },
  {
    value: "DECIDE_LATER",
    label: "I'll Decide Later",
    desc: "Not sure yet",
    icon: Clock,
  },
];

// Revenue range options
const revenueRanges = [
  {
    value: "PRE_REVENUE",
    label: "Pre-Revenue",
    desc: "Not generating revenue yet",
    icon: TrendingUp,
  },
  {
    value: "UNDER_1M",
    label: "Under 1M RWF",
    desc: "Less than 1 million RWF/year",
    icon: DollarSign,
  },
  {
    value: "1M_5M",
    label: "1M - 5M RWF",
    desc: "1 to 5 million RWF/year",
    icon: DollarSign,
  },
  {
    value: "5M_20M",
    label: "5M - 20M RWF",
    desc: "5 to 20 million RWF/year",
    icon: DollarSign,
  },
  {
    value: "20M_50M",
    label: "20M - 50M RWF",
    desc: "20 to 50 million RWF/year",
    icon: DollarSign,
  },
  {
    value: "50M_100M",
    label: "50M - 100M RWF",
    desc: "50 to 100 million RWF/year",
    icon: DollarSign,
  },
  {
    value: "OVER_100M",
    label: "Over 100M RWF",
    desc: "More than 100 million RWF/year",
    icon: DollarSign,
  },
];

// Employee count options
const employeeCountOptions = [
  { value: "SOLO", label: "Just Me", desc: "Solo entrepreneur", icon: Users },
  { value: "1_5", label: "1-5 Employees", desc: "Small team", icon: Users },
  { value: "6_10", label: "6-10 Employees", desc: "Growing team", icon: Users },
  {
    value: "11_25",
    label: "11-25 Employees",
    desc: "Medium team",
    icon: Users,
  },
  {
    value: "26_50",
    label: "26-50 Employees",
    desc: "Established team",
    icon: Users,
  },
  {
    value: "50_PLUS",
    label: "50+ Employees",
    desc: "Large organization",
    icon: Users,
  },
];

// Expected growth options
const growthExpectations = [
  {
    value: "STABLE",
    label: "Maintain Current Size",
    desc: "Happy with current scale",
    icon: TrendingUp,
  },
  {
    value: "MODERATE",
    label: "Moderate Growth",
    desc: "25-50% growth expected",
    icon: TrendingUp,
  },
  {
    value: "AGGRESSIVE",
    label: "Aggressive Growth",
    desc: "50-100%+ growth expected",
    icon: TrendingUp,
  },
  {
    value: "EXPAND_REGIONALLY",
    label: "Regional Expansion",
    desc: "Expand across East Africa",
    icon: Globe,
  },
  {
    value: "FRANCHISE",
    label: "Franchise Model",
    desc: "Plan to franchise",
    icon: Building2,
  },
];

// Payment method preferences
const paymentMethodOptions = [
  {
    value: "MOBILE_MONEY",
    label: "Mobile Money",
    desc: "M-Pesa, MTN, Airtel, Orange",
    icon: Smartphone,
  },
  {
    value: "CASH",
    label: "Cash Payments",
    desc: "Physical cash transactions",
    icon: DollarSign,
  },
  {
    value: "CARD",
    label: "Credit/Debit Cards",
    desc: "Visa, Mastercard",
    icon: CreditCard,
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    desc: "Direct bank payments",
    icon: Building2,
  },
  {
    value: "PAYPAL",
    label: "PayPal",
    desc: "International payments",
    icon: Globe,
  },
  {
    value: "CRYPTO",
    label: "Cryptocurrency",
    desc: "Bitcoin, USDT, etc.",
    icon: Zap,
  },
];

// Step schema
const schema = z.object({
  name: z.string().min(2, "Business name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  businessType: z.string().optional(),
  serviceType: z.string().optional(),
  isB2BEnabled: z.boolean().optional(),
  hasAgreedToTerms: z.boolean(),
  preferences: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

// Helper to get steps based on business type
const getStepsForBusinessType = (
  businessType: string | undefined,
  isService: boolean,
) => {
  const isFreelance = businessType === "SERVICE_FREELANCE";

  if (isFreelance || isService) {
    return [
      { number: 1, title: "Service Type", icon: Briefcase },
      { number: 2, title: "Sales Channels", icon: Globe },
      { number: 3, title: "Business Stage", icon: TrendingUp },
      { number: 4, title: "Current Platform", icon: Laptop },
      { number: 5, title: "Service Offerings", icon: Package },
      { number: 6, title: "Revenue & Team", icon: Users },
      { number: 7, title: "Growth Plans", icon: TrendingUp },
      { number: 8, title: "Payments", icon: CreditCard },
      { number: 9, title: "Business Info", icon: Building2 },
      { number: 10, title: "Review", icon: CheckCircle },
    ];
  }

  // Product-based business steps
  return [
    { number: 1, title: "Business Type", icon: Store },
    { number: 2, title: "Sales Channels", icon: Globe },
    { number: 3, title: "Business Stage", icon: TrendingUp },
    { number: 4, title: "Current Platform", icon: Laptop },
    { number: 5, title: "Product Types", icon: Package },
    { number: 6, title: "Revenue & Team", icon: Users },
    { number: 7, title: "Growth Plans", icon: TrendingUp },
    { number: 8, title: "Payments", icon: CreditCard },
    { number: 9, title: "Business Info", icon: Building2 },
    { number: 10, title: "Review", icon: CheckCircle },
  ];
};

export default function BusinessCreatePageV2() {
  const router = useRouter();
  const { showToast } = useToast();
  const { loading, user, role } = useMe();
  const [updateBusiness, { loading: saving }] = useMutation(UPDATE_BUSINESS);

  const meBusiness = useMemo(() => {
    if (role === "business" && user) return user as BusinessEntity;
    return null;
  }, [role, user]);

  // State management
  const [step, setStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState<
    string | undefined
  >(meBusiness?.businessType || undefined);
  const [isServiceMode, setIsServiceMode] = useState(false);

  // Determine if we're in service mode
  const isFreelance = selectedBusinessType === "SERVICE_FREELANCE";

  // Get dynamic steps based on selection
  const steps = useMemo(
    () => getStepsForBusinessType(selectedBusinessType, isServiceMode),
    [selectedBusinessType, isServiceMode],
  );

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: meBusiness?.name || "",
      phone: meBusiness?.phone || "",
      address: meBusiness?.address || "",
      website: meBusiness?.website || "",
      businessType: meBusiness?.businessType || "",
      isB2BEnabled: (meBusiness as any)?.isB2BEnabled ?? false,
      hasAgreedToTerms: (meBusiness as any)?.hasAgreedToTerms ?? false,
      preferences: (meBusiness as any)?.preferences || {},
    },
    values: meBusiness
      ? {
          name: meBusiness.name || "",
          phone: meBusiness.phone || "",
          address: meBusiness.address || "",
          website: meBusiness?.website || "",
          businessType: meBusiness?.businessType || "",
          isB2BEnabled: (meBusiness as any)?.isB2BEnabled ?? false,
          hasAgreedToTerms: (meBusiness as any)?.hasAgreedToTerms ?? false,
          preferences: (meBusiness as any)?.preferences || {},
        }
      : undefined,
  });

  const { control, handleSubmit, watch, setValue } = form;
  const preferences = watch("preferences") || {};

  // Guard: only business users
  if (!loading && role !== "business") {
    router.replace("/unauthorized");
    return null;
  }

  const handleNext = () => setStep((s) => Math.min(steps.length, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const updatePreferences = (key: string, value: any) => {
    setValue("preferences", { ...preferences, [key]: value });
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!meBusiness) throw new Error("Not authenticated as business");

      await updateBusiness({
        variables: {
          id: meBusiness.id,
          input: {
            name: data.name,
            phone: data.phone,
            address: data.address,
            website: data.website || null,
            businessType: data.businessType || null,
            isB2BEnabled: data.isB2BEnabled ?? false,
            hasAgreedToTerms: !!data.hasAgreedToTerms,
            preferences: data.preferences ?? {},
            kycStatus: meBusiness.kycStatus || "PENDING",
          },
        },
      });

      showToast(
        "success",
        "Saved",
        "Business profile updated successfully",
        true,
        6000,
        "bottom-right",
      );
      router.push("/business/dashboard");
    } catch (err: any) {
      showToast(
        "error",
        "Failed",
        err.message || "Failed to save",
        true,
        8000,
        "bottom-right",
      );
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    // Step 1: Business Type Selection
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              What type of business are you?
            </h3>
            <p className="text-gray-400">
              This helps us customize your experience
            </p>
          </div>

          {/* Toggle between Product and Service */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => {
                setIsServiceMode(false);
                setSelectedBusinessType(undefined);
              }}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                !isServiceMode
                  ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
              }`}
            >
              <Store
                className={`h-8 w-8 mx-auto mb-3 ${!isServiceMode ? "text-primary" : "text-gray-400"}`}
              />
              <h4
                className={`font-semibold ${!isServiceMode ? "text-white" : "text-gray-300"}`}
              >
                Sell Products
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Physical or digital goods
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsServiceMode(true);
                setSelectedBusinessType("SERVICE_FREELANCE");
              }}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                isServiceMode
                  ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
              }`}
            >
              <Briefcase
                className={`h-8 w-8 mx-auto mb-3 ${isServiceMode ? "text-primary" : "text-gray-400"}`}
              />
              <h4
                className={`font-semibold ${isServiceMode ? "text-white" : "text-gray-300"}`}
              >
                Offer Services
              </h4>
              <p className="text-xs text-gray-500 mt-1">Skills and expertise</p>
            </button>
          </div>

          {/* Business Type Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(isServiceMode ? serviceTypes : businessTypes).map((type) => {
              const Icon = type.icon;
              const isSelected = selectedBusinessType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedBusinessType(type.value)}
                  className={`group p-4 rounded-xl border transition-all duration-300 text-left ${
                    isSelected
                      ? `bg-gradient-to-br ${type.color} border-transparent shadow-lg`
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 mb-2 ${isSelected ? "text-white" : "text-gray-400 group-hover:text-primary"}`}
                  />
                  <h4
                    className={`font-medium text-sm ${isSelected ? "text-white" : "text-gray-300"}`}
                  >
                    {type.label}
                  </h4>
                </button>
              );
            })}
          </div>

          <FormField
            control={control}
            name="businessType"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <input
                    {...field}
                    value={selectedBusinessType || ""}
                    onChange={() => {}}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      );
    }

    // Step 2: Sales Channels
    if (step === 2) {
      const selectedChannels = (preferences.salesChannels as string[]) || [];
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Where will you sell?
            </h3>
            <p className="text-gray-400">Select all that apply</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {salesChannels.map((channel) => {
              const Icon = channel.icon;
              const isSelected = selectedChannels.includes(channel.value);
              return (
                <button
                  key={channel.value}
                  type="button"
                  onClick={() => {
                    const newChannels = isSelected
                      ? selectedChannels.filter((c) => c !== channel.value)
                      : [...selectedChannels, channel.value];
                    updatePreferences("salesChannels", newChannels);
                  }}
                  className={`group p-4 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 ${
                    isSelected
                      ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-white/5"}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? "text-primary" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold text-sm ${isSelected ? "text-white" : "text-gray-300"}`}
                    >
                      {channel.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{channel.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Step 3: Business Maturity
    if (step === 3) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Is this a new or existing business?
            </h3>
            <p className="text-gray-400">
              This helps us suggest the right onboarding
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {businessMaturityOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = preferences.businessMaturity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updatePreferences("businessMaturity", option.value)
                  }
                  className={`group p-4 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 ${
                    isSelected
                      ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-white/5"}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? "text-primary" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${isSelected ? "text-white" : "text-gray-300"}`}
                    >
                      {option.label}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Step 4: Current Platform
    if (step === 4) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Do you currently sell on other platforms?
            </h3>
            <p className="text-gray-400">We make it easy to migrate to USCOR</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {platformOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = preferences.currentPlatform === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updatePreferences("currentPlatform", option.value)
                  }
                  className={`group p-4 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 ${
                    isSelected
                      ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-white/5"}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? "text-primary" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold text-sm ${isSelected ? "text-white" : "text-gray-300"}`}
                    >
                      {option.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Step 5: Product/Service Types
    if (step === 5) {
      const options = isFreelance ? serviceOfferingOptions : productTypeOptions;
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              What do you plan to {isFreelance ? "offer" : "sell"}?
            </h3>
            <p className="text-gray-400">
              We'll get you the right features and tools
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected =
                preferences.productOrServiceType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updatePreferences("productOrServiceType", option.value)
                  }
                  className={`group p-4 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 ${
                    isSelected
                      ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-white/5"}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? "text-primary" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold text-sm ${isSelected ? "text-white" : "text-gray-300"}`}
                    >
                      {option.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Step 6: Revenue & Team
    if (step === 6) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Tell us about your business size
            </h3>
            <p className="text-gray-400">This helps us understand your needs</p>
          </div>

          {/* Revenue Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              Annual Revenue (RWF)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {revenueRanges.map((option) => {
                const isSelected = preferences.revenueRange === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updatePreferences("revenueRange", option.value)
                    }
                    className={`p-3 rounded-lg border text-left transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-300"}`}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employee Count */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              Number of Employees
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {employeeCountOptions.map((option) => {
                const isSelected = preferences.employeeCount === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      updatePreferences("employeeCount", option.value)
                    }
                    className={`p-3 rounded-lg border text-center transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Users
                      className={`h-5 w-5 mx-auto mb-1 ${isSelected ? "text-primary" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-xs font-medium ${isSelected ? "text-white" : "text-gray-300"}`}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Step 7: Growth Expectations
    if (step === 7) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              What are your growth plans?
            </h3>
            <p className="text-gray-400">
              Your ambitions for the next 12 months
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {growthExpectations.map((option) => {
              const Icon = option.icon;
              const isSelected = preferences.growthExpectation === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    updatePreferences("growthExpectation", option.value)
                  }
                  className={`group p-4 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 ${
                    isSelected
                      ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-white/5"}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? "text-primary" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${isSelected ? "text-white" : "text-gray-300"}`}
                    >
                      {option.label}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Step 8: Payment Methods
    if (step === 8) {
      const selectedPayments = (preferences.paymentMethods as string[]) || [];
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Which payment methods will you accept?
            </h3>
            <p className="text-gray-400">
              Especially important for East African markets
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentMethodOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedPayments.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const newPayments = isSelected
                      ? selectedPayments.filter((p) => p !== option.value)
                      : [...selectedPayments, option.value];
                    updatePreferences("paymentMethods", newPayments);
                  }}
                  className={`group p-4 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 ${
                    isSelected
                      ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/10"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${isSelected ? "bg-primary/20" : "bg-white/5"}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? "text-primary" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold text-sm ${isSelected ? "text-white" : "text-gray-300"}`}
                    >
                      {option.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Money Highlight */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Mobile Money Integration
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  USCOR seamlessly integrates with M-Pesa, MTN Mobile Money,
                  Airtel Money, and Orange Money for easy payments across East
                  Africa.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 9: Business Information
    if (step === 9) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Business Details
            </h3>
            <p className="text-gray-400">Let's get your business set up</p>
          </div>

          <div className="space-y-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 font-medium">
                    Business Name *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        {...field}
                        placeholder="Enter your business name"
                        className="w-full pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 font-medium">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        {...field}
                        placeholder="+250 7XX XXX XXX"
                        className="w-full pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 font-medium">
                    Business Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        {...field}
                        placeholder="Street, City, Country"
                        className="w-full pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 font-medium">
                    Website (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        {...field}
                        placeholder="https://yourbusiness.com"
                        className="w-full pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* B2B Toggle */}
            <FormField
              control={control}
              name="isB2BEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <FormLabel className="text-gray-300 font-medium">
                        Enable B2B Features
                      </FormLabel>
                      <p className="text-xs text-gray-500">
                        Trade with other verified businesses
                      </p>
                    </div>
                  </div>
                  <FormControl>
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                        field.value ? "bg-primary" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                          field.value ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      );
    }

    // Step 10: Review
    if (step === 10) {
      const selectedType = isFreelance
        ? serviceTypes.find((t) => t.value === preferences.serviceType)
        : businessTypes.find((t) => t.value === selectedBusinessType);

      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Almost Done!</h3>
            <p className="text-gray-400">
              Review your information before finishing
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              {selectedType && (
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${selectedType.color}`}
                >
                  <selectedType.icon className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-white">
                  {watch("name") || "Business Name"}
                </h4>
                <p className="text-sm text-gray-400">
                  {selectedType?.label || "Business Type"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <ReviewRow label="Email" value={user?.email || "N/A"} />
              <ReviewRow
                label="Phone"
                value={watch("phone") || "Not provided"}
              />
              <ReviewRow
                label="Address"
                value={watch("address") || "Not provided"}
              />
              <ReviewRow
                label="Website"
                value={watch("website") || "Not provided"}
              />
              <ReviewRow
                label="Sales Channels"
                value={
                  ((preferences.salesChannels as string[]) || []).length > 0
                    ? `${((preferences.salesChannels as string[]) || []).length} selected`
                    : "Not specified"
                }
              />
              <ReviewRow
                label="Business Stage"
                value={preferences.businessMaturity || "Not specified"}
              />
              <ReviewRow
                label="Revenue Range"
                value={preferences.revenueRange || "Not specified"}
              />
              <ReviewRow
                label="Team Size"
                value={preferences.employeeCount || "Not specified"}
              />
              <ReviewRow
                label="Payment Methods"
                value={
                  ((preferences.paymentMethods as string[]) || []).length > 0
                    ? `${((preferences.paymentMethods as string[]) || []).length} selected`
                    : "Not specified"
                }
              />
              <ReviewRow
                label="B2B Enabled"
                value={watch("isB2BEnabled") ? "Yes" : "No"}
                highlight={watch("isB2BEnabled")}
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <FormField
            control={control}
            name="hasAgreedToTerms"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <FormControl>
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`flex-shrink-0 w-5 h-5 rounded border transition-all duration-300 ${
                      field.value
                        ? "bg-primary border-primary"
                        : "bg-transparent border-white/30"
                    }`}
                  >
                    {field.value && (
                      <CheckCircle className="h-5 w-5 text-white" />
                    )}
                  </button>
                </FormControl>
                <div className="flex-1">
                  <FormLabel className="text-gray-300 text-sm font-medium">
                    I agree to the USCOR Terms of Service and Privacy Policy
                  </FormLabel>
                  <p className="text-xs text-gray-500 mt-1">
                    By continuing, you agree to our terms and conditions for
                    using the platform.
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>
      );
    }

    return null;
  };

  // Review row component
  const ReviewRow = ({
    label,
    value,
    highlight,
  }: {
    label: string;
    value: string;
    highlight?: boolean;
  }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-gray-400 text-sm">{label}</span>
      <span
        className={`text-sm font-medium ${highlight ? "text-primary" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-tl from-accent/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative flex min-h-screen">
        {/* Left Panel - Branding (Hidden on mobile, visible on lg+) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 border-r border-white/5">
          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
                <span className="text-3xl font-bold text-white">U</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  USCOR
                </span>
                <p className="text-xs text-gray-500">
                  East Africa's Business Platform
                </p>
              </div>
            </div>

            {/* Hero content */}
            <div className="mt-16 space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Build Your Business
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent">
                  With Confidence
                </span>
              </h1>
              <p className="text-lg text-gray-400 max-w-md leading-relaxed">
                Join thousands of SMEs across East Africa. From Kigali to
                Nairobi, manage operations, accept mobile money, and grow your
                customer base.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {[
                  {
                    icon: Smartphone,
                    title: "Mobile Money",
                    desc: "M-Pesa, MTN, Airtel, Orange",
                  },
                  {
                    icon: Zap,
                    title: "Offline POS",
                    desc: "Work without internet",
                  },
                  {
                    icon: Globe,
                    title: "E-commerce",
                    desc: "Online marketplace",
                  },
                  { icon: Shield, title: "Verified", desc: "KYC protection" },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <feature.icon className="text-primary mb-2 h-6 w-6" />
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
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-gray-900 flex items-center justify-center text-xs text-white font-medium"
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
                  Across Rwanda, Kenya, Uganda & Tanzania
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Setup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative overflow-y-auto">
          {/* Mobile decorative elements */}
          <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

          <div className="w-full max-w-2xl relative z-10">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-2xl font-bold text-white">U</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                USCOR
              </span>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.number}
                      className="flex items-center flex-shrink-0"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-300 ${
                            step >= s.number
                              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25"
                              : "bg-white/5 text-gray-500 border border-white/10"
                          }`}
                        >
                          {step > s.number ? (
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs mt-1 hidden md:block whitespace-nowrap ${
                            step >= s.number ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
                            step > s.number
                              ? "bg-gradient-to-r from-primary to-accent"
                              : "bg-white/10"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">
                  Step {step} of {steps.length}
                </span>
                <span className="text-sm text-gray-400">
                  {Math.round((step / steps.length) * 100)}% complete
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-white/5 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(step / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
                {step === 1 && "Choose Your Business Type"}
                {step === 2 && "Sales Channels"}
                {step === 3 && "Business Stage"}
                {step === 4 && "Current Platforms"}
                {step === 5 &&
                  (isFreelance ? "Service Offerings" : "Product Types")}
                {step === 6 && "Revenue & Team"}
                {step === 7 && "Growth Plans"}
                {step === 8 && "Payment Methods"}
                {step === 9 && "Business Details"}
                {step === 10 && "Review & Complete"}
              </h2>
              <p className="text-gray-400 text-sm">
                {step === 1 && "Select what best describes your business"}
                {step === 2 && "Where will you reach your customers?"}
                {step === 3 && "Tell us about your business journey"}
                {step === 4 && "Are you already selling elsewhere?"}
                {step === 5 &&
                  (isFreelance
                    ? "How will you structure your services?"
                    : "What kind of products will you sell?")}
                {step === 6 && "Help us understand your business size"}
                {step === 7 && "What are your ambitions?"}
                {step === 8 && "Choose payment options for your customers"}
                {step === 9 && "Enter your business information"}
                {step === 10 && "Verify everything looks correct"}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step Content */}
                <div className="min-h-[400px]">{renderStepContent()}</div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-6 border-t border-white/10">
                  <GlowButton
                    type="button"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </GlowButton>
                  {step < steps.length ? (
                    <GlowButton
                      type="button"
                      onClick={handleNext}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </GlowButton>
                  ) : (
                    <GlowButton
                      type="submit"
                      disabled={saving || !watch("hasAgreedToTerms")}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" /> Complete Setup
                        </>
                      )}
                    </GlowButton>
                  )}
                </div>
              </form>
            </Form>

            {/* Footer */}
            <div className="text-center mt-8 space-y-4">
              <p className="text-gray-400 text-sm">
                Need help?{" "}
                <a
                  href="/support"
                  className="font-semibold text-primary hover:text-accent transition-colors underline underline-offset-4"
                >
                  Contact Support
                </a>
              </p>
            </div>

            {/* Copyright */}
            <div className="mt-12 text-center">
              <p className="text-xs text-gray-600">
                © 2024 USCOR. Empowering East African Businesses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
