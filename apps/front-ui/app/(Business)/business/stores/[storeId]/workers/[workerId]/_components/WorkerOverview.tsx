"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  BarChart,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import {
  BarChart as BarChartRecharts,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/lib/chart-theme";

interface WorkerOverviewProps {
  worker: any;
  performance: any;
}

export default function WorkerOverview({
  worker,
  performance,
}: WorkerOverviewProps) {
  // Sample data for charts
  const salesByDay = [
    { name: "Mon", sales: 1200 },
    { name: "Tue", sales: 1900 },
    { name: "Wed", sales: 1500 },
    { name: "Thu", sales: 2100 },
    { name: "Fri", sales: 2800 },
    { name: "Sat", sales: 3200 },
    { name: "Sun", sales: 2400 },
  ];

  return (
    <div className="space-y-6">
      {/* Worker Info */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold">Worker Information</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium">{worker.fullName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{worker.email}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{worker.phone || "N/A"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium">{worker.role}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Join Date</span>
                  <span className="font-medium">
                    {new Date(worker.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Business Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Store</span>
                  <span className="font-medium">{worker.store?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business</span>
                  <span className="font-medium">{worker.business?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Type</span>
                  <span className="font-medium capitalize">
                    {worker.business?.businessType}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <span
                    className={`font-medium ${
                      worker.isVerified ? "text-success" : "text-warning"
                    }`}
                  >
                    {worker.isVerified ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Login</span>
                  <span className="font-medium">
                    {worker.lastLogin
                      ? new Date(worker.lastLogin).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold">Performance Overview</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-xl font-bold">
                    ${performance?.totalSales?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold">
                    {performance?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Ticket</p>
                  <p className="text-xl font-bold">
                    ${performance?.averageTicket?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Shifts Completed
                  </p>
                  <p className="text-xl font-bold">
                    {performance?.shiftsCompleted || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-4">
              Sales Performance (Last 7 Days)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChartRecharts data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                  <Bar dataKey="sales" fill={CHART_COLORS.primary} />
                </BarChartRecharts>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {performance?.recentActivities
              ?.slice(0, 5)
              .map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {activity.type === "SALE" && (
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                    )}
                    {activity.type === "SHIFT_START" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Clock className="h-4 w-4" />
                      </div>
                    )}
                    {activity.type === "INVENTORY_ADJUSTMENT" && (
                      <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                        <Package className="h-4 w-4" />
                      </div>
                    )}

                    <div>
                      <p className="font-medium">
                        {activity.type === "SALE" &&
                          `Processed sale #${activity.id.substring(0, 8)}`}
                        {activity.type === "SHIFT_START" && "Started shift"}
                        {activity.type === "INVENTORY_ADJUSTMENT" &&
                          "Adjusted inventory"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {activity.type === "SALE" &&
                        `$${activity.amount.toFixed(2)}`}
                      {activity.type === "INVENTORY_ADJUSTMENT" &&
                        `${activity.quantity} items`}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Activity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
