// app/business/reports/page.tsx
"use client";

import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import { useQuery } from "@apollo/client";
import {
  BarChart3,
  Building,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { GET_STORES } from "@/graphql/store.gql";
import { useMe } from "@/lib/useMe";
import DailyClosing from "./_components/DailyClosing";
import FinancialSummary from "./_components/FinancialSummary";
import MultiStoreComparison from "./_components/MultiStoreComparison";
import WorkerPerformance from "./_components/WorkerPerformance";
import MotionPage from "@/components/MotionPage";

type ReportTab = "daily" | "financial" | "workers" | "stores";

const TABS: { key: ReportTab; label: string; icon: any; description: string }[] = [
  {
    key: "daily",
    label: "Daily Closing",
    icon: Calendar,
    description: "End-of-day summary with revenue, payments, and top products",
  },
  {
    key: "financial",
    label: "Financial",
    icon: DollarSign,
    description: "Revenue trends, payment methods, and period comparisons",
  },
  {
    key: "workers",
    label: "Workers",
    icon: Users,
    description: "Worker rankings, shift efficiency, and sales per employee",
  },
  {
    key: "stores",
    label: "Store Comparison",
    icon: Building,
    description: "Side-by-side performance metrics across all stores",
  },
];

export default function BusinessReportsPage() {
  const { user, loading: authLoading } = useMe();
  const [activeTab, setActiveTab] = useState<ReportTab>("daily");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const {
    data: storesData,
    loading: storesLoading,
  } = useQuery(GET_STORES);

  useEffect(() => {
    if (storesData?.stores?.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  if (authLoading || storesLoading) return <DashboardSkeleton />;

  const stores = storesData?.stores || [];
  const selectedStore = stores.find((s: any) => s.id === selectedStoreId);
  const storeName = selectedStore?.name || "Store";

  // Store comparison tab doesn't need a store selector
  const needsStoreSelector = activeTab !== "stores";

  return (
    <MotionPage className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-page-title flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Business Reports
          </h1>
          <p className="text-page-subtitle">
            Analytics, performance metrics, and closing reports
          </p>
        </div>

        {needsStoreSelector && stores.length > 0 && (
          <select
            title="Select store"
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full sm:w-64 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {stores.map((store: any) => (
              <option key={store.id} value={store.id}>
                {store.name} {store.address ? `• ${store.address}` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* No stores fallback */}
      {stores.length === 0 ? (
        <EmptyState
          icon={emptyStateIcons.stores}
          title="No Stores Found"
          description="Create a store to start generating reports."
        />
      ) : (
        <>
          {activeTab === "daily" && selectedStoreId && (
            <DailyClosing storeId={selectedStoreId} storeName={storeName} />
          )}

          {activeTab === "financial" && selectedStoreId && (
            <FinancialSummary storeId={selectedStoreId} storeName={storeName} />
          )}

          {activeTab === "workers" && selectedStoreId && (
            <WorkerPerformance storeId={selectedStoreId} storeName={storeName} />
          )}

          {activeTab === "stores" && <MultiStoreComparison />}
        </>
      )}
    </MotionPage>
  );
}
