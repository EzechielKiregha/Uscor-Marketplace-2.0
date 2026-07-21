"use client";

import { useSales } from "@/app/(Business)/business/_hooks/use-sales";
import NewSaleModal from "@/app/(worker)/worker/_components/_sales/NewSaleModal";
import ChatPage from "@/components/chat/ChatComponent";
import MotionPage from "@/components/MotionPage";
import { MotionStagger, MotionStaggerItem } from "@/components/MotionStagger";
import { OfflineAccessCard } from "@/components/OfflineAccessCard";
import { OfflineWorkerBanner } from "@/components/OfflineWorkerBanner";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { SyncStatusBar } from "@/components/SyncStatusBar";
import { Button } from "@/components/ui/button";
import { GET_STORES } from "@/graphql/store.gql";
import { GET_WORKER_DASHBOARD, GET_WORKER_PROFILE } from "@/graphql/worker.gql";
import { useOfflinePOS } from "@/hooks/use-offline-pos";
import { getActiveOfflineSession, isOfflineMode, setActiveOfflineSession } from "@/lib/auth";
import { StoreEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import { useQuery } from "@apollo/client";
import { DollarSign, Package, Plus, ShoppingCart, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import InventoryPage from "./_components/InventoryPage";
import LowStockAlerts from "./_components/LowStockAlerts";
import PosPage from "./_components/PosPage";
import ProfilePage from "./_components/ProfilePage";
import ReportsPage from "./_components/ReportsPage";
import ShiftsPage from "./_components/ShiftsPage";
import WorkerOrdersPage from "./_components/WorkerOrdersPage";
import { useWorkerLayout } from "./WorkerLayout";

export default function WorkerPage() {
  const { user, loading: authLoading, role, isOfflineSession } = useMe();
  const { activeSection, selectedStoreId, setSelectedStoreId } =
    useWorkerLayout();
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const offlineSession = isOfflineMode() ? getActiveOfflineSession() : null;
  const isOfflineAuthenticated = Boolean(offlineSession);

  const fallbackStores = useMemo(() => {
    if (!offlineSession) return [];
    return offlineSession.businessInfo.storeIds.map((storeId, index) => ({
      id: storeId,
      name: offlineSession.businessInfo.storeNames[index] || `Store ${index + 1}`,
    })) as StoreEntity[];
  }, [offlineSession]);

  const handleOfflineLogout = () => {
    setActiveOfflineSession(null);
    window.location.href = "/login";
  };

  const handleReconnect = () => {
    // Clear offline session and redirect to login for online auth
    setActiveOfflineSession(null);
    window.location.href = "/login";
  };

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError,
  } = useQuery(GET_STORES, {
    skip: isOfflineAuthenticated || !user?.id,
  });

  const { data: workerProfileData } = useQuery(GET_WORKER_PROFILE, {
    variables: { id: user?.id },
    skip: !user?.id || isOfflineAuthenticated,
  });

  const workerBusinessId = workerProfileData?.worker?.business?.id;

  const storeOptions = useMemo(() => {
    if (isOfflineAuthenticated) return fallbackStores;
    return storesData?.stores ?? [];
  }, [fallbackStores, isOfflineAuthenticated, storesData?.stores]);

  useEffect(() => {
    if (!selectedStoreId) {
      const firstStoreId = storeOptions[0]?.id;
      if (firstStoreId) {
        setSelectedStoreId(firstStoreId);
      }
    }
  }, [selectedStoreId, setSelectedStoreId, storeOptions]);

  const { createSale } = useSales(
    selectedStoreId || "",
    user?.id || "",
    role || "",
  );

  const {
    isOnline,
    pendingCount,
    syncStatus,
    lastSyncTime,
    conflicts,
    syncPendingOperations,
  } = useOfflinePOS(
    selectedStoreId || "",
    user?.id || "",
    role || "",
  );

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboardData
  } = useQuery(GET_WORKER_DASHBOARD, {
    variables: {
      workerId: user?.id,
      storeId: selectedStoreId,
    },
    skip: !user?.id || !selectedStoreId || isOfflineAuthenticated,
  });

//   console.log(dashboardData?.workerDashboard);

  if (authLoading || (dashboardLoading && !isOfflineAuthenticated) || !selectedStoreId || (storesLoading && !isOfflineAuthenticated))
    return <DashboardSkeleton statCount={4} showChart={false} showTable={false} />;
  if (!isOfflineAuthenticated && (dashboardError || storesError))
    return (
      <div>
        Error loading dashboard:{" "}
        {dashboardError?.message || storesError?.message}
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Worker Access Required</h1>
          <p className="text-muted-foreground mt-2">
            You need to be logged in as a worker to access this panel.
          </p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => (window.location.href = "/login")}
          >
            Log In
          </Button>
        </div>
      </div>
    );

  return (
    <MotionPage className="space-y-6">
      {/* Dashboard Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="mt-2">
          <h1 className="text-page-title">Worker Dashboard</h1>
          <p className="text-page-subtitle">
            Welcome back, {user.fullName}. Manage your daily operations and
            performance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            title="selected store ID"
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full sm:w-72 p-2 border hover:border-primary  rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {storeOptions.map((store: StoreEntity) => (
              <option key={store.id} value={store.id}>
                {store.name} {store.address ? `• ${store.address}` : ""}
              </option>
            ))}
          </select>

          <Button
            variant="default"
            size="lg"
            onClick={() => setShowNewSaleModal(true)}
            disabled={!selectedStoreId}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* New Sale Modal */}
      <NewSaleModal
        isOpen={showNewSaleModal}
        onClose={() => setShowNewSaleModal(false)}
        onCreateSale={createSale}
        storeId={selectedStoreId || ""}
        userRole={role || ""}
        userId={user?.id || ""}
      />

      {/* Offline Worker Banner — shown when in offline session */}
      {offlineSession && (
        <OfflineWorkerBanner
          session={offlineSession}
          isOnline={isOnline}
          pendingCount={pendingCount}
          lastSyncTime={lastSyncTime}
          onReconnect={handleReconnect}
          onLogout={handleOfflineLogout}
        />
      )}

      {!offlineSession && (
        <OfflineAccessCard workerId={user?.id} />
      )}

      {/* Sync Status Bar */}
      <SyncStatusBar
        isOnline={isOnline}
        pendingCount={pendingCount}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        conflictCount={conflicts.length}
        onSyncNow={syncPendingOperations}
      />

      {/* Quick Stats */}
      <MotionStagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MotionStaggerItem>
          <div className="bg-card border border-border rounded-lg p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-stat-label">Today's Sales</p>
                <p className="text-stat">
                  $
                  {dashboardData?.workerDashboard?.todaySales?.toFixed(2) ||
                    "0.00"}
                </p>
              </div>
            </div>
          </div>
        </MotionStaggerItem>

        <MotionStaggerItem>
          <div className="bg-card border border-border rounded-lg p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-stat-label">Today's Orders</p>
                <p className="text-stat">
                  {dashboardData?.workerDashboard?.todayOrders || 0}
                </p>
              </div>
            </div>
          </div>
        </MotionStaggerItem>

        <MotionStaggerItem>
          <div className="bg-card border border-border rounded-lg p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-stat-label">Low Stock Items</p>
                <p className="text-stat">
                  {dashboardData?.workerDashboard?.lowStockItems || 0}
                </p>
              </div>
            </div>
          </div>
        </MotionStaggerItem>

        <MotionStaggerItem>
          <div className="bg-card border border-border rounded-lg p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-stat-label">Active Chats</p>
                <p className="text-stat">
                  {dashboardData?.workerDashboard?.activeChats || 0}
                </p>
              </div>
            </div>
          </div>
        </MotionStaggerItem>
      </MotionStagger>

      {/* Low Stock Alerts */}
      <LowStockAlerts storeId={selectedStoreId || ""} />

      {/* Main Content */}
      <div>
        {activeSection === "orders" && workerBusinessId && (
          <WorkerOrdersPage businessId={workerBusinessId} />
        )}
        {activeSection === "pos" && (
          <PosPage
            selectedStoreId={selectedStoreId}
            retchDashData={refetchDashboardData}
          />
        )}
        {activeSection === "inventory" && (
          <InventoryPage selectedStoreId={selectedStoreId} />
        )}
        {activeSection === "shifts" && (
          <ShiftsPage selectedStoreId={selectedStoreId} />
        )}
        {/* {activeSection === "chats" && <ChatsPage />} */}
        {activeSection === "chats" && <ChatPage />}
        {activeSection === "reports" && (
          <ReportsPage selectedStoreId={selectedStoreId} />
        )}
        {activeSection === "profile" && <ProfilePage />}
      </div>
    </MotionPage>
  );
}
