// app/business/loyalty/_components/LoyaltyProgramOverview.tsx (Updated)
"use client";

import { useQuery } from "@apollo/client";
import {
    AlertTriangle,
    Download,
    Edit,
    Gift,
    Search,
    Star,
    Trash2,
    TrendingUp,
    Users
} from "lucide-react";
import { useState } from "react";
import {
    Bar,
    BarChart as BarChartRecharts,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    GET_LOYALTY_ANALYTICS,
    GET_LOYALTY_PROGRAM_BY_ID,
    GET_LOYALTY_TIERS,
    GET_POINTS_TRANSACTIONS,
} from "@/graphql/loyalty.gql";
import { CHART_COLORS } from "@/lib/chart-theme";
import { BusinessEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";

interface LoyaltyProgramOverviewProps {
  programId: string;
  onEditProgram: () => void;
  onDeleteProgram: (id: string) => void;
}

export default function LoyaltyProgramOverview({
  programId,
  onEditProgram,
  onDeleteProgram,
}: LoyaltyProgramOverviewProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("month");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = user as BusinessEntity;

  const {
    data: programData,
    loading: programLoading,
    error: programError,
    refetch: refetchProgram,
  } = useQuery(GET_LOYALTY_PROGRAM_BY_ID, {
    variables: { id: programId },
    skip: !programId,
  });

  const {
    data: analyticsData,
    loading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery(GET_LOYALTY_ANALYTICS, {
    variables: {
      businessId: user?.id || "",
      period: selectedPeriod,
    },
    skip: !user?.id,
  });

  const {
    data: tiersData,
    loading: tiersLoading,
    error: tiersError,
    refetch: refetchTiers,
  } = useQuery(GET_LOYALTY_TIERS, {
    variables: { loyaltyProgramId: programId },
    skip: !programId,
  });

  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery(GET_POINTS_TRANSACTIONS, {
    variables: {
      loyaltyProgramId: programId,
      type: selectedTier || undefined,
      page: 1,
      limit: 10,
    },
    skip: !programId,
  });

  const program = programData?.loyaltyProgram;
  const analytics = analyticsData?.loyaltyAnalytics;
  const tiers = tiersData?.loyaltyTiers || [];
  const transactions = transactionsData?.pointsTransactions?.items || [];


  const pointsByDay = [
    { name: "Mon", earned: 120, redeemed: 45 },
    { name: "Tue", earned: 190, redeemed: 60 },
    { name: "Wed", earned: 150, redeemed: 35 },
    { name: "Thu", earned: 210, redeemed: 80 },
    { name: "Fri", earned: 280, redeemed: 120 },
    { name: "Sat", earned: 320, redeemed: 150 },
    { name: "Sun", earned: 240, redeemed: 90 },
  ];

  const customerTiers = [
    { name: "Bronze", value: analytics?.bronzeMembers || 45 },
    { name: "Silver", value: analytics?.silverMembers || 30 },
    { name: "Gold", value: analytics?.goldMembers || 15 },
    { name: "Platinum", value: analytics?.platinumMembers || 5 },
  ];

  const COLORS = CHART_COLORS.palette;

  if (programLoading || analyticsLoading || tiersLoading)
    return <DashboardSkeleton />;
  if (programError || analyticsError || tiersError) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Program</h3>
        <p className="text-muted-foreground mb-6">
          {programError?.message ||
            analyticsError?.message ||
            tiersError?.message ||
            "Failed to load program data"}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            refetchProgram();
            refetchAnalytics();
            refetchTiers();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Program Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The loyalty program you're looking for doesn't exist or has been
          removed.
        </p>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/business/loyalty")}
        >
          Back to Programs
        </Button>
      </div>
    );
  }

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(
    (transaction: any) =>
      transaction.client.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.client.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 bg-muted border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                {program.name}
              </h2>
              <p className="text-muted-foreground mt-1">
                {program.description}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm" onClick={onEditProgram}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Program
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteProgram(program.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Program
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-xl font-bold">
                    {analytics?.totalMembers || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                  <p className="text-xl font-bold">
                    {analytics?.pointsEarned || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Points Redeemed
                  </p>
                  <p className="text-xl font-bold">
                    {analytics?.pointsRedeemed || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Redemption Rate
                  </p>
                  <p className="text-xl font-bold">
                    {analytics?.redemptionRate
                      ? `${(analytics.redemptionRate * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Program Configuration */}
          <div className="border border-border rounded-lg p-4 mb-6 bg-muted">
            <h3 className="font-semibold mb-3">Program Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Points per $1 spent
                </p>
                <p className="text-xl font-bold">
                  {program.pointsPerPurchase} pts
                </p>
              </div>

              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Minimum points to redeem
                </p>
                <p className="text-xl font-bold">
                  {program.minimumPointsToRedeem} pts
                </p>
              </div>

              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Value of redemption
                </p>
                <p className="text-xl font-bold">
                  ${(program.minimumPointsToRedeem / 10).toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Active Tiers</p>
                <p className="text-xl font-bold">{tiers.length}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Points Earned vs Redeemed */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Points Activity</h3>
              </div>

              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChartRecharts data={pointsByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="earned"
                      name="Points Earned"
                      fill={CHART_COLORS.primary}
                    />
                    <Bar
                      dataKey="redeemed"
                      name="Points Redeemed"
                      fill={CHART_COLORS.success}
                    />
                  </BarChartRecharts>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer Tiers */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Customer Tiers</h3>
              </div>

              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerTiers}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill={CHART_COLORS.accent}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                      }
                    >
                      {customerTiers.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} customers`, "Count"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted border-b border-border">
              <h3 className="font-semibold">Top Customers</h3>
            </div>

            <div className="divide-y divide-border">
              {analytics?.topCustomers
                ?.slice(0, 5)
                .map((customer: any, index: number) => (
                  <div
                    key={customer.clientId}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                        {customer.clientName?.charAt(0) || "C"}
                      </div>
                      <div>
                        <p className="font-medium">{customer.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.totalSpent?.toFixed(2)} spent
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{customer.totalPoints} pts</p>
                      <p className="text-sm text-muted-foreground">
                        points earned
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Recent Transactions</h2>
            <p className="text-sm text-muted-foreground">
              Points earned and redeemed by your customers
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <select
              value={selectedTier || ""}
              onChange={(e) => setSelectedTier(e.target.value || null)}
              className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Types</option>
              <option value="EARNED">Earned Points</option>
              <option value="REDEEMED">Redeemed Points</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        <div className="p-4">
          {transactionsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 border border-border rounded-lg animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div>
                      <div className="h-4 bg-muted rounded w-32 mb-1" />
                      <div className="h-3 bg-muted rounded w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-muted rounded w-16 mb-1" />
                    <div className="h-3 bg-muted rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-8 w-8 mx-auto mb-3" />
              <p>No recent transactions</p>
              <p className="text-sm mt-1">
                Points earned and redeemed will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                      {transaction.client.fullName?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.client.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.type === "EARNED"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.type === "EARNED" ? "+" : "-"}
                      {transaction.points} pts
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {transaction.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Business Type Specific Information */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Star className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold">
              Optimizing Loyalty Programs for East Africa
            </h3>

            {currentUser?.businessType === "ARTISAN" && (
              <p className="text-sm text-muted-foreground mt-1">
                For artisan businesses, consider offering "Custom Order Points"
                where customers earn bonus points for placing custom orders.
                This encourages repeat customers for your unique, handcrafted
                products.
              </p>
            )}

            {currentUser?.businessType === "CAFE" && (
              <p className="text-sm text-muted-foreground mt-1">
                Cafés benefit from "Buy 9, Get 1 Free" loyalty programs (90
                points = free drink). This encourages daily customers to return
                and increases average transaction value.
              </p>
            )}

            {currentUser?.businessType === "HARDWARE" && (
              <p className="text-sm text-muted-foreground mt-1">
                Hardware stores should reward customers with points for tool
                purchases and offer discounts on accessories or repair services.
                This builds long-term customer relationships.
              </p>
            )}

            {currentUser?.businessType !== "ARTISAN" &&
              currentUser?.businessType !== "CAFE" &&
              currentUser?.businessType !== "HARDWARE" && (
                <p className="text-sm text-muted-foreground mt-1">
                  For East African markets, consider smaller point thresholds to
                  drive more frequent engagement. The average customer spends
                  $20-50 per visit, so setting redemption thresholds at 100-200
                  points ($10-$20 value) works well for local markets.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
