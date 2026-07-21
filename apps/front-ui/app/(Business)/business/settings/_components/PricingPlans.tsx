// app/business/settings/_components/PricingPlans.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FEATURE_DEFINITIONS,
    type FeatureKey,
    formatPlanPrice,
    SUBSCRIPTION_PLANS,
} from "@/config/subscription-plans";
import { ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";

// The current tier — will come from a real query once subscriptions ship
const CURRENT_TIER = "STARTER" as const;

const DISPLAY_FEATURES: FeatureKey[] = [
  "multiStore",
  "workerLimit",
  "productLimit",
  "advancedAnalytics",
  "b2bAccess",
  "bulkImport",
];

export default function PricingPlans() {
  const plan = SUBSCRIPTION_PLANS[CURRENT_TIER];
  const PlanIcon = plan.icon;

  return (
    <Card className="border hover:border-primary  bg-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PlanIcon className="h-5 w-5" />
          Current Plan
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Your business is on the{" "}
          <span className="font-semibold text-foreground">{plan.name}</span>{" "}
          plan
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan card */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="p-6 bg-muted border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center ${plan.color}`}
                >
                  <PlanIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold">
                  {formatPlanPrice(plan)}
                </span>
                {plan.price !== "custom" && plan.price > 0 && (
                  <span className="text-sm text-muted-foreground">
                    /{plan.billingPeriod}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Limits */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {plan.limits.maxStores === "unlimited"
                    ? "∞"
                    : plan.limits.maxStores}
                </p>
                <p className="text-xs text-muted-foreground">
                  Store{plan.limits.maxStores !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {plan.limits.maxWorkers === "unlimited"
                    ? "∞"
                    : plan.limits.maxWorkers}
                </p>
                <p className="text-xs text-muted-foreground">Workers</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {plan.limits.maxProducts === "unlimited"
                    ? "∞"
                    : plan.limits.maxProducts}
                </p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
            </div>

            {/* Feature list */}
            <div className="space-y-2">
              {DISPLAY_FEATURES.map((featureKey) => {
                const value = plan.featureMatrix[featureKey];
                const isEnabled =
                  value === true ||
                  (typeof value === "string" && value !== "false");
                const def = FEATURE_DEFINITIONS[featureKey];
                if (!def) return null;

                return (
                  <div
                    key={featureKey}
                    className="flex items-center gap-2 text-sm"
                  >
                    {isEnabled ? (
                      <Check className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={
                        isEnabled
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                      }
                    >
                      {def.label}
                    </span>
                    {typeof value === "string" &&
                      value !== "true" &&
                      value !== "false" &&
                      isEnabled && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          ({value})
                        </span>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium">Need more features?</p>
            <p className="text-sm text-muted-foreground">
              View all plans and compare features
            </p>
          </div>
          <Button variant="default" asChild>
            <Link href="/business/subscription">
              View Plans
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
