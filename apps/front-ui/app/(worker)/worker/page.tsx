"use client";

import { useQuery } from "@apollo/client";
import { DollarSign, Package, Plus, ShoppingCart, Users } from "lucide-react";
import Loader from "@/components/seraui/Loader";
import { Button } from "@/components/ui/button";
import { GET_WORKER_DASHBOARD } from "@/graphql/worker.gql";
import { useMe } from "@/lib/useMe";
import ChatsPage from "./_components/ChatsPage";
import InventoryPage from "./_components/InventoryPage";
import PosPage from "./_components/PosPage";
import ProfilePage from "./_components/ProfilePage";
import ReportsPage from "./_components/ReportsPage";
import ShiftsPage from "./_components/ShiftsPage";
import { useWorkerLayout } from "./WorkerLayout";
import { useEffect, useState } from "react";
import { GET_STORES } from "@/graphql/store.gql";
import NewSaleModal from "@/app/(Business)/business/sales/_components/NewSaleModal";
import { StoreEntity } from "@/lib/types";
import { useSales } from "@/app/(Business)/business/_hooks/use-sales";
import ClientChatsPage from "@/app/(Client)/client/_components/ClientChatPage";

export default function WorkerPage() {
  const { user, loading: authLoading, role } = useMe();
  const { activeSection, selectedStoreId, setSelectedStoreId } =
    useWorkerLayout();
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError,
  } = useQuery(GET_STORES);

  useEffect(() => {
    if (!selectedStoreId && storesData?.stores?.length > 0) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  const { createSale } = useSales(
    selectedStoreId || "",
    user?.id || "",
    role || "",
  );

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useQuery(GET_WORKER_DASHBOARD, {
    variables: {
      workerId: user?.id,
      storeId: selectedStoreId,
    },
    skip: !user?.id || !selectedStoreId,
  });

  if (authLoading || dashboardLoading || !selectedStoreId || storesLoading)
    return <Loader loading={true} />;
  if (dashboardError || storesError)
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
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="mt-2">
          <h1 className="text-2xl font-bold">Worker Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.fullName}. Manage your daily operations and
            performance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            title="selected store ID"
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full sm:w-72 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {storesData.stores.map((store: StoreEntity) => (
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Sales</p>
              <p className="text-xl font-bold">
                $
                {dashboardData?.workerDashboard?.todaySales?.toFixed(2) ||
                  "0.00"}
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
              <p className="text-sm text-muted-foreground">Today's Orders</p>
              <p className="text-xl font-bold">
                {dashboardData?.workerDashboard?.todayOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-xl font-bold">
                {dashboardData?.workerDashboard?.lowStockItems || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Chats</p>
              <p className="text-xl font-bold">
                {dashboardData?.workerDashboard?.activeChats || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {activeSection === "pos" && (
          <PosPage selectedStoreId={selectedStoreId} />
        )}
        {activeSection === "inventory" && (
          <InventoryPage selectedStoreId={selectedStoreId} />
        )}
        {activeSection === "shifts" && (
          <ShiftsPage selectedStoreId={selectedStoreId} />
        )}
        {/* {activeSection === "chats" && <ChatsPage />} */}
        {activeSection === "chats" && <ClientChatsPage />}
        {activeSection === "reports" && (
          <ReportsPage selectedStoreId={selectedStoreId} />
        )}
        {activeSection === "profile" && <ProfilePage />}
      </div>
    </div>
  );
}
