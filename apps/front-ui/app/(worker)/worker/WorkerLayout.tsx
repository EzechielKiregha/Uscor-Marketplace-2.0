"use client";

import { useQuery } from "@apollo/client";
import {
  BarChart,
  Clock,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import Loader from "@/components/seraui/Loader";
import { Button } from "@/components/ui/button";
import { GET_STORES } from "@/graphql/store.gql";
import { GET_WORKER_PROFILE } from "@/graphql/worker.gql";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import type { StoreEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";

interface WorkerLayoutProps {
  children: React.ReactNode;
}

type WorkerSection =
  | "pos"
  | "inventory"
  | "shifts"
  | "chats"
  | "reports"
  | "profile";

interface WorkerLayoutContextValue {
  activeSection: WorkerSection;
  setActiveSection: React.Dispatch<React.SetStateAction<WorkerSection>>;
  selectedStoreId: string | null;
  setSelectedStoreId: React.Dispatch<React.SetStateAction<string | null>>;
}

const WorkerLayoutContext = createContext<WorkerLayoutContextValue | null>(
  null,
);

export function useWorkerLayout() {
  const context = useContext(WorkerLayoutContext);
  if (!context) {
    throw new Error("useWorkerLayout must be used within WorkerLayoutContext");
  }
  return context;
}

export default function WorkerLayout({ children }: WorkerLayoutProps) {
  const { user, loading: authLoading } = useMe();
  // const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<WorkerSection>("pos");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Always call all hooks at the top level, regardless of conditions
  const {
    data: storesData,
    loading: storesLoading,
    error: storesError,
  } = useQuery(GET_STORES);
  const {
    data: workerData,
    loading: workerLoading,
    error: workerError,
  } = useQuery(GET_WORKER_PROFILE, {
    variables: { id: user?.id },
    skip: !user?.id,
  });
  const { isOnline, syncing } = useIndexedDB();

  useEffect(() => {
    if (!selectedStoreId && storesData?.stores?.length > 0) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  // Handle loading and error states after all hooks are called
  if (authLoading || workerLoading || storesLoading)
    return <Loader loading={true} />;
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
  if (workerError || storesError)
    return (
      <div>
        Error loading worker profile:{" "}
        {workerError?.message || storesError?.message}
      </div>
    );

  const worker = workerData?.worker;

  return (
    <WorkerLayoutContext.Provider
      value={{
        activeSection,
        setActiveSection,
        selectedStoreId,
        setSelectedStoreId,
      }}
    >
      <div className="min-h-screen bg-background flex">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sidebar */}
        <div
          className={`
        fixed md:relative
        inset-y-0 left-0 z-40
        w-64 bg-card border-r border-border
        transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out
        md:translate-x-0
      `}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {worker?.avatar ? (
                  <img
                    src={worker.avatar}
                    alt={worker.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {worker?.fullName?.charAt(0) || "W"}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">{worker?.fullName}</h2>
                  <p className="text-xs text-muted-foreground">
                    {worker?.role}
                  </p>
                </div>
              </div>

              {worker?.business && (
                <div className="mt-3 p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Business</p>
                  <p className="font-medium">{worker.business.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {worker.business.businessType === "ARTISAN" &&
                      "🎨 Artisan & Handcrafted Goods"}
                    {worker.business.businessType === "BOOKSTORE" &&
                      "📚 Bookstore & Stationery"}
                    {worker.business.businessType === "ELECTRONICS" &&
                      "🔌 Electronics & Gadgets"}
                    {worker.business.businessType === "HARDWARE" &&
                      "🔨 Hardware & Tools"}
                    {worker.business.businessType === "GROCERY" &&
                      "🛒 Grocery & Convenience"}
                    {worker.business.businessType === "CAFE" &&
                      "☕ Café & Coffee Shops"}
                    {worker.business.businessType === "RESTAURANT" &&
                      "🍽️ Restaurant & Dining"}
                    {worker.business.businessType === "RETAIL" &&
                      "🏬 Retail & General Stores"}
                    {worker.business.businessType === "BAR" && "🍷 Bar & Pub"}
                    {worker.business.businessType === "CLOTHING" &&
                      "👕 Clothing & Accessories"}
                  </p>

                  {/* Store Selection */}
                  {storesData?.stores && storesData.stores.length > 1 && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Select Store
                          </label>
                          <select
                            value={selectedStoreId || ""}
                            onChange={(e) => setSelectedStoreId(e.target.value)}
                            className="p-2 border border-border rounded-md"
                          >
                            <option value="">Select a store</option>
                            {storesData?.stores.map((store: StoreEntity) => (
                              <option key={store.id} value={store.id}>
                                {store.name} - {store.address}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Online Status */}
              <div className="mt-3 flex items-center gap-2 p-2 bg-muted rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${isOnline ? "bg-success" : "bg-warning"}`}
                ></div>
                <span className="text-xs">
                  {isOnline ? "Online" : "Offline"}
                </span>
                {syncing && (
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto"></div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2">
              <div className="space-y-1">
                <Button
                  variant={activeSection === "pos" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("pos");
                    setIsSidebarOpen(false);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Point of Sale
                </Button>

                <Button
                  variant={
                    activeSection === "inventory" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("inventory");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </Button>

                <Button
                  variant={activeSection === "shifts" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("shifts");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Shifts
                </Button>

                <Button
                  variant={activeSection === "chats" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("chats");
                    setIsSidebarOpen(false);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chats
                </Button>

                <Button
                  variant={activeSection === "reports" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("reports");
                    setIsSidebarOpen(false);
                  }}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Reports
                </Button>

                <Button
                  variant={activeSection === "profile" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("profile");
                    setIsSidebarOpen(false);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // In a real app, this would handle logout
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                  window.location.href = "/login";
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </div>
      </div>
    </WorkerLayoutContext.Provider>
  );
}
