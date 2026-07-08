"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  Briefcase,
  CheckCircle,
  MessageCircle,
  Plus,
  Repeat,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CREATE_CHAT } from "@/graphql/chat.gql";
import { GET_WORKERS } from "@/graphql/worker.gql";
import { NegotiationType } from "@/lib/types";
import { useMe } from "@/lib/useMe";

interface Worker {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface NewChatSessionProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
  onChat?: (workerId: string, negotiationType: string) => void;
  storeId: string;
}

export default function NewChatSession({
  isOpen,
  onClose,
  onChatCreated,
  onChat,
  storeId,
}: NewChatSessionProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [negotiationType, setNegotiationType] = useState<string>(
    NegotiationType.PURCHASE,
  );
  const { user } = useMe();
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();
  const [createChat] = useMutation(CREATE_CHAT);

  const {
    data: workersData,
    loading: workersLoading,
    error: workersError,
  } = useQuery(GET_WORKERS, {
    variables: {
      // storeId,
      businessId: "7659de10-20da-4819-9285-f220cb0b0940",
    },
    skip: !storeId,
  });

  const filteredWorkers =
    workersData?.workers?.items?.filter(
      (worker: any) =>
        worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleCreateChat = async () => {
    if (!selectedWorkerId) {
      showToast(
        "error",
        "Selection Required",
        "Please select a worker to chat with",
      );
      return;
    }

    if (!user) {
      showToast(
        "error",
        "Failed",
        "Please log in to start a chat.",
        true,
        5000,
      );
      return;
    }

    try {
      const res = await createChat({
        variables: {
          input: {
            // productId: product.id,
            participantIds: [
              user.id,
              selectedWorkerId,
              "7659de10-20da-4819-9285-f220cb0b0940",
            ],
            isSecure: true,
            negotiationType: negotiationType,
          },
        },
      });
      showToast("success", "Chat Created", "Your conversation has started");
      onChatCreated(res?.data?.createChat?.id);
    } catch (error) {
      showToast("error", "Creation Failed", "Failed to create chat session");
    }
  };

  if (workersError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium mb-2">Error Loading Workers</h3>
            <p className="text-muted-foreground mb-6">
              {workersError.message || "Failed to load available workers"}
            </p>
            <Button variant="outline" onClick={() => onClose()}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Workers List */}
          <div className="max-h-100 overflow-y-auto pr-2">
            {workersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2" />
                <p>No workers found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredWorkers.map((worker: any) => (
                  <div
                    key={worker.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedWorkerId === worker.id
                        ? "bg-muted/70"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedWorkerId(worker.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {worker.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {worker.email}
                      </p>
                    </div>
                    {selectedWorkerId === worker.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Negotiation Type */}
          <div className="space-y-2">
            <Label htmlFor="negotiationType">Conversation Purpose</Label>
            <Select value={negotiationType} onValueChange={setNegotiationType}>
              <SelectTrigger id="negotiationType" className="h-11">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NegotiationType.PURCHASE}>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Purchase Inquiry</span>
                  </div>
                </SelectItem>
                <SelectItem value={NegotiationType.REOWNERSHIP}>
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    <span>Reownership Request</span>
                  </div>
                </SelectItem>
                <SelectItem value={NegotiationType.FREELANCEORDER}>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Freelance Service</span>
                  </div>
                </SelectItem>
                <SelectItem value={NegotiationType.GENERAL}>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>General Inquiry</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-11" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-accent text-primary-foreground h-11"
              onClick={handleCreateChat}
              disabled={!selectedWorkerId || workersLoading}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Conversation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
