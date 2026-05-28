"use client";

import Loader from "@/components/seraui/Loader";
import { Button } from "@/components/ui/button";
import {
  GET_REPORT_HISTORY,
  GET_STORES,
  ON_WORKER_ADDED_TO_STORE,
  ON_WORKER_REMOVED_FROM_STORE,
} from "@/graphql/store.gql";
import { useMe } from "@/lib/useMe";
import { useQuery, useSubscription } from "@apollo/client";
import {
  ArrowRight,
  Building2,
  Clock,
  Download,
  Package,
  Plus,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateStoreModal from "../_components/modals/CreateStoreModal";
import { useOpenCreateStoreModal } from "../_hooks/use-open-create-store-modal";
import AddWorkerModal from "./[storeId]/_components/AddWorkerModal";
import { useOpenAddWorkerModal } from "./[storeId]/_hooks/use-open-add-worker-modal";
import { ReportHistory } from "./[storeId]/report/_components/ReportHistory";
import StoreCard from "./_components/StoreCard";

export default function StoresPage() {
  const { user, role, loading: authLoading } = useMe();
  const { isOpen: isAddOpen, setIsOpen: setIsAddOpen } =
    useOpenAddWorkerModal();
  const { isOpen, setIsOpen } = useOpenCreateStoreModal();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const router = useRouter();

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError,
    refetch,
  } = useQuery(GET_STORES, {
    skip: !user?.id,
  });

  const stores = storesData?.stores || [];

  const { data, loading } = useQuery(GET_REPORT_HISTORY, {
    variables: { storeId: selectedStoreId },
  });

  // Auto-select first store if none selected
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
      setSelectedStore(stores[0]);
    }
  }, [stores, selectedStoreId]);

  useSubscription(ON_WORKER_ADDED_TO_STORE, {
    variables: {
      storeId: selectedStoreId,
    },
    onData: ({ data }) => {
      refetch();
    },
  });
  useSubscription(ON_WORKER_REMOVED_FROM_STORE, {
    variables: {
      storeId: selectedStoreId,
    },
    onData: ({ data }) => {
      refetch();
    },
  });

  if (authLoading || storesLoading) return <Loader loading={true} />;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Business Access Required</h1>
          <p className="text-muted-foreground mt-2">
            You need to be logged in as a business owner to access this page.
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
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store & Worker Management</h1>
        <p className="text-muted-foreground">
          Manage your stores, workers, and operational performance
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() =>
              setIsOpen({ openCreateStoreModal: true, initialStoreData: null })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>

          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>

          <Button
            variant="default"
            onClick={() =>
              router.push(`/business/stores/${selectedStoreId}/report`)
            }
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value || null)}
            className="p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Stores</option>
            {stores.map((store: any) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-3">
        {stores.map((store: any) => (
          <StoreCard
            key={store.id}
            store={store}
            workers={store.workers}
            onSelect={() => {
              setSelectedStoreId(store.id);
              setSelectedStore(store);
            }}
            isSelected={selectedStoreId === store.id}
            onEdit={() => {
              console.log("edit clicked");
              setIsOpen({
                openCreateStoreModal: true,
                initialStoreData: store,
              });
            }}
            onManage={() => {
              router.push(`/business/stores/${selectedStoreId}`);
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {stores.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Stores Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first store to start managing workers and operations.
            Perfect for artisans, wood workers, and local retailers to expand
            their presence.
          </p>
          <Button
            variant="default"
            onClick={() =>
              setIsOpen({
                openCreateStoreModal: true,
                initialStoreData: null,
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Store
          </Button>
        </div>
      )}

      {/* Selected Store Details */}
      {selectedStoreId && selectedStore && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
            <h2 className="font-semibold">Store: {selectedStore.name}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStoreId(null);
                setSelectedStore(null);
              }}
            >
              Clear Selection
            </Button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Workers</p>
                    <p className="text-xl font-bold">
                      {selectedStore?.workers?.length}
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
                    <p className="text-sm text-muted-foreground">
                      Today's Sales
                    </p>
                    <p className="text-xl font-bold">
                      $
                      {selectedStore.dailyStats?.todaySales?.toFixed(2) ||
                        "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Low Stock Items
                    </p>
                    <p className="text-xl font-bold">
                      {selectedStore.inventoryStats?.lowStockItems || 0}
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
                      Active Shifts
                    </p>
                    <p className="text-xl font-bold">
                      {selectedStore.shiftsStats?.activeShifts || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Workers */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Store Workers
                </h3>
                <Button
                  variant="default"
                  onClick={() =>
                    setIsAddOpen({
                      openAddWorkerModal: true,
                      storeId: selectedStoreId!,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
              </div>

              <div className="divide-y divide-border">
                {selectedStore?.workers?.map((worker: any) => (
                  <div
                    key={worker.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/business/stores/${selectedStoreId}/workers/${worker.id}`)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {worker.avatar ? (
                          <img
                            src={worker.avatar}
                            alt={worker.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                            {worker.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{worker.fullName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {worker.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Sales Today
                          </p>
                          <p className="font-bold">
                            ${worker.todaySales?.toFixed(2) || "0.00"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Shift Status
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              worker.currentShift
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            }`}
                          >
                            {worker.currentShift ? "Active" : "Off"}
                          </span>
                        </div>

                        <Button variant="outline" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
          <h2 className="font-semibold">
            View All Repports: {selectedStore.name}
          </h2>
          <Button
            variant="default"
            onClick={() =>
              router.push(`/business/stores/${selectedStoreId}/report`)
            }
          >
            <Download className="h-4 w-4 mr-2" />
            Generate new reports
          </Button>
        </div>
        {data?.reportHistory.length > 0 ? (
          <div className="p-4">
            <ReportHistory reports={data?.reportHistory} />
          </div>
        ) : (
          <div className="flex justify-center p-6 item-center">
            <p className="text-muted-foreground">
              No reports generated for this store
            </p>
          </div>
        )}
      </div>

      {/* Create Store Modal */}
      <CreateStoreModal />
      {/* Add Worker Modal */}
      <AddWorkerModal
        isOpen={isAddOpen}
        onClose={() =>
          setIsAddOpen({ openAddWorkerModal: false, storeId: null })
        }
        storeId={selectedStoreId!}
        businessId={user ? user.id : ""}
      />
    </div>
  );
}
