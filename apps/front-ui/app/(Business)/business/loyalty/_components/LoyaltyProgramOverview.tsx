// app/business/loyalty/_components/LoyaltyProgramOverview.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CUSTOMER_POINTS } from '@/graphql/loyalty.gql';
import Loader from '@/components/seraui/Loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Star, TrendingUp, Gift, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMe } from '@/lib/useMe';

interface LoyaltyProgramOverviewProps {
  program: any; // Replace with LoyaltyProgramEntity
  analytics: any;
  loading: boolean;
}

export default function LoyaltyProgramOverview({
  program,
  analytics,
  loading
}: LoyaltyProgramOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [customerSearch, setCustomerSearch] = useState('');
  const user = useMe();

  const {
    data: customersData,
    loading: customersLoading,
    refetch: refetchCustomers
  } = useQuery(GET_CUSTOMER_POINTS, {
    variables: {
      businessId: user?.id,
      clientId: 'current-client-id'
    },
    skip: !program?.id
  });

  useEffect(() => {
    if (program?.id) {
      refetchCustomers();
    }
  }, [program, refetchCustomers]);

  if (loading) return (
    <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
      <CardContent className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </CardContent>
    </Card>
  );

  if (!program) return null;

  // Sample data for charts - in real app, use analytics data
  const pointsByDay = [
    { name: 'Mon', earned: 120, redeemed: 45 },
    { name: 'Tue', earned: 180, redeemed: 60 },
    { name: 'Wed', earned: 220, redeemed: 80 },
    { name: 'Thu', earned: 150, redeemed: 50 },
    { name: 'Fri', earned: 250, redeemed: 90 },
    { name: 'Sat', earned: 300, redeemed: 120 },
    { name: 'Sun', earned: 200, redeemed: 70 },
  ];

  const topCustomers = [
    { name: 'Sarah J.', points: 1250, spent: 350 },
    { name: 'Michael T.', points: 980, spent: 285 },
    { name: 'Elena R.', points: 875, spent: 240 },
    { name: 'David K.', points: 750, spent: 210 },
    { name: 'Maria L.', points: 625, spent: 185 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Program Stats */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Program Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Customers earn <span className="font-medium">{program.pointsPerPurchase}</span> points for every <span className="font-medium">$1</span> spent.
                  They can redeem <span className="font-medium">{program.minimumPointsToRedeem}</span> points for discounts or free products.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Members</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics?.totalMembers || 0}</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {analytics?.activeMembers || 0} active
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Points</span>
                  </div>
                  <p className="text-2xl font-bold">{analytics?.pointsEarned || 0}</p>
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3" />
                    {analytics?.pointsRedeemed || 0} redeemed
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Redemption Rate</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(analytics?.redemptionRate || 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {(analytics?.redemptionRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Top Customers</CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ${customer.spent} spent
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{customer.points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Charts & Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Points Activity</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={selectedPeriod === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('day')}
              >
                Day
              </Button>
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pointsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="earned" fill="hsl(var(--primary))" name="Points Earned" />
                  <Bar dataKey="redeemed" fill="hsl(var(--accent))" name="Points Redeemed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Customer Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pointsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="earned"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Points Earned"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Repeat Customers</h3>
                <p className="text-2xl font-bold">{analytics?.activeMembers || 0}</p>
                <p className="text-sm text-muted-foreground">
                  {analytics ? Math.round((analytics.activeMembers / analytics.totalMembers) * 100) : 0}% of members
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Avg. Points per Sale</h3>
                <p className="text-2xl font-bold">{program.pointsPerPurchase.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">
                  {program.minimumPointsToRedeem} points = $1 value
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Redemption Value</h3>
                <p className="text-2xl font-bold">${(program.minimumPointsToRedeem / program.pointsPerPurchase).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Average value per redemption
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}