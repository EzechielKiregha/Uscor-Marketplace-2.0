"use client";

import FormFieldWrapper from "@/components/FormFieldWrapper";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GET_BUSINESS_BY_ID } from "@/graphql/business.gql";
import { UPDATE_BUSINESS_PROFILE } from "@/graphql/settings.gql";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useMe } from "@/lib/useMe";
import { businessProfileSchema } from "@/lib/validators/form-schemas";
import { useMutation, useQuery } from "@apollo/client";
import { put } from "@vercel/blob";
import {
    Beer,
    BookOpen,
    Camera,
    CheckCircle,
    Coffee,
    Hammer,
    Image as ImageIcon,
    Laptop,
    Loader2,
    Mail,
    MapPin,
    Palette,
    Phone,
    Shirt,
    ShoppingCart,
    Store,
    User,
    Utensils,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

// Business types with icons
export const businessTypes = [
  {
    isActive: true,
    value: "ELECTRONICS",
    label: "Electronics & Gadgets",
    icon: Laptop,
    color: "from-cyan-500 to-blue-500",
  },
  {
    isActive: true,
    value: "HARDWARE",
    label: "Hardware & Tools",
    icon: Hammer,
    color: "from-orange-500 to-amber-500",
  },
  {
    isActive: true,
    value: "CLOTHING",
    label: "Clothing & Accessories",
    icon: Shirt,
    color: "from-fuchsia-500 to-purple-500",
  },
  {
    isActive: false,
    value: "ARTISAN",
    label: "Artisan & Handcrafted Goods",
    icon: Palette,
    color: "from-pink-500 to-rose-500",
  },
  {
    isActive: false,
    value: "BOOKSTORE",
    label: "Bookstore & Stationery",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-500",
  },
  {
    isActive: false,
    value: "GROCERY",
    label: "Grocery & Convenience",
    icon: ShoppingCart,
    color: "from-green-500 to-emerald-500",
  },
  {
    isActive: false,
    value: "CAFE",
    label: "Cafe & Coffee Shops",
    icon: Coffee,
    color: "from-amber-600 to-orange-600",
  },
  {
    isActive: false,
    value: "RESTAURANT",
    label: "Restaurant & Dining",
    icon: Utensils,
    color: "from-red-500 to-rose-500",
  },
  {
    isActive: false,
    value: "RETAIL",
    label: "Retail & General Stores",
    icon: Store,
    color: "from-purple-500 to-pink-500",
  },
  {
    isActive: false,
    value: "BAR",
    label: "Bar & Pub",
    icon: Beer,
    color: "from-yellow-500 to-amber-500",
  },
];

// Map business types to contextual benefits & tips
const businessBenefitsMap: Record<
  string,
  { title: string; items: string[]; tip?: string }
> = {
  ARTISAN: {
    title: "Benefits for Artisans & Handcrafted Goods",
    items: [
      "Showcase custom work with dedicated service pages",
      "Book consultations and custom orders easily",
      "Manage bespoke requests and timelines per order",
      "Upsell materials or maintenance services to customers",
    ],
    tip: "Use Uscor to create service templates for recurring custom jobs and track progress per order.",
  },
  BOOKSTORE: {
    title: "Benefits for Bookstores & Stationery",
    items: [
      "Offer book-binding, gift-wrap and special order services",
      "Schedule author signing or workshop slots",
      "Bundle physical products with service add-ons",
      "Easily set fixed or hourly rates for workshops",
    ],
    tip: "Promote workshops and pre-orders through service listing to drive foot traffic.",
  },
  ELECTRONICS: {
    title: "Benefits for Electronics & Gadgets",
    items: [
      "List repair, diagnostics and upgrade services",
      "Track device intake and return dates per order",
      "Define parts and labor pricing separately",
      "Send automated status updates to customers",
    ],
    tip: "Use Uscor's order notes and status updates to build trust around repair timelines.",
  },
  HARDWARE: {
    title: "Benefits for Hardware & Tools",
    items: [
      "Offer tool rentals, on-site installation, and repair services",
      "Manage inventory-linked service availability",
      "Set hourly or project rates for installations",
      "Coordinate technicians and on-site visits",
    ],
    tip: "Configure availability windows and worker assignments for smoother scheduling.",
  },
  GROCERY: {
    title: "Benefits for Grocery & Convenience",
    items: [
      "Provide delivery and grocery-picking services",
      "Create subscription or recurring order services",
      "Add special handling or packaging fees",
      "Handle same-day delivery windows and cutoffs",
    ],
    tip: "Use service-based pricing to offer premium delivery slots and increase order value.",
  },
  CAFE: {
    title: "Benefits for Café & Coffee Shops",
    items: [
      "Offer catering, coffee subscription and event services",
      "Take advance orders for pickup and large orders",
      "Manage time-sloted pickups to reduce congestion",
      "Upsell packages for meetings and events",
    ],
    tip: "Use Uscor to accept advance group orders and manage pickup time windows.",
  },
  RESTAURANT: {
    title: "Benefits for Restaurant & Dining",
    items: [
      "Accept catering and private dining bookings",
      "Manage booking deposits and pre-orders",
      "Coordinate kitchen prep and staffing per booking",
      "Track special requests and dietary notes",
    ],
    tip: "Leverage service bookings to smooth kitchen load and capture higher-value orders.",
  },
  RETAIL: {
    title: "Benefits for Retail & General Stores",
    items: [
      "Offer installation, assembly or personalization services",
      "Sell product+service bundles",
      "Schedule in-store appointments for fittings or demos",
      "Track service warranties and follow-up tasks",
    ],
    tip: "Combine product SKUs with services to increase average order value.",
  },
  BAR: {
    title: "Benefits for Bars & Pubs",
    items: [
      "Manage private event bookings and drink packages",
      "Offer on-site bartending or service add-ons",
      "Collect deposits and manage guest lists",
      "Coordinate staff assignments for events",
    ],
    tip: "Use Uscor to streamline event bookings and staff scheduling for private parties.",
  },
  CLOTHING: {
    title: "Benefits for Clothing & Accessories",
    items: [
      "Offer alterations, custom tailoring and styling sessions",
      "Schedule fittings and appointment slots",
      "Bundle styling sessions with product purchases",
      "Manage turnaround times and priority jobs",
    ],
    tip: "Enable appointment-based services to deliver high-touch curated experiences.",
  },
};

// type ProfileSettingsProps = {};

export default function ProfileSettings() {
  const { user, loading: authLoading } = useMe();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [updateProfile] = useMutation(UPDATE_BUSINESS_PROFILE);
  const { data: businessData, refetch: refetchBusiness } = useQuery(
    GET_BUSINESS_BY_ID,
    {
      variables: { id: user?.id },
      skip: !user,
    },
  );
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    values: formData,
    handleChange: handleInputChange,
    handleBlur,
    getFieldProps,
    getFieldError,
    setValues: setFormData,
    validateAll,
  } = useFormValidation({
    schema: businessProfileSchema,
    initialValues: {
      name: "",
      email: "",
      description: "",
      address: "",
      phone: "",
      country: "",
      businessType: "",
      avatar: "",
      coverImage: "",
    },
    onSubmit: () => {}, // handled by handleSubmit below
  });

  useEffect(() => {
    if (businessData) {
      setFormData({
        name: businessData.business.name,
        email: businessData.business.email,
        description: businessData.business.description || "",
        address: businessData.business.address || "",
        phone: businessData.business.phone || "",
        country: businessData.business.country || "RWANDA",
        businessType: businessData.business.businessType || "ELECTRONICS",
        avatar: businessData.business.avatar || "",
        coverImage: businessData.business.coverImage || "",
      });
    }
  }, [businessData, setFormData]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(e as any);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "coverImage",
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (type === "avatar") {
        setAvatarFile(file);
      } else {
        setCoverImageFile(file);
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [type]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      // Handle image uploads if any
      let blob_avatar: any = {
        url: "",
        pathname: "",
        size: 0,
        type: "IMAGE",
      };
      let blob_coverImage: any = {
        url: "",
        pathname: "",
        size: 0,
        type: "IMAGE",
      };
      const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
      if (avatarFile) {
        if (!blobToken && avatarFile instanceof File) {
          throw new Error(
            "Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.",
          );
        }
        if (avatarFile instanceof File) {
          blob_avatar = await put(
            `business/medias/${Date.now()}-${avatarFile}`,
            avatarFile,
            {
              access: "public",
              token: blobToken,
            },
          );
        }
      }
      if (coverImageFile) {
        if (!blobToken && coverImageFile instanceof File) {
          throw new Error(
            "Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.",
          );
        }
        if (coverImageFile instanceof File) {
          blob_coverImage = await put(
            `business/medias/${Date.now()}-${coverImageFile}`,
            coverImageFile,
            {
              access: "public",
              token: blobToken,
            },
          );
        }
      }

      await updateProfile({
        variables: {
          id: user?.id,
          input: {
            name: formData.name,
            email: formData.email,
            description: formData.description,
            address: formData.address,
            phone: formData.phone,
            country: formData.country,
            businessType: formData.businessType,
            avatar:
              avatarFile instanceof File
                ? blob_avatar.url
                : businessData.business.avatar,
            coverImage:
              coverImageFile instanceof File
                ? blob_coverImage.url
                : businessData.business.coverImage,
          },
        },
      });

      showToast("success", "Success", "Profile updated successfully");
    } catch (_error) {
      showToast("error", "Error", "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading)
    return (
      <Card className="border hover:border-primary  bg-card">
        <CardContent className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );

  const benefits =
    businessBenefitsMap[
      formData.businessType as keyof typeof businessBenefitsMap
    ] || businessBenefitsMap.ARTISAN;

  return (
    <Card className="border hover:border-primary  bg-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your business information and appearance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Preview</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Images */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Profile Images</h3>
              <p className="text-sm text-muted-foreground mb-3">
                These images will be visible to customers and other businesses
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Business Logo
                  </label>
                  <div className="relative w-24 h-24">
                    {formData.avatar ? (
                      <Image
                        src={formData.avatar}
                        alt="Business logo"
                        className="w-full h-full object-cover rounded-lg"
                        width={200}
                        height={200}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-accent">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "avatar")}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Square image recommended (200x200px)
                  </p>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Cover Image
                  </label>
                  <div className="relative w-full h-24">
                    {formData.coverImage ? (
                      <Image
                        src={formData.coverImage}
                        alt="Cover image"
                        className="w-full h-full object-cover rounded-lg"
                        width={1200}
                        height={400}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-accent">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "coverImage")}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wide image recommended (1200x400px)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Business Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper
                label="Business Name"
                htmlFor="name"
                icon={User}
                error={getFieldError("name")}
                required
              >
                <Input
                  id="name"
                  {...getFieldProps("name")}
                  onBlur={handleBlur}
                  placeholder="Your business name"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Business Email"
                htmlFor="email"
                icon={Mail}
                error={getFieldError("email")}
                required
              >
                <Input
                  id="email"
                  type="email"
                  {...getFieldProps("email")}
                  onBlur={handleBlur}
                  placeholder="contact@yourbusiness.com"
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper
              label="Business Description"
              htmlFor="description"
              helperText="Tell customers about your business, what you offer, and why they should choose you"
            >
              <Textarea
                id="description"
                {...getFieldProps("description")}
                onBlur={handleBlur}
                placeholder="Tell customers about your business, what you offer, and why they should choose you..."
                rows={4}
              />
            </FormFieldWrapper>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWrapper
                label="Business Address"
                htmlFor="address"
                icon={MapPin}
                error={getFieldError("address")}
              >
                <Input
                  id="address"
                  {...getFieldProps("address")}
                  onBlur={handleBlur}
                  placeholder="123 Main Street, City, Country"
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Phone Number"
                htmlFor="phone"
                icon={Phone}
                error={getFieldError("phone")}
              >
                <Input
                  id="phone"
                  {...getFieldProps("phone")}
                  onBlur={handleBlur}
                  placeholder="+250 788 123 456"
                />
              </FormFieldWrapper>
            </div>

            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleSelectChange}
              className="w-full p-2 border hover:border-primary  rounded-md"
            >
              <option value="RWANDA">Rwanda</option>
              <option value="UGANDA">Uganda</option>
              <option value="KENYA">Kenya</option>
              <option value="TANZANIA">Tanzania</option>
              <option value="DRC">Democratic Republic of Congo</option>
              <option value="BURUNDI">Burundi</option>
            </select>
            <p className="mt-1 text-sm text-muted-foreground">
              Your business location determines payment methods and regulations
            </p>
          </div>

          {/* Business Type Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Business Type</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Select your business type to customize your experience
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.businessType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      disabled={!type.isActive}
                      onClick={() => {
                        if (type.isActive)
                          setFormData((prev) => ({
                            ...prev,
                            businessType: type.value,
                          }));
                      }}
                      className={`relative group p-4 rounded-xl border transition-all duration-300 text-left ${
                        isSelected
                          ? `border-primary bg-primary/5`
                          : !type.isActive
                            ? "opacity-50 cursor-not-allowed bg-muted/50 dark:bg-white/3 border-border/50"
                            : "bg-card/50 dark:bg-white/5 border-border dark:border-white/10 hover:bg-card dark:hover:bg-white/10 hover:border-primary/30"
                      }`}
                    >
                      {!type.isActive && (
                        <StatusBadge text="Coming Soon" variant="coming-soon" />
                      )}
                      <Icon
                        className={`h-6 w-6 mb-2 ${isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-primary"}`}
                      />
                      <h4
                        className={`font-medium text-sm ${isSelected ? "text-foreground" : "text-foreground"}`}
                      >
                        {type.label}
                      </h4>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Business Type Benefits */}
          <div className="border hover:border-primary  rounded-lg p-4 bg-muted">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              {benefits.title}
            </h3>

            <ul className="space-y-2">
              {benefits.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {benefits.tip && (
              <div className="mt-4 p-3 bg-background rounded-lg border hover:border-primary ">
                <p className="text-sm">
                  <strong>Pro Tip:</strong> {benefits.tip}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                setFormData({
                  name: businessData?.business.name || "",
                  email: businessData?.business.email || "",
                  description: businessData?.business.description || "",
                  address: businessData?.business.address || "",
                  phone: businessData?.business.phone || "",
                  country: businessData?.business.country || "RWANDA",
                  businessType:
                    businessData?.business.businessType || "ARTISAN",
                  avatar: businessData?.business.avatar || "",
                  coverImage: businessData?.business.coverImage || "",
                });
                setAvatarFile(null);
                setCoverImageFile(null);
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-accent text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
