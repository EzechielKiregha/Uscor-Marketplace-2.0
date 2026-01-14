// app/business/settings/_components/PricingPlans.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
  GET_PRICING_PLANS,
  UPDATE_PRICING_PLAN,
  ON_PRICING_PLAN_UPDATED
} from '@/graphql/settings.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  CheckCircle,
  Star,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Calendar,
  Receipt,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';

// Pricing plan features
const PLAN_FEATURES = {
  BASIC: [
    'Up to 50 products',
    'Basic sales tracking',
    '1 store location',
    'Standard customer support',
    'Basic inventory management',
    'Mobile POS app access',
    'Basic reporting'
  ],
  PRO: [
    'Unlimited products',
    'Advanced sales analytics',
    'Up to 5 store locations',
    'Priority customer support',
    'Advanced inventory management',
    'Loyalty program',
    'Freelance services marketplace access',
    'Customizable POS interface',
    'Advanced reporting & exports',
    'Staff management & permissions'
  ],
  ENTERPRISE: [
    'Unlimited products',
    'Custom analytics & reporting',
    'Unlimited store locations',
    'Dedicated account manager',
    'Advanced inventory & supply chain',
    'Custom loyalty program',
    'Full marketplace access',
    'API access & integrations',
    'Custom branding',
    'Priority technical support',
    'Custom feature development'
  ]
};

interface PricingPlansProps {
  // Optional props if needed
}

