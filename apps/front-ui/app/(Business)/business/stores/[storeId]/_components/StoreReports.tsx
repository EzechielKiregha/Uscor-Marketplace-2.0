"use client";

import { useQuery } from "@apollo/client";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { GET_STORE_REPORTS } from "@/graphql/store.gql";
import { CHART_COLORS } from "@/lib/chart-theme";

interface StoreReportsProps {
  storeId: string;
}

export default function StoreReports({ storeId }: StoreReportsProps) {
  const { data, loading } = useQuery(GET_STORE_REPORTS, {
    variables: { storeId, period: "week" },
    skip: !storeId,
  });

  if (loading) return <DashboardSkeleton />;
  if (!data?.storeReports) return null;

  const {
    totalSales,
    totalOrders,
    averageTicket,
    dailySales,
    workerPerformance,
  } = data.storeReports;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">
                ${totalSales?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold">{totalOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Ticket</p>
              <p className="text-xl font-bold">
                ${averageTicket?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Workers</p>
              <p className="text-xl font-bold">
                {workerPerformance?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <h3 className="font-semibold mb-4">Daily Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="sales"
                  fill={CHART_COLORS.primary}
                  name="Sales ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <h3 className="font-semibold mb-4">Worker Performance</h3>
          <div className="space-y-3">
            {workerPerformance?.map((wp: any) => (
              <div
                key={wp.workerId}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">{wp.workerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {wp.hoursWorked}h worked
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${wp.sales?.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {wp.completionRate}% completion
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
