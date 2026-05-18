// marketplace/_components/FloatingChat.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Loader2 } from "lucide-react";
import { useMe } from "@/lib/useMe";
import ChatModal from "@/components/chat/ChatModal";

export default function FloatingChat() {
  const { user, loading: authLoading } = useMe();
  const [isOpen, setIsOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-open chat for first-time users after a delay
  useEffect(() => {
    if (!user && !authLoading && !isOpen) {
      const timer = setTimeout(() => {
        if (!isOpen) setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, isOpen]);

  const handleChatOpen = () => {
    setIsOpen(true);
  };

  const handleChatClose = () => {
    setIsOpen(false);
  };

  if (authLoading) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-primary hover:bg-accent text-primary-foreground shadow-lg"
          disabled
        >
          <Loader2 className="h-6 w-6 animate-spin" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Button
          onClick={handleChatOpen}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-14 h-14 rounded-full bg-primary hover:bg-accent text-primary-foreground shadow-lg transition-all duration-300 transform ${
            showAnimation ? "animate-bounce-slow" : ""
          }`}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-16 right-0 bg-muted text-foreground text-sm px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap transition-all duration-200 animate-fade-in">
            Need help? Chat with our assistant
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <ChatModal isOpen={isOpen} onClose={handleChatClose} />

      {/* Chat notification badge */}
      {!isOpen && user && (
        <div className="fixed bottom-16 right-16 z-50">
          <div className="w-3 h-3 bg-destructive rounded-full animate-ping-slow" />
        </div>
      )}
    </>
  );
}
