"use client";

import { Button } from "@/components/ui/button";
import { GET_WORKER_BY_ID } from "@/graphql/worker.gql";
import { useQuery } from "@apollo/client";
import {
  ArrowLeft,
  BarChart,
  Clock,
  DollarSign,
  Edit,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  User,
} from "lucide-react";
import { use, useState } from "react";

// Import the existing worker components
import ChatsPage from "@/app/(worker)/worker/_components/ChatsPage";
import InventoryPage from "@/app/(worker)/worker/_components/InventoryPage";
import PosPage from "@/app/(worker)/worker/_components/PosPage";
import ProfilePage from "@/app/(worker)/worker/_components/ProfilePage";
import ReportsPage from "@/app/(worker)/worker/_components/ReportsPage";
import ShiftsPage from "@/app/(worker)/worker/_components/ShiftsPage";
import Loader from "@/components/seraui/Loader";
import { GET_WORKER_PERFORMANCE } from "@/graphql/reports.gql";
import { useMe } from "@/lib/useMe";

interface WorkerDetailPageProps {
  params: Promise<{
    storeId: string;
    workerId: string;
  }>;
}

export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const { storeId, workerId } = use(params);

  const { loading: authLoading } = useMe();
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "reports"
    | "pos"
    | "inventory"
    | "shifts"
    | "chats"
    | "profile"
  >("overview");

  const {
    data: workerData,
    loading: workerLoading,
    error: workerError,
  } = useQuery(GET_WORKER_BY_ID, {
    variables: { id: workerId },
    skip: !workerId,
  });

  const { data: performanceData, loading: performanceLoading } = useQuery(
    GET_WORKER_PERFORMANCE,
    {
      variables: {
        workerId: workerId,
        storeId: storeId,
      },
      skip: !workerId || !storeId,
    },
  );

  const worker = workerData?.worker;
  const performance = performanceData?.workerPerformance;

  if (authLoading || workerLoading || performanceLoading)
    return <Loader loading={true} />;
  if (workerError || !worker)
    return (
      <div>
        Error loading worker: {workerError?.message || "Worker not found"}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              (window.location.href = `/business/stores/${storeId}`)
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {worker.avatar ? (
            <img
              src={worker.avatar}
              alt={worker.fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
              {worker.fullName.charAt(0)}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {worker.fullName}
              {worker.isVerified && (
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              {worker.role} • {worker.email}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Worker Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sales Today</p>
              <p className="text-xl font-bold">
                ${performance?.todaySales?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Orders Today</p>
              <p className="text-xl font-bold">
                {performance?.todayOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Shift</p>
              <p className="text-xl font-bold">
                {performance?.currentShift ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
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
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <div className="flex flex-wrap gap-1">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("overview")}
          >
            <User className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "reports" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("reports")}
          >
            <BarChart className="h-4 w-4" />
            Reports
          </Button>
          <Button
            variant={activeTab === "pos" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("pos")}
          >
            <ShoppingCart className="h-4 w-4" />
            POS Activity
          </Button>
          <Button
            variant={activeTab === "inventory" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("inventory")}
          >
            <Package className="h-4 w-4" />
            Inventory Actions
          </Button>
          <Button
            variant={activeTab === "shifts" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("shifts")}
          >
            <Clock className="h-4 w-4" />
            Shifts
          </Button>
          <Button
            variant={activeTab === "chats" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("chats")}
          >
            <MessageSquare className="h-4 w-4" />
            Chats
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("profile")}
          >
            <Settings className="h-4 w-4" />
            Profile
          </Button>
        </div>
      </div>

      {/* Content Area - Reusing Worker Components */}
      <div>
        {activeTab === "overview" && (
          <WorkerOverview worker={worker} performance={performance} />
        )}

        {activeTab === "reports" && (
          <ReportsPage
            selectedStoreId={storeId}
            viewMode="business"
            workerId={workerId}
          />
        )}

        {activeTab === "pos" && (
          <PosPage
            selectedStoreId={storeId}
            viewMode="business"
            workerId={workerId}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryPage
            selectedStoreId={storeId}
            viewMode="business"
            workerId={workerId}
          />
        )}

        {activeTab === "shifts" && (
          <ShiftsPage
            selectedStoreId={storeId}
            viewMode="business"
            workerId={workerId}
          />
        )}

        {activeTab === "chats" && (
          <ChatsPage viewMode="business" workerId={workerId} />
        )}

        {activeTab === "profile" && (
          <ProfilePage viewMode="business" workerId={workerId} />
        )}
      </div>
    </div>
  );
}

// Simple Worker Overview Component (since there's no existing one to reuse)
function WorkerOverview({
  worker,
  performance,
}: {
  worker: any;
  performance: any;
}) {
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
        </div>
      </div>
    </div>
  );
}
