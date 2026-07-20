// app/client/page.tsx
"use client";

import { useQuery } from "@apollo/client";
import {
  BarChart3,
  Heart,
  Home,
  Menu,
  MessageSquare,
  RefreshCcw,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  User,
  Wallet,
  Wallet2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import MotionPage from "@/components/MotionPage";
import SidebarPageSkeleton from "@/components/skeletons/SidebarPageSkeleton";
import { Button } from "@/components/ui/button";
import { GET_CLIENT_PROFILE } from "@/graphql/client-panel.gql";
import { useMe } from "@/lib/useMe";
import { cn } from "@/lib/utils";
import ChatPage from "../../../components/chat/ChatComponent";
import CustomerStats from "./_components/CustomerStats";
import FavoriteStores from "./_components/FavoriteStores";
import LoyaltyDashboard from "./_components/LoyaltyDashboard";
import OrderHistory from "./_components/OrderHistory";
import ProfileOverview from "./_components/ProfileOverview";
import PurchaseHistory from "./_components/PurchaseHistory";
import Recommendations from "./_components/Recommendations";
import ReturnRequestForm from "./_components/ReturnRequestForm";
import ReviewsPage from "./_components/Reviews";
import SettingsPanel from "./_components/SettingsPanel";
import WarrantyTracker from "./_components/WarrantyTracker";
import WalletPage from "./wallet/page";

type ClientSection =
  | "profile"
  | "chat"
  | "orders"
  | "purchases"
  | "warranty"
  | "analytics"
  | "favorites"
  | "returns"
  | "loyalty"
  | "recommendations"
  | "reviews"
  | "wallet"
  | "settings";

type ClientSideLink = {
  section: ClientSection;
  icon: any;
  label: string;
};

const clientSideLinks: ClientSideLink[] = [
  { section: "profile", icon: User, label: "Profile" },
  { section: "orders", icon: ShoppingBag, label: "Order History" },
  { section: "purchases", icon: ShoppingCart, label: "Purchase History" },
  { section: "warranty", icon: Shield, label: "Warranty Tracker" },
  { section: "analytics", icon: BarChart3, label: "My Analytics" },
  { section: "favorites", icon: Heart, label: "Favorite Stores" },
  { section: "returns", icon: RefreshCcw, label: "Returns" },
  { section: "chat", icon: MessageSquare, label: "My Chats" },
  { section: "loyalty", icon: Star, label: "Loyalty Program" },
  { section: "recommendations", icon: Home, label: "Recommendations" },
  { section: "reviews", icon: MessageSquare, label: "Reviews" },
  { section: "wallet", icon: Wallet2, label: "Uscor Wallet" },
  { section: "settings", icon: Settings, label: "Account Settings" },
];

export default function ClientPanel() {
  const { user, loading: authLoading } = useMe();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ClientSection>("profile");

  useEffect(() => {
    const storedSection =
      typeof window !== "undefined"
        ? window.localStorage.getItem("clientActiveSection")
        : null;

    const validSections: ClientSection[] = [
      "profile", "chat", "orders", "purchases", "warranty",
      "analytics", "favorites", "returns", "loyalty",
      "recommendations", "reviews", "wallet", "settings",
    ];
    if (storedSection && validSections.includes(storedSection as ClientSection)) {
      setActiveSection(storedSection as ClientSection);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("clientActiveSection", activeSection);
    }
  }, [activeSection]);

  const {
    data: clientData,
    loading: clientLoading,
    error: clientError,
  } = useQuery(GET_CLIENT_PROFILE, {
    variables: { id: user?.id },
    skip: !user?.id,
  });

  if (authLoading || clientLoading) return <SidebarPageSkeleton navItems={13} contentVariant="profile" />;
  if (clientError)
    return <div>Error loading client data: {clientError.message}</div>;
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-page-title">Client Access Required</h1>
          <p className="text-muted-foreground mt-2">
            You need to be logged in as a customer to access this panel.
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
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-[4.5rem] left-4 z-50 bg-card border border-border shadow-sm"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 md:top-0 inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200 ease-out md:translate-x-0 h-screen md:h-auto md:min-h-[calc(100vh-3.5rem)]",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile close */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">My Account</span>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {clientSideLinks.map((item) => {
            const isActive = activeSection === item.section;
            const Icon = item.icon;
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
                  setActiveSection(item.section);
                  setIsSidebarOpen(false);
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-3 border-t border-border space-y-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
            onClick={() => (window.location.href = "/client/wallet")}
          >
            <Wallet className="h-3.5 w-3.5 mr-2" />
            My Wallet
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
            onClick={() => (window.location.href = "/marketplace")}
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-2" />
            Browse Marketplace
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
            onClick={() => (window.location.href = "/all-businesses?verified=true")}
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-2" />
            Verified Businesses
          </Button>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <MotionPage className="space-y-6">
            {activeSection === "profile" && (
              <ProfileOverview client={clientData.client} />
            )}
            {activeSection === "chat" && <ChatPage />}
            {activeSection === "orders" && (
              <OrderHistory client={clientData.client} />
            )}
            {activeSection === "purchases" && (
              <PurchaseHistory client={clientData.client} />
            )}
            {activeSection === "warranty" && (
              <WarrantyTracker client={clientData.client} />
            )}
            {activeSection === "analytics" && (
              <CustomerStats client={clientData.client} />
            )}
            {activeSection === "favorites" && (
              <FavoriteStores client={clientData.client} />
            )}
            {activeSection === "returns" && (
              <ReturnRequestForm client={clientData.client} />
            )}
            {activeSection === "loyalty" && (
              <LoyaltyDashboard client={clientData.client} />
            )}
            {activeSection === "recommendations" && (
              <Recommendations client={clientData.client} />
            )}
            {activeSection === "reviews" && (
              <ReviewsPage client={clientData.client} />
            )}
            {activeSection === "wallet" && <WalletPage />}
            {activeSection === "settings" && (
              <SettingsPanel client={clientData.client} />
            )}
          </MotionPage>
        </div>
      </div>
    </div>
  );
}
