"use client";

import { useQuery } from "@apollo/client";
import {
    BarChart,
    ClipboardList,
    Clock,
    LogOut,
    Menu,
    MessageSquare,
    MoonIcon,
    Package,
    Settings,
    ShoppingCart,
    SunIcon,
    X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";
import NotificationsPopover from "@/components/seraui/Notifications";
import SidebarPageSkeleton from "@/components/skeletons/SidebarPageSkeleton";
import { Button } from "@/components/ui/button";
import { GET_STORES } from "@/graphql/store.gql";
import { GET_WORKER_PROFILE } from "@/graphql/worker.gql";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { usePusherNotifications } from "@/hooks/usePusherNotifications";
import { logout } from "@/lib/auth";
import { useMe } from "@/lib/useMe";
import { cn } from "@/lib/utils";

const workerSideLinks = [
  { section: "pos", icon: ShoppingCart, label: "Point of Sale" },
  { section: "orders", icon: ClipboardList, label: "Orders" },
  { section: "inventory", icon: Package, label: "Inventory" },
  { section: "shifts", icon: Clock, label: "Shifts" },
  { section: "chats", icon: MessageSquare, label: "Chats" },
  { section: "reports", icon: BarChart, label: "Reports" },
  { section: "profile", icon: Settings, label: "Profile" },
];

interface WorkerLayoutProps {
  children: React.ReactNode;
}

type WorkerSection =
  | "pos"
  | "orders"
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<WorkerSection>("pos");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    const storedSection =
      typeof window !== "undefined"
        ? window.localStorage.getItem("workerActiveSection")
        : null;

    if (
      storedSection === "pos" ||
      storedSection === "orders" ||
      storedSection === "inventory" ||
      storedSection === "shifts" ||
      storedSection === "chats" ||
      storedSection === "reports" ||
      storedSection === "profile"
    ) {
      setActiveSection(storedSection);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("workerActiveSection", activeSection);
    }
  }, [activeSection]);

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
  const { theme, setTheme } = useTheme();

  usePusherNotifications({
    role: "worker",
    userId: user?.id,
    businessId: workerData?.worker?.business?.id,
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!selectedStoreId && storesData?.stores?.length > 0) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (authLoading || workerLoading || storesLoading)
    return <SidebarPageSkeleton navItems={6} contentVariant="cards" />;
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
          className="md:hidden fixed top-4 left-4 z-50 bg-card border border-border shadow-sm"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col h-screen transform transition-transform duration-200 ease-out md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Worker Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {worker?.avatar ? (
                <img
                  src={worker.avatar}
                  alt={worker.fullName}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {worker?.fullName?.charAt(0) || "W"}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-semibold text-sm text-foreground truncate">{worker?.fullName}</h2>
                <p className="text-xs text-muted-foreground">{worker?.role}</p>
              </div>
            </div>

            {worker?.business && (
              <div className="mt-3 p-2.5 bg-muted/50 rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Business</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{worker.business.name}</p>
              </div>
            )}

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-amber-500")} />
                <span className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</span>
                {syncing && (
                  <div className="w-3 h-3 border-[1.5px] border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <NotificationsPopover />
                <Button
                  onClick={toggleTheme}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-3.5 w-3.5" />
                  ) : (
                    <MoonIcon className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-0.5">
            {workerSideLinks.map((item) => {
              const isActive = activeSection === item.section;
              return (
                <button
                  type="button"
                  key={item.section}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm transition-colors text-left",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  onClick={() => {
                    setActiveSection(item.section as WorkerSection);
                    setIsSidebarOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border">
            <button
              type="button"
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => {
                logout();
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</div>
        </div>
      </div>
    </WorkerLayoutContext.Provider>
  );
}
