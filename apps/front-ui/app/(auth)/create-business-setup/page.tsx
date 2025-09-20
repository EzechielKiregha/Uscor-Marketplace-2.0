"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { UPDATE_BUSINESS } from "@/graphql/business.gql";
import { useMe } from "@/lib/useMe";
import { BusinessEntity } from "@/lib/types";
import { useToast } from "@/components/toast-provider";
import { z } from "zod";

// Minimal UI bits reused from existing components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GlowButton } from "@/components/seraui/GlowButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Step schema
const schema = z.object({
  name: z.string().min(2, "Business name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  businessType: z.string().optional(),
  isB2BEnabled: z.boolean().optional(),
  hasAgreedToTerms: z.boolean(),
  preferences: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BusinessCreatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { loading, user, role } = useMe();
  const [step, setStep] = useState(1);
  const [updateBusiness, { loading: saving }] = useMutation(UPDATE_BUSINESS);

  const meBusiness = useMemo(() => {
    if (role === "business" && user) return user as BusinessEntity;
    return null;
  }, [role, user]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: meBusiness?.name || "",
      phone: meBusiness?.phone || "",
      address: meBusiness?.address || "",
      website: "",
      businessType: (meBusiness as any)?.businessType || "",
      isB2BEnabled: (meBusiness as any)?.isB2BEnabled ?? false,
      hasAgreedToTerms: (meBusiness as any)?.hasAgreedToTerms ?? false,
      preferences: (meBusiness as any)?.preferences || {},
    },
    values: meBusiness
      ? {
        name: meBusiness.name || "",
        phone: meBusiness.phone || "",
        address: meBusiness.address || "",
        website: "",
        businessType: (meBusiness as any)?.businessType || "",
        isB2BEnabled: (meBusiness as any)?.isB2BEnabled ?? false,
        hasAgreedToTerms: (meBusiness as any)?.hasAgreedToTerms ?? false,
        preferences: (meBusiness as any)?.preferences || {},
      }
      : undefined,
  });

  // Guard: only business users
  if (!loading && role !== "business") {
    router.replace("/unauthorized");
  }

  const handleNext = () => setStep((s) => Math.min(4, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async (data: FormData) => {
    try {
      if (!meBusiness) throw new Error("Not authenticated as business");

      // NOTE: repo exposes two variants of UPDATE_BUSINESS.
      // We use the one from graphql/business.gql.ts with { id, updateBusinessInput }
      await updateBusiness({
        variables: {
          id: meBusiness.id,
          updateBusinessInput: {
            name: data.name,
            phone: data.phone,
            address: data.address,
            website: data.website || null,
            businessType: data.businessType || null,
            isB2BEnabled: data.isB2BEnabled ?? false,
            hasAgreedToTerms: !!data.hasAgreedToTerms,
            preferences: data.preferences ?? {},
          },
        },
      });

      showToast("success", "Saved", "Business profile updated", true, 6000, "bottom-right");
      router.push("/business/dashboard");
    } catch (err: any) {
      showToast("error", "Failed", err.message || "Failed to save", true, 8000, "bottom-right");
    }
  };

  const { control, handleSubmit } = form;

  return (
    <div className="relative w-full flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <div className="w-full max-w-lg p-6 space-y-6 bg-white dark:bg-gray-950 rounded-lg border border-secondary-light dark:border-secondary-dark shadow-lg">
        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm">Step {step} of 4</span>
            <span className="text-sm">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary-light dark:bg-secondary-dark rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <input className="w-full bg-transparent border rounded-md px-3 py-2" placeholder="Your business name" {...field} />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <input className="w-full bg-transparent border rounded-md px-3 py-2" placeholder="Business phone" {...field} />
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
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <input className="w-full bg-transparent border rounded-md px-3 py-2" placeholder="Business address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <input className="w-full bg-transparent border rounded-md px-3 py-2" placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <FormControl>
                        <input className="w-full bg-transparent border rounded-md px-3 py-2" placeholder="e.g. Retail, Restaurant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="isB2BEnabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enable B2B</FormLabel>
                      <FormControl>
                        <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="preferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferences (JSON)</FormLabel>
                      <FormControl>
                        <textarea className="w-full bg-transparent border rounded-md px-3 py-2"
                          placeholder='{"currency":"USD","notifications":true}'
                          value={typeof field.value === "string" ? field.value : JSON.stringify(field.value ?? {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const val = e.target.value;
                              const parsed = val ? JSON.parse(val) : {};
                              field.onChange(parsed);
                            } catch {
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="hasAgreedToTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agree to Terms</FormLabel>
                      <FormControl>
                        <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm opacity-80">Review your info and finish setup. You can edit later in Business Settings.</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <GlowButton type="button" onClick={handleBack} disabled={step === 1}>
                Back
              </GlowButton>
              {step < 4 ? (
                <GlowButton type="button" onClick={handleNext}>
                  Next
                </GlowButton>
              ) : (
                <GlowButton type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Finish Setup"}
                </GlowButton>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}