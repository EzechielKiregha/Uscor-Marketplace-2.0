"use client";

import { useQuery } from "@apollo/client";
import {
    BarChart,
    Clock,
    LogOut,
    Menu,
    MessageSquare,
    MoonIcon,
    Package,
    Settings,
    ShoppingCart,
    SunIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";
import NotificationsPopover from "@/components/seraui/Notifications";
import SidebarPageSkeleton from "@/components/skeletons/SidebarPageSkeleton";
import { Button } from "@/components/ui/button";
import { GET_STORES } from "@/graphql/store.gql";
import { GET_WORKER_PROFILE } from "@/graphql/worker.gql";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { logout } from "@/lib/auth";
import { useMe } from "@/lib/useMe";
import { cn } from "@/lib/utils";

const workerSideLinks = [
  { section: "pos", icon: ShoppingCart, label: "Point of Sale" },
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

  useEffect(() => {
    const storedSection =
      typeof window !== "undefined"
        ? window.localStorage.getItem("workerActiveSection")
        : null;

    if (
      storedSection === "pos" ||
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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!selectedStoreId && storesData?.stores?.length > 0) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Handle loading and error states after all hooks are called
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
                  {/* {storesData?.stores && storesData.stores.length > 1 && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div className="">
                          <label className="block text-sm font-medium mb-1">
                            Select Store
                          </label>
                          <select
                            value={selectedStoreId || ""}
                            onChange={(e) => setSelectedStoreId(e.target.value)}
                            className="p-2 border border-border rounded-md w-full bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                  )} */}
                </div>
              )}

              {/* Online Status */}
              {/* <div className="mt-3 flex items-center gap-2 p-2 bg-muted rounded-lg"> */}
              {syncing && (
                <div className="w-3 h-3 my-2 border-2 p-2 border-primary border-t-transparent rounded-full animate-spin ml-auto"></div>
              )}
              {/* </div> */}
              <div className="flex mt-3 flex-row justify-between gap-2 p-2 bg-muted rounded-lg">
                <div className=" flex items-center ">
                  <div
                    className={`w-3 h-3 rounded-full ${isOnline ? "bg-success" : "bg-warning"}`}
                  ></div>
                  <span className="text-base">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="flex justify-end">
                  {/* Notifications Popover */}
                  <NotificationsPopover />
                  <Button
                    onClick={toggleTheme}
                    variant="ghost"
                    size="sm"
                    className="text-sm cursor-pointer font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <SunIcon className="h-5 w-5" />
                    ) : (
                      <MoonIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2">
              <div className="space-y-1">
                {workerSideLinks.map((item) => {
                  const isActive = activeSection === item.section;
                  return (
                    <Button
                      key={item.section}
                      className={cn(
                        `flex justify-start border-b-0 border-orange-700 w-full px-4 py-2 gap-1.5 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]`,
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground",
                      )}
                      variant={isActive ? "ghost" : "ghost"}
                      onClick={() => {
                        setActiveSection(item.section as WorkerSection);
                        setIsSidebarOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  logout()
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
