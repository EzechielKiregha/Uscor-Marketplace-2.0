"use client";

import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useMe } from "@/lib/useMe";

interface MessageBubbleProps {
  message: string;
  senderId: string;
  createdAt: string | Date;
  status?: "sent" | "read" | "";
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;
}

export default function MessageBubble({
  message,
  senderId,
  createdAt,
  status = "sent",
  isLastInGroup = true,
  isFirstInGroup = true,
}: MessageBubbleProps) {
  const { user } = useMe();
  const [isVisible, setIsVisible] = useState(false);
  const isCurrentUser = user?.id === senderId;
  const formattedTime = format(new Date(createdAt), "HH:mm");

  // Animation effect when message appears
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getStatusIcon = () => {
    if (status === "read") {
      return <CheckCheck className="h-3.5 w-3.5 text-blue-400" />;
    }
    return <Check className="h-3 w-3 text-muted-foreground/70" />;
  };

  const getMessageStatus = () => {
    return status === "read" ? "Read" : "Sent";
  };

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[75%] relative group ${isCurrentUser ? "ml-auto" : ""}`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 relative overflow-hidden transition-all duration-200 ${
            isCurrentUser
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted rounded-tl-none"
          } ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={{
            transitionDelay: `${isFirstInGroup ? 0 : 50}ms`,
          }}
        >
          <div className="whitespace-pre-wrap wrap-break-words pb-2">
            {message}
          </div>

          <div className="absolute bottom-1 right-1 flex items-center gap-1 opacity-70">
            <span className="text-[0.65rem]">{formattedTime}</span>
            {isCurrentUser && getStatusIcon()}
          </div>
        </div>

        {/* Message status text */}
        {isCurrentUser && (
          <div className="mt-1 text-xs text-muted-foreground text-right opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {getMessageStatus()}
          </div>
        )}
      </div>
    </div>
  );
}
