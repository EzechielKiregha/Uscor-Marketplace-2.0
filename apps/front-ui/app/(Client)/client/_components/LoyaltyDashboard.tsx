// app/client/_components/LoyaltyDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CLIENT_PROFILE,
  GET_LOYALTY_PROGRAM,
  REDEEM_LOYALTY_POINTS
} from '@/graphql/client-panel.gql';
import { Button } from '@/components/ui/button';
import {
  Star,
  Gift,
  Coins,
  TrendingUp,
  Loader2,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useMe } from '@/lib/useMe';

interface LoyaltyDashboardProps {
  client: any;
}

export default function LoyaltyDashboard({ client }: LoyaltyDashboardProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [activeBusiness, setActiveBusiness] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const {
    data: loyaltyData,
    loading: loyaltyLoading,
    error: loyaltyError
  } = useQuery(GET_LOYALTY_PROGRAM, {
    variables: { businessId: activeBusiness || '' },
    skip: !activeBusiness
  });

  const [redeemPoints] = useMutation(REDEEM_LOYALTY_POINTS);

  // Get businesses the client has ordered from
  const businesses = client.orders?.reduce((acc: any[], order: any) => {
    const business = order.business;
    if (!acc.some(b => b.id === business.id)) {
      acc.push(business);
    }
    return acc;
  }, []) || [];

  useEffect(() => {
    if (businesses.length > 0 && !activeBusiness) {
      setActiveBusiness(businesses[0].id);
    }
  }, [businesses, activeBusiness]);

  const handleRedeemPoints = async (points: number, benefitId: string) => {
    if (!activeBusiness) return;

    setRedeeming(benefitId);
    try {
      const { data } = await redeemPoints({
        variables: {
          input: {
            clientId: client.id,
            businessId: activeBusiness,
            points,
            benefitId
          }
        }
      });

      showToast('success', 'Success', 'Points redeemed successfully!');

      // Refetch client data to update points
      // In a real app, we'd have a refetch function here
    } catch (error: any) {
      showToast('error', 'Redemption Failed', error.message || 'Failed to redeem points');
    } finally {
      setRedeeming(null);
    }
  };

  if (loyaltyLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading loyalty program details...</p>
        </div>
      </div>
    );
  }

  if (loyaltyError || !loyaltyData?.loyaltyProgram) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No Loyalty Program Available</h3>
          <p className="text-muted-foreground mb-6">
            This business doesn't currently have a loyalty program.
          </p>

          <Button
            variant="outline"
            onClick={() => setActiveBusiness(null)}
          >
            View Other Businesses
          </Button>
        </div>
      </div>
    );
  }

  const program = loyaltyData.loyaltyProgram;
  const currentTier = program.tiers.find((tier: any) => client.loyaltyPoints >= tier.minPoints) || program.tiers[0];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Business Selection */}
      {businesses.length > 1 && (
        <div className="p-4 bg-muted border-b border-border">
          <div className="flex flex-wrap gap-2">
            {businesses.map((business: any) => (
              <Button
                key={business.id}
                variant={activeBusiness === business.id ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveBusiness(business.id)}
              >
                {business.avatar ? (
                  <img
                    src={business.avatar}
                    alt={business.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                    {business.name.charAt(0)}
                  </div>
                )}
                <span>{business.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loyalty Program Header */}
      <div className="p-6 bg-muted border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{program.name}</h1>
            <p className="text-muted-foreground mt-1">
              {program.description}
            </p>
          </div>

          <div className="text-center md:text-right">
            <div className="text-3xl font-bold">{client.loyaltyPoints}</div>
            <div className="flex items-center justify-center md:justify-end">
              <Star className="h-5 w-5 text-warning mr-1" />
              <span className="text-sm">Loyalty Points</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Current Tier */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Your Current Tier</h2>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{currentTier.name}</h3>
                <p className="text-muted-foreground mt-1">
                  {client.loyaltyPoints} / {currentTier.minPoints} points
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-2">
                  <Star className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Member</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Progress to next tier</span>
                <span>{client.loyaltyPoints} / {currentTier.minPoints}</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min((client.loyaltyPoints / currentTier.minPoints) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tier Benefits */}
          {currentTier.benefits.length > 0 && (
            <div className="mt-4 p-3 bg-background rounded-lg border border-border">
              <h4 className="font-medium mb-2">Your Current Benefits:</h4>
              <ul className="space-y-1">
                {currentTier.benefits.map((benefit: any) => (
                  <li key={benefit.id} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>{benefit.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Points Earning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">How to Earn Points</h3>
            </div>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span>Earn {program.pointsPerDollar} point{program.pointsPerDollar === 1 ? '' : 's'} for every $1 spent</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span>Get bonus points for special promotions</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span>Refer friends to earn extra points</span>
              </li>
            </ul>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Redeem Your Points</h3>
            </div>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Redeem points for discounts on future purchases</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Use points to get free products or services</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Check available redemption options below</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Available Benefits */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Available Benefits</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.tiers.map((tier: any) => {
              const isCurrentTier = currentTier.id === tier.id;
              const isNextTier = program.tiers.indexOf(tier) === program.tiers.indexOf(currentTier) + 1;

              return (
                <div
                  key={tier.id}
                  className={`border rounded-lg p-4 ${isCurrentTier ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{tier.name}</h3>
                    {isCurrentTier && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Current Tier
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {isCurrentTier ? 'Your current benefits:' :
                      isNextTier ? 'Next tier benefits (only {tier.minPoints - client.loyaltyPoints} points away!)' :
                        'Future tier benefits'}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {tier.benefits.map((benefit: any) => (
                      <li key={benefit.id} className="flex items-start gap-2">
                        <CheckCircle className={`h-4 w-4 mt-1 flex-shrink-0 ${isCurrentTier ? 'text-success' : 'text-muted-foreground'
                          }`} />
                        <span>{benefit.description}</span>
                      </li>
                    ))}
                  </ul>

                  {isNextTier && client.loyaltyPoints < tier.minPoints && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm">
                        Only <span className="font-medium">{tier.minPoints - client.loyaltyPoints}</span> points
                        needed to reach this tier
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Business Type Specific Information */}
        <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Loyalty Program Tips</h3>

              {businesses.find((b: any) => b.id === activeBusiness)?.businessType === 'BOOKSTORE' && (
                <p className="text-sm text-muted-foreground mt-1">
                  As a bookstore customer, you can earn bonus points during back-to-school season
                  and redeem them for free stationery items. Teachers and students get additional
                  points on educational materials.
                </p>
              )}

              {businesses.find((b: any) => b.id === activeBusiness)?.businessType === 'GROCERY' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Grocery shoppers can earn double points on seasonal produce and redeem points
                  for discounts on bulk purchases. Check the weekly flyer for special bonus point offers.
                </p>
              )}

              {businesses.find((b: any) => b.id === activeBusiness)?.businessType === 'CAFE' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Cafe customers get a free drink after earning 100 points. Special bonus points
                  are available during morning hours (7-10 AM) and for trying new menu items.
                </p>
              )}

              {(businesses.find((b: any) => b.id === activeBusiness)?.businessType !== 'BOOKSTORE' &&
                businesses.find((b: any) => b.id === activeBusiness)?.businessType !== 'GROCERY' &&
                businesses.find((b: any) => b.id === activeBusiness)?.businessType !== 'CAFE') && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Earn points with every purchase and redeem them for discounts on future orders.
                    Check back regularly for special promotions that offer bonus points.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}