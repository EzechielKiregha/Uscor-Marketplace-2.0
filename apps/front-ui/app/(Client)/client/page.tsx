// app/client/page.tsx
"use client";

import { useQuery } from "@apollo/client";
import {
  BriefcaseBusiness,
  Gift,
  Home,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import Loader from "@/components/seraui/Loader";
import { Button } from "@/components/ui/button";
import { GET_CLIENT_PROFILE } from "@/graphql/client-panel.gql";
import { useMe } from "@/lib/useMe";
import { cn } from "@/lib/utils";
import LoyaltyDashboard from "./_components/LoyaltyDashboard";
import OrderHistory from "./_components/OrderHistory";
import ProfileOverview from "./_components/ProfileOverview";
import Recommendations from "./_components/Recommendations";
import ReviewsPage from "./_components/Reviews";
import SettingsPanel from "./_components/SettingsPanel";
import ChatPage from "../../../components/chat/ChatComponent";

type ClientSection =
  | "profile"
  | "chat"
  | "orders"
  | "loyalty"
  | "recommendations"
  | "reviews"
  | "settings";

type ClientSideLink = {
  section: ClientSection;
  icon: any;
  label: string;
};

export default function ClientPanel() {
  const { user, loading: authLoading } = useMe();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ClientSection>("profile");

  useEffect(() => {
    const storedSection =
      typeof window !== "undefined"
        ? window.localStorage.getItem("clientActiveSection")
        : null;

    if (
      storedSection === "profile" ||
      storedSection === "chat" ||
      storedSection === "orders" ||
      storedSection === "loyalty" ||
      storedSection === "recommendations" ||
      storedSection === "reviews" ||
      storedSection === "settings"
    ) {
      setActiveSection(storedSection);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("clientActiveSection", activeSection);
    }
  }, [activeSection]);

  const clientSideLinks: ClientSideLink[] = [
    { section: "profile", icon: User, label: "Profile" },
    { section: "orders", icon: ShoppingBag, label: "Order History" },
    { section: "chat", icon: MessageSquare, label: "My Chats" },
    // { section: "loyalty", icon: Star, label: "Loyalty Program" },
    { section: "recommendations", icon: Home, label: "Recommendations" },
    { section: "reviews", icon: MessageSquare, label: "Reviews" },
    { section: "settings", icon: Settings, label: "Account Settings" },
  ];

  const {
    data: clientData,
    loading: clientLoading,
    error: clientError,
  } = useQuery(GET_CLIENT_PROFILE, {
    variables: { id: user?.id },
    skip: !user?.id,
  });

  if (authLoading || clientLoading) return <Loader loading={true} />;
  if (clientError)
    return <div>Error loading client data: {clientError.message}</div>;
  if (!user || !user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Client Access Required</h1>
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
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {clientSideLinks.map((item) => {
              const isActive = activeSection === item.section;
              const Icon = item.icon;
              return (
                <Button
                  key={item.section}
                  variant="ghost"
                  className={cn(
                    `flex justify-start border-b-0 border-orange-700 w-full px-4 py-2 gap-1.5 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]`,
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                  )}
                  onClick={() => {
                    setActiveSection(item.section);
                    setIsSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => (window.location.href = "/marketplace")}
            >
              <ShoppingBag className="h-3 w-3 mr-2" />
              Browse Marketplace
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() =>
                (window.location.href = "/all-businesses?verified=true")
              }
            >
              <ShieldCheck className="h-3 w-3 mr-2" />
              Verified Businesses
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
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {activeSection === "profile" && (
              <ProfileOverview client={clientData.client} />
            )}
            {activeSection === "chat" && <ChatPage />}
            {/* {activeSection === "chat" && <ChatsPage />} */}
            {activeSection === "orders" && (
              <OrderHistory client={clientData.client} />
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
            {activeSection === "settings" && (
              <SettingsPanel client={clientData.client} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