export default function PricingPlans({ }: PricingPlansProps) {
  const { user, loading: authLoading } = useMe();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { showToast } = useToast();

  const {
    data: pricingPlansData,
    loading: pricingLoading,
    refetch
  } = useQuery(GET_PRICING_PLANS);

  const {
    data: pricingUpdateData,
    loading: pricingUpdateLoading
  } = useSubscription(ON_PRICING_PLAN_UPDATED, {
    variables: { businessId: user?.id },
    skip: !user?.id
  });

  const [updatePlan] = useMutation(UPDATE_PRICING_PLAN);

  const pricingPlans = pricingPlansData?.pricingPlans || [];

  // Filter plans by billing cycle
  const filteredPlans = pricingPlans.filter((plan: any) =>
    billingCycle === 'monthly' ? !plan.isYearly : plan.isYearly
  );

  // Get current plan
  const currentPlan = pricingPlans.find((p: any) => p.isCurrentPlan);

  const handlePlanChange = async (planId: string) => {
    if (selectedPlan === planId) return;

    setSelectedPlan(planId);

    // In a real app, this would handle the payment flow
    setIsChanging(true);
    try {
      await updatePlan({
        variables: { planId }
      });

      showToast('success', 'Success', 'Pricing plan updated successfully');
      refetch();
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to update pricing plan');
    } finally {
      setIsChanging(false);
      setSelectedPlan(null);
    }
  };

  // Auto-refresh when subscription updates
  useEffect(() => {
    if (pricingUpdateData) {
      refetch();
    }
  }, [pricingUpdateData, refetch]);

  if (authLoading || pricingLoading) return (
    <Card>
      <CardContent className="h-125 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pricing Plans
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the right plan for your business needs
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">View Invoice History</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Current Plan Banner */}
        <div className="mb-6 p-4 rounded-lg bg-muted">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold">Current Plan: {currentPlan?.name || 'Basic'}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You're currently on the {currentPlan?.name || 'Basic'} plan.
                {currentPlan?.isYearly ? 'Billed annually' : 'Billed monthly'}.
                {currentPlan?.nextBillingDate && ` Next billing date: ${new Date(currentPlan.nextBillingDate).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mb-6 flex items-center justify-center bg-muted p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'monthly'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'yearly'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Yearly Billing (Save 20%)
          </button>
        </div>

        {/* Pricing Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlans.map((plan: any) => {
            const monthlyPrice = plan.price / (plan.isYearly ? 12 : 1);
            const yearlySavings = plan.price * 0.2;

            return (
              <div
                key={plan.id}
                className={`border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden ${plan.isCurrentPlan ? 'ring-2 ring-primary' : ''
                  }`}
              >
                <div className="p-6 bg-muted border-b border-border">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-2 flex items-end">
                    <span className="text-3xl font-bold">${monthlyPrice.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {plan.isYearly ? '/mo (billed yearly)' : '/month'}
                    </span>
                  </div>
                  {plan.isYearly && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      Total: ${plan.price.toFixed(2)} billed annually
                    </div>
                  )}
                  {plan.isCurrentPlan && (
                    <div className="mt-3 inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Current Plan
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  {plan.isYearly && plan.name !== 'BASIC' && (
                    <div className="flex items-center gap-2 p-2 bg-success/10 text-success rounded-md">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">Save ${yearlySavings.toFixed(2)} annually</span>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-2">
                      {PLAN_FEATURES[plan.name.toUpperCase() as keyof typeof PLAN_FEATURES].map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Button
                      variant={plan.isCurrentPlan ? 'outline' : 'default'}
                      className="w-full"
                      onClick={() => !plan.isCurrentPlan && handlePlanChange(plan.id)}
                      disabled={isChanging || plan.isCurrentPlan}
                    >
                      {isChanging && selectedPlan === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Changing...
                        </>
                      ) : plan.isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        'Select Plan'
                      )}
                    </Button>
                  </div>
                </div>

                {plan.name === 'PRO' && (
                  <div className="px-6 pb-6">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Pro Tip:</span> For most local businesses in East Africa,
                        the PRO plan offers the best value with marketplace access at an affordable price.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Benefits for Local Businesses */}
        <div className="mt-6 border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" />
            Why Upgrade for Local Artisans?
          </h3>

          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
              <span>Upgrade to PRO to access the freelance services marketplace for transportation and delivery</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
              <span>With PRO or ENTERPRISE, you can purchase materials from other businesses in the marketplace</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
              <span>Advanced inventory management helps wood workers and artisans track materials and finished products</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
              <span>Loyalty programs (PRO and above) help build customer relationships for local businesses</span>
            </li>
          </ul>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Pro Tip:</strong> For local artisans and craftsmen, the PRO plan is often the
              best value as it unlocks the marketplace features while providing advanced tools for
              managing your craft business.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-6 border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
          <div className="p-4 bg-muted border-b border-border">
            <h3 className="font-semibold">Frequently Asked Questions</h3>
          </div>

          <div className="divide-y divide-border">
            <div className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Can I switch plans later?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will take effect
                at the beginning of your next billing cycle.
              </p>
            </div>

            <div className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Do you offer annual billing?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes, all plans except BASIC offer annual billing with a 20% discount compared to monthly billing.
              </p>
            </div>

            <div className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                What payment methods do you accept?
              </h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, mobile money (MTN, Airtel, Orange, M-Pesa), and bank transfers.
                For East African businesses, mobile money is the preferred payment method.
              </p>
            </div>

            <div className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                Is there a free trial?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes, all new businesses get a 14-day free trial of the PRO plan to experience all
                features before committing.
              </p>
            </div>

            <div className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                How does billing work for East African businesses?
              </h4>
              <p className="text-sm text-muted-foreground">
                We automatically convert your local currency to USD for billing. You'll be charged in your
                local currency via mobile money or card. All pricing shown is in USD equivalent.
              </p>
            </div>
          </div>
        </div>

        {/* East Africa Specific Pricing */}
        <div className="mt-6 border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4 bg-muted">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            East Africa Pricing Information
          </h3>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">Local Currency Conversion</h4>
              <p className="text-sm text-muted-foreground">
                Our pricing is displayed in USD for consistency, but you'll be charged in your local currency:
              </p>
              <ul className="mt-2 space-y-1 pl-4 list-disc text-sm text-muted-foreground">
                <li><span className="font-medium">Rwanda:</span> 1 USD ≈ 1,100 RWF</li>
                <li><span className="font-medium">Uganda:</span> 1 USD ≈ 3,700 UGX</li>
                <li><span className="font-medium">Kenya:</span> 1 USD ≈ 130 KES</li>
                <li><span className="font-medium">Tanzania:</span> 1 USD ≈ 2,300 TZS</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">Mobile Money Billing</h4>
              <p className="text-sm text-muted-foreground">
                For East African businesses, we support direct billing via mobile money:
              </p>
              <ul className="mt-2 space-y-1 pl-4 list-disc text-sm text-muted-foreground">
                <li>Automatic deduction on billing date</li>
                <li>No credit card required</li>
                <li>Available for MTN, Airtel, Orange, and M-Pesa</li>
                <li>Notifications sent before deduction</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-1">Special Offers for East Africa</h4>
              <p className="text-sm text-muted-foreground">
                We offer special pricing for businesses in East Africa:
              </p>
              <ul className="mt-2 space-y-1 pl-4 list-disc text-sm text-muted-foreground">
                <li>50% discount for the first 3 months for new businesses</li>
                <li>Free hardware setup consultation for PRO and ENTERPRISE plans</li>
                <li>Local language support for Swahili and Kinyarwanda</li>
                <li>Special rates for cooperatives and artisan groups</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}