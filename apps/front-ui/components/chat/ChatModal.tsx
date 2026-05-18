"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  X,
  Send,
  Home,
  User,
  Store,
  ChevronLeft,
  Bot,
  Sparkles,
  BookOpen,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  Plus,
} from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_UNREAD_COUNT } from "@/graphql/chat.gql";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/useMe";
import ChatList from "@/components/chat/ChatList";
import NewChatSession from "./NewChatSession";
import ChatThread from "@/components/chat/ChatThread";
import AccordionLast from "../../app/(browsing)/faq/accordion-last";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string;
}

// Simulated welcome messages for non-logged-in users
const WELCOME_MESSAGES = [
  {
    id: "welcome-1",
    content: "Welcome to USCOR Marketplace! 🌍",
    sender: "system",
    timestamp: new Date(Date.now() - 5000),
    delay: 0,
  },
  {
    id: "welcome-2",
    content: "I'm your USCOR assistant. How can I help you today?",
    sender: "system",
    timestamp: new Date(Date.now() - 4000),
    delay: 1000,
  },
  {
    id: "welcome-3",
    content:
      "USCOR is a complete commerce platform designed for East African businesses. Let me tell you about our benefits:",
    sender: "system",
    timestamp: new Date(Date.now() - 3000),
    delay: 2000,
  },
  {
    id: "welcome-4",
    content:
      "✅ For Businesses: Manage inventory, sales, and staff with our intelligent POS system",
    sender: "system",
    timestamp: new Date(Date.now() - 2000),
    delay: 3000,
  },
  {
    id: "welcome-5",
    content:
      "✅ For Service Providers: Showcase your services and connect with customers",
    sender: "system",
    timestamp: new Date(Date.now() - 1000),
    delay: 4000,
  },
  {
    id: "welcome-6",
    content:
      "✅ For Customers: Shop from verified businesses with secure payments",
    sender: "system",
    timestamp: new Date(Date.now()),
    delay: 5000,
  },
];

export default function ChatModal({ isOpen, onClose, chatId }: ChatModalProps) {
  const { user, role, loading: authLoading } = useMe();
  const [activeChatId, setActiveChatId] = useState<string | null>(
    chatId || null,
  );
  const [showNewChat, setShowNewChat] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [simulatedMessages, setSimulatedMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const { data: unreadData, refetch: refetchUnread } = useQuery(
    GET_UNREAD_COUNT,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
      // pollInterval: 5000,
    },
  );

  useEffect(() => {
    if (unreadData?.unreadCount) {
      setUnreadCount(unreadData.unreadCount);
    }
  }, [unreadData]);

  // Simulate welcome messages for non-logged-in users
  useEffect(() => {
    if (!isOpen || user || authLoading) return;

    const messagesToShow = [...WELCOME_MESSAGES];
    setSimulatedMessages([]);

    messagesToShow.forEach((msg) => {
      setTimeout(() => {
        setSimulatedMessages((prev) => [...prev, msg]);
        if (msg.id === "welcome-6") {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
          }, 1000);
        }
      }, msg.delay);
    });
  }, [isOpen, user, authLoading]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setShowFAQs(false);
  };

  const handleBackToChatList = () => {
    setActiveChatId(null);
    setShowFAQs(false);
  };

  const handleFAQClick = () => {
    setShowFAQs(true);
    setActiveChatId(null);
  };

  const handleLogin = () => {
    onClose();
    router.push("/login");
  };

  const handleStartNewChat = () => {
    setShowNewChat(true);
  };

  const handleChatCreated = (chatId: string) => {
    setShowNewChat(false);
    setActiveChatId(chatId);
    refetchUnread();
  };

  const handleClose = () => {
    setActiveChatId(null);
    setShowFAQs(false);
    setShowNewChat(false);
    onClose();
  };

  if (!isOpen) return null;

  // Render welcome experience for non-logged-in users
  if (!user && !authLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div className="fixed bottom-0 right-0 w-full md:w-[400px] h-[90vh] md:h-[700px] bg-card border border-border rounded-t-xl md:rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out">
          <div className="flex flex-col h-full min-h-0">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">USCOR Assistant</h3>
                  <p className="text-xs text-muted-foreground">
                    AI-Powered Support
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4 space-y-4">
                {simulatedMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 mb-2">
                    {msg.sender === "system" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-3 max-w-[80%] ${
                        msg.sender === "system"
                          ? "bg-muted rounded-bl-none"
                          : "bg-primary text-primary-foreground rounded-br-none ml-auto"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-none p-3">
                      <div className="flex space-x-1.5">
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      USCOR Premium Features
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="border border-border rounded-lg p-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                        <Store className="h-5 w-5 text-success" />
                      </div>
                      <h4 className="font-medium mb-1">Businesses</h4>
                      <p className="text-xs text-muted-foreground">
                        Manage sales, inventory & staff
                      </p>
                    </div>
                    <div className="border border-border rounded-lg p-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center mx-auto mb-2">
                        <User className="h-5 w-5 text-info" />
                      </div>
                      <h4 className="font-medium mb-1">Service Providers</h4>
                      <p className="text-xs text-muted-foreground">
                        Showcase your services
                      </p>
                    </div>
                    <div className="border border-border rounded-lg p-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                        <Home className="h-5 w-5 text-warning" />
                      </div>
                      <h4 className="font-medium mb-1">Customers</h4>
                      <p className="text-xs text-muted-foreground">
                        Shop from verified businesses
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-primary hover:bg-accent text-primary-foreground h-12 text-lg"
                      onClick={handleLogin}
                    >
                      <User className="h-5 w-5 mr-2" />
                      Sign In to Continue
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-12 text-lg"
                      onClick={handleFAQClick}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      View FAQs
                    </Button>

                    <Button
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={handleClose}
                    >
                      Continue as Guest
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render chat interface for logged-in users
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="fixed bottom-0 right-0 w-full md:w-[400px] h-[90vh] md:h-[700px] bg-card border border-border rounded-t-xl md:rounded-xl shadow-2xl transform transition-all duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Chat List View */}
          {!activeChatId && !showNewChat && !showFAQs && (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">Messages</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleFAQClick}>
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStartNewChat}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <ChatList
                  chats={[]}
                  activeChatId={activeChatId}
                  onSelect={handleSelectChat}
                  userRole={role}
                />
              </div>

              <div className="p-4 border-t border-border">
                <Button
                  className="w-full bg-primary hover:bg-accent text-primary-foreground h-11"
                  onClick={handleStartNewChat}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </>
          )}

          {/* Chat Thread View */}
          {activeChatId && !showFAQs && (
            <ChatThread
              chatId={activeChatId}
              userId={user?.id || ""}
              userRole={role!}
              onBack={handleBackToChatList}
              onClose={handleClose}
            />
          )}

          {/* New Chat Session View */}
          {showNewChat && (
            <NewChatSession
              isOpen={showNewChat}
              onClose={() => setShowNewChat(false)}
              onChatCreated={(chatId) => {
                handleChatCreated(chatId);
              }}
              storeId="24f6ef0c-83d1-43dd-ac67-030b81dca7b2"
            />
          )}

          {/* FAQs View */}
          {showFAQs && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFAQs(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">Frequently Asked Questions</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <AccordionLast />
                </ScrollArea>
              </div>

              <div className="p-4 border-t border-border">
                <Button
                  className="w-full bg-primary hover:bg-accent text-primary-foreground h-11"
                  onClick={handleStartNewChat}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
