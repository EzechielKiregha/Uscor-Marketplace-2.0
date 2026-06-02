"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ClientSection =
  | "profile"
  | "chat"
  | "orders"
  | "loyalty"
  | "recommendations"
  | "reviews"
  | "settings"
  | "wallet";

type ClientPanelContextType = {
  activeSection: ClientSection;
  setActiveSection: (section: ClientSection) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
};

const ClientPanelContext = createContext<ClientPanelContextType | null>(null);

export function ClientPanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState<ClientSection>("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedSection = window.localStorage.getItem("clientActiveSection");
    if (
      storedSection === "profile" ||
      storedSection === "chat" ||
      storedSection === "orders" ||
      storedSection === "loyalty" ||
      storedSection === "recommendations" ||
      storedSection === "reviews" ||
      storedSection === "settings" ||
      storedSection === "wallet"
    ) {
      setActiveSection(storedSection);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("clientActiveSection", activeSection);
  }, [activeSection]);

  return (
    <ClientPanelContext.Provider
      value={{
        activeSection,
        setActiveSection,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </ClientPanelContext.Provider>
  );
}

export function useClientPanel() {
  const ctx = useContext(ClientPanelContext);
  if (!ctx) {
    throw new Error("useClientPanel must be used inside ClientPanelProvider");
  }
  return ctx;
}
