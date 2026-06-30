"use client";

import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import {
  GET_STORE_BY_ID,
  GET_STORE_DASHBOARD_STATS,
} from "@/graphql/store.gql";
import { GET_WORKERS } from "@/graphql/worker.gql";
import { WorkerEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import { useQuery } from "@apollo/client";
import {
  BarChart,
  Building2,
  Clock,
  Download,
  Home,
  Package,
  Plus,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import AddWorkerModal from "./_components/AddWorkerModal";
import StoreInventory from "./_components/StoreInventory";
import StoreOverview from "./_components/StoreOverview";
import StoreReports from "./_components/StoreReports";
import StoreShifts from "./_components/StoreShifts";
import WorkerCard from "./_components/WorkerCard";
import { useOpenAddWorkerModal } from "./_hooks/use-open-add-worker-modal";

interface StorePageProps {
  params: Promise<{
    storeId: string;
  }>;
}

export default function StorePage({ params }: StorePageProps) {
  const { storeId } = use(params);

  const { user, role, loading: authLoading } = useMe();
  const { isOpen, setIsOpen } = useOpenAddWorkerModal();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "workers" | "reports" | "shifts" | "inventory"
  >("overview");

  const {
    data: storeData,
    loading: storeLoading,
    error: storeError,
    refetch,
  } = useQuery(GET_STORE_BY_ID, {
    variables: { id: storeId },
    skip: !storeId,
  });

  const {
    data: workersData,
    loading: workersLoading,
    error: workersError,
    refetch: refetchWorkers,
  } = useQuery(GET_WORKERS, {
    variables: { storeId: storeId },
    skip: !storeId,
  });

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery(GET_STORE_DASHBOARD_STATS, {
    variables: { storeId: storeId },
    skip: !storeId,
  });

  const store = storeData?.store;
  const workers = workersData?.workers || [];
  const stats = statsData?.storeDashboardStats;

  if (authLoading || storeLoading || workersLoading || statsLoading)
    return <DashboardSkeleton />;
  if (storeError || !store)
    return (
      <div>Error loading store: {storeError?.message || "Store not found"}</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-page-title flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            {store.name}
          </h1>
          <p className="text-page-subtitle">{store.address}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/business/stores")}
          >
            Back to Stores
          </Button>
          <Button
            variant="default"
            onClick={() =>
              setIsOpen({ openAddWorkerModal: true, storeId: storeId })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
          <Button
            variant="default"
            onClick={() => router.push(`/business/stores/${store.id}/report`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Reports
          </Button>
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-stat-label">Active Workers</p>
              <p className="text-stat">{stats?.activeWorkers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-stat-label">Today's Sales</p>
              <p className="text-stat">
                ${stats?.todaySales?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-stat-label">Low Stock Items</p>
              <p className="text-stat">{stats?.lowStockItems || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-stat-label">Active Shifts</p>
              <p className="text-stat">{stats?.activeShifts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("overview")}
          >
            <Home className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "workers" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("workers")}
          >
            <Users className="h-4 w-4" />
            Workers ({workers.length})
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
            variant={activeTab === "shifts" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("shifts")}
          >
            <Clock className="h-4 w-4" />
            Shifts
          </Button>
          <Button
            variant={activeTab === "inventory" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab("inventory")}
          >
            <Package className="h-4 w-4" />
            Inventory
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === "overview" && (
          <StoreOverview store={store} stats={stats} workers={workers} />
        )}

        {activeTab === "workers" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker: WorkerEntity) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  onView={() =>
                    (window.location.href = `/business/stores/${store.id}/workers/${worker.id}`)
                  }
                />
              ))}
            </div>

            {workers.length === 0 && (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Workers Assigned</h3>
                <p className="text-muted-foreground mb-6">
                  This store doesn't have any workers assigned yet. Add workers
                  to start managing operations.
                </p>
                <Button
                  variant="default"
                  onClick={() =>
                    setIsOpen({ openAddWorkerModal: true, storeId: store.id })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Worker
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && <StoreReports storeId={store.id} />}

        {activeTab === "shifts" && <StoreShifts storeId={store.id} />}

        {activeTab === "inventory" && <StoreInventory storeId={store.id} />}
      </div>

      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={isOpen}
        onClose={() => setIsOpen({ openAddWorkerModal: false, storeId: null })}
        storeId={storeId}
        businessId={user ? user.id! : ""}
      />
    </div>
  );
}
