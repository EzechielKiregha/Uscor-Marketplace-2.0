"use client";

import MotionPage from "@/components/MotionPage";
import UserDropdown from "@/components/seraui/UserDrodown";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
    GET_PLATFORM_DASHBOARD,
    ON_KYC_SUBMITTED,
    ON_NEW_DISPUTE,
    ON_NEW_USER,
    ON_PLATFORM_SETTINGS_UPDATED,
} from "@/graphql/admin.gql";
import { usePusherNotifications } from "@/hooks/usePusherNotifications";
import { useMe } from "@/lib/useMe";
import { useQuery, useSubscription } from "@apollo/client";
import {
    AlertTriangle,
    BarChart,
    Menu,
    MoonIcon,
    SidebarClose,
    SidebarOpen,
    SunIcon,
    X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import AnnouncementManagement from "./_components/AnnouncementManagement";
import AuditLogs from "./_components/AuditLogs";
import BusinessManagement from "./_components/BusinessManagement";
import DisputeResolution from "./_components/DisputeResolution";
import KycManagement from "./_components/KycManagement";
import KycVerificationModal from "./_components/KycVerificationModal";
import OrderFulfillment from "./_components/OrderFulfillment";
import PlatformDashboard from "./_components/PlatformDashboard";
import PlatformSettings from "./_components/PlatformSettings";
import SettlementManagement from "./_components/SettlementManagement";
import SideBar, { sidebarItems } from "./_components/SideBar";
import TokenDashboard from "./_components/TokenDashboard";
import { useActiveSection } from "./_components/useActiveSection";
import UserManagement from "./_components/UserManagement";
import WorkerManagement from "./_components/WorkerManagement";

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useMe();
  const params = useSearchParams();
  const activeSectionParam = params.get("section");
  const activeSection = activeSectionParam
    ? (activeSectionParam as
        | "dashboard"
        | "users"
        | "businesses"
        | "workers"
        | "kyc"
        | "tokens"
        | "orders"
        | "disputes"
        | "settings"
        | "settlements"
        | "announcements"
        | "audit")
    : "dashboard";
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const { handleActiveSectionChange } = useActiveSection();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { showToast } = useToast();
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery(GET_PLATFORM_DASHBOARD);

  // Handle real-time updates
  useSubscription(ON_NEW_USER, {
    onData: ({ data }) => {
      refetchDashboard();
    },
  });

  useSubscription(ON_NEW_DISPUTE, {
    onData: ({ data }) => {
      refetchDashboard();
    },
  });

  useSubscription(ON_KYC_SUBMITTED, {
    onData: ({ data }) => {
      refetchDashboard();
      showToast(
        "info",
        "New KYC Request",
        "A business has submitted KYC documents for verification",
      );
    },
  });

  const { theme, setTheme } = useTheme();

  // Pusher notifications for admin — orders, disputes, announcements
  usePusherNotifications({
    role: "admin",
    userId: user?.id,
    enabled: !!user?.id && role === "admin",
    onNotification: (notification) => {
      // Refetch dashboard data on relevant events
      if (
        notification.event === "order-ready-for-shipment" ||
        notification.event === "new-dispute" ||
        notification.event === "order-status-update"
      ) {
        refetchDashboard();
      }
    },
  });

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Handle real-time updates
  useSubscription(ON_NEW_USER, {
    onData: ({ data }) => {
      refetchDashboard();
    },
  });

  useSubscription(ON_NEW_DISPUTE, {
    onData: ({ data }) => {
      refetchDashboard();
    },
  });

  useSubscription(ON_KYC_SUBMITTED, {
    onData: ({ data }) => {
      refetchDashboard();
    },
  });

  useSubscription(ON_PLATFORM_SETTINGS_UPDATED, {
    onData: ({ data }) => {
      refetchDashboard();
    },
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (authLoading) return <DashboardSkeleton statCount={4} showChart={false} showTable={false} />;
  if (!user || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You must be an administrator to access this dashboard.
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
    <MotionPage className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation */}
        <SideBar isOpen={isSidebarOpen} selectedSection={activeSection} />

        {/* Main Content Area */}
        <div className=" flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Desktop sidebar toggle */}
            <div className="flex flex-col lg:flex-row justify-between mb-6">
              <div className="flex flex-row gap-3 justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:inline-flex mr-2"
                  onClick={() => toggleSidebar?.()}
                  aria-label={
                    isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                  }
                >
                  {isSidebarOpen ? (
                    <SidebarClose className="h-5 w-5" />
                  ) : (
                    <SidebarOpen className="h-5 w-5" />
                  )}
                </Button>
                {!isSidebarOpen ? (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                      <BarChart className="h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-bold">USCOR Admin</h1>
                  </>
                ) : null}
                {/* Mobile menu button */}

                {showMobileMenu && (
                  <div className="flex items-center gap-2 mb-6">
                    {isSidebarOpen ? (
                      <>
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                          <BarChart className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-bold">USCOR Admin</h1>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                          <Menu
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="h-5 w-5"
                          />
                        </div>
                        <h1 className="text-xl font-bold">USCOR Admin</h1>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-row items-center gap-4">
                <Button
                  onClick={toggleTheme}
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </Button>
                <UserDropdown />
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                {activeSection === "dashboard" && "Platform Dashboard"}
                {activeSection === "users" && "User Management"}
                {activeSection === "businesses" && "Business Management"}
                {activeSection === "workers" && "Worker Management"}
                {activeSection === "kyc" && "KYC Verification"}
                {activeSection === "tokens" && "Tokens & Wallets"}
                {activeSection === "orders" && "Order Fulfillment"}
                {activeSection === "settlements" && "Fund Distribution"}
                {activeSection === "disputes" && "Dispute Resolution"}
                {activeSection === "settings" && "Platform Settings"}
                {activeSection === "announcements" && "Announcement Management"}
                {activeSection === "audit" && "Audit Logs"}
              </h1>
              <p className="text-muted-foreground">
                {activeSection === "dashboard" &&
                  "Overview of platform metrics and activity"}
                {activeSection === "users" &&
                  "Manage all users and businesses on the platform"}
                {activeSection === "businesses" &&
                  "Verify, suspend, and manage registered businesses"}
                {activeSection === "workers" &&
                  "Overview of workers across all businesses"}
                {activeSection === "kyc" &&
                  "Review and verify KYC documents submitted by businesses"}
                {activeSection === "tokens" &&
                  "Monitor token circulation, wallet recharges, and revenue"}
                {activeSection === "orders" &&
                  "Manage order pickups, shipping, and delivery coordination"}
                {activeSection === "settlements" &&
                  "Distribute funds to businesses and track commissions"}
                {activeSection === "disputes" &&
                  "Resolve customer disputes and issues"}
                {activeSection === "settings" &&
                  "Configure platform rules and settings"}
                {activeSection === "announcements" &&
                  "Create and manage platform announcements"}
                {activeSection === "audit" &&
                  "View audit logs and system events"}
              </p>
            </div>

            {dashboardLoading ? (
              <DashboardSkeleton statCount={4} showChart showTable />
            ) : dashboardError ? (
              <div className="bg-card border border-destructive rounded-lg p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">
                  Error Loading Dashboard
                </h3>
                <p className="text-muted-foreground mb-6">
                  {dashboardError.message}
                </p>
                <Button variant="outline" onClick={() => refetchDashboard()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {activeSection === "dashboard" && (
                  <PlatformDashboard
                    metrics={dashboardData.platformMetrics}
                    settings={dashboardData.platformSettings}
                  />
                )}
                {activeSection === "users" && <UserManagement />}
                {activeSection === "businesses" && <BusinessManagement />}
                {activeSection === "workers" && <WorkerManagement />}
                {activeSection === "tokens" && (
                  <TokenDashboard
                    metrics={dashboardData.platformMetrics}
                    settings={dashboardData.platformSettings}
                  />
                )}
                {activeSection === "kyc" && (
                  <KycManagement
                    onKycSelected={(kyc) => {
                      setSelectedKyc(kyc);
                      setShowKycModal(true);
                    }}
                  />
                )}
                {activeSection === "orders" && <OrderFulfillment />}
                {activeSection === "settlements" && <SettlementManagement />}
                {activeSection === "disputes" && <DisputeResolution />}
                {activeSection === "settings" && (
                  <PlatformSettings settings={dashboardData.platformSettings} />
                )}
                {activeSection === "announcements" && (
                  <AnnouncementManagement />
                )}
                {activeSection === "audit" && <AuditLogs />}
              </>
            )}
          </div>
        </div>
        {showMobileMenu && (
          <div className="fixed inset-0 bg-background/90 z-50 md:hidden">
            <div className="container mx-auto px-4 py-8 flex justify-between items-center">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <BarChart className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold">USCOR Admin</h1>
              </div>
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive =
                  activeSection === item.section.toLowerCase();
                return (
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    key={item.label}
                    onClick={() => {
                      handleActiveSectionChange(
                        item.section.toLowerCase() as any,
                      );
                      setShowMobileMenu(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
      {/* KYC Verification Modal */}
      {showKycModal && selectedKyc && (
        <KycVerificationModal
          kyc={selectedKyc}
          isOpen={showKycModal}
          onClose={() => setShowKycModal(false)}
          onVerified={() => {
            refetchDashboard();
            setShowKycModal(false);
          }}
          onRejected={() => {
            refetchDashboard();
            setShowKycModal(false);
          }}
        />
      )}
    </MotionPage>
  );
}
