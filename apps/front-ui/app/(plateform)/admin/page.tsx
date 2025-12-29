// app/admin/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  GET_PLATFORM_DASHBOARD,
  GET_USERS,
  GET_DISPUTES,
  GET_ANNOUNCEMENTS,
  GET_AUDIT_LOGS,
  ON_NEW_USER,
  ON_NEW_DISPUTE,
  ON_KYC_SUBMITTED,
  ON_PLATFORM_SETTINGS_UPDATED
} from '@/graphql/admin.gql';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  ShieldCheck,
  AlertTriangle,
  Megaphone,
  Settings,
  BarChart,
  Activity,
  Loader2,
  LogOut,
  Search,
  SidebarOpen,
  SidebarClose,
  X,
  Menu
} from 'lucide-react';
import Loader from '@/components/seraui/Loader';
import DashboardOverview from './_components/DashboardOverview';
import UserManagement from './_components/UserManagement';
import DisputeResolution from './_components/DisputeResolution';
import PlatformSettings from './_components/PlatformSettings';
import AnnouncementManagement from './_components/AnnouncementManagement';
import AuditLogs from './_components/AuditLogs';
import { useMe } from '@/lib/useMe';
import { logout } from "@/lib/auth";
import SideBar, { sidebarItems } from './_components/SideBar';
import { useActiveSection } from './_components/useActiveSection';
import { useSearchParams } from 'next/navigation';
import UserDropdown from '@/components/seraui/UserDrodown';

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useMe();
  const params = useSearchParams();
  const activeSectionParam = params.get('section');
  const activeSection = activeSectionParam ? activeSectionParam as 'dashboard' | 'users' | 'disputes' | 'settings' | 'announcements' | 'audit' : 'dashboard';
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const { handleActiveSectionChange } = useActiveSection();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery(GET_PLATFORM_DASHBOARD);

  // Handle real-time updates
  useSubscription(ON_NEW_USER, {
    onData: ({ data }) => {
      refetchDashboard();
    }
  });

  useSubscription(ON_NEW_DISPUTE, {
    onData: ({ data }) => {
      refetchDashboard();
    }
  });

  useSubscription(ON_KYC_SUBMITTED, {
    onData: ({ data }) => {
      refetchDashboard();
    }
  });

  useSubscription(ON_PLATFORM_SETTINGS_UPDATED, {
    onData: ({ data }) => {
      refetchDashboard();
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }

  if (authLoading) return <Loader loading={true} />;
  if (!user || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You must be an administrator to access this dashboard.</p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => window.location.href = '/login'}
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
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
                  onClick={() => toggleSidebar && toggleSidebar()}
                  aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {isSidebarOpen ? <SidebarClose className="h-5 w-5" /> : <SidebarOpen className="h-5 w-5" />}
                </Button>
                {/* Mobile menu button */}

                {!showMobileMenu && (
                  <div className="flex items-center  gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                      {isSidebarOpen ? <BarChart className="h-5 w-5" /> : <Menu onClick={() => setShowMobileMenu(!showMobileMenu)} className="h-5 w-5" />}
                    </div>
                    <h1 className="text-xl font-bold">USCOR Admin</h1>
                  </div>
                )}
              </div>
              <UserDropdown />
            </div>


            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                {activeSection === 'dashboard' && 'Platform Dashboard'}
                {activeSection === 'users' && 'User Management'}
                {activeSection === 'disputes' && 'Dispute Resolution'}
                {activeSection === 'settings' && 'Platform Settings'}
                {activeSection === 'announcements' && 'Announcement Management'}
                {activeSection === 'audit' && 'Audit Logs'}
              </h1>
              <p className="text-muted-foreground">
                {activeSection === 'dashboard' && 'Overview of platform metrics and activity'}
                {activeSection === 'users' && 'Manage all users and businesses on the platform'}
                {activeSection === 'disputes' && 'Resolve customer disputes and issues'}
                {activeSection === 'settings' && 'Configure platform rules and settings'}
                {activeSection === 'announcements' && 'Create and manage platform announcements'}
                {activeSection === 'audit' && 'View audit logs and system events'}
              </p>
            </div>

            {dashboardLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
              </div>
            ) : dashboardError ? (
              <div className="bg-card border border-destructive rounded-lg p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">Error Loading Dashboard</h3>
                <p className="text-muted-foreground mb-6">
                  {dashboardError.message}
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetchDashboard()}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {activeSection === 'dashboard' && <DashboardOverview metrics={dashboardData.platformMetrics} settings={dashboardData.platformSettings} />}
                {activeSection === 'users' && <UserManagement />}
                {activeSection === 'disputes' && <DisputeResolution />}
                {activeSection === 'settings' && <PlatformSettings settings={dashboardData.platformSettings} />}
                {activeSection === 'announcements' && <AnnouncementManagement />}
                {activeSection === 'audit' && <AuditLogs />}
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
              <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = ['dashboard', 'users', 'disputes', 'settings', 'announcements', 'audit'].includes(activeSection) && item.label.toLowerCase() === activeSection;
                return (
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    key={item.label}
                    onClick={() => {
                      handleActiveSectionChange(item.label.toLowerCase() as any);
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
    </div>
  );
}