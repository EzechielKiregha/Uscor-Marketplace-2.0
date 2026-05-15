"use client";

import { useQuery } from "@apollo/client";
import { MessageCircle, Plus, Store, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { GET_WORKERS } from "@/graphql/worker.gql";
import { on } from "events";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NegotiationType } from "@/lib/types";

interface Worker {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface NewChatSessionProps {
  isOpen: boolean;
  onClose: () => void;
  onChat: (workerId: string, negotiationType: string) => void;
  storeId: string;
}

export default function NewChatSession({
  isOpen,
  onClose,
  onChat,
  storeId,
}: NewChatSessionProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [negotiationType, setNegotiationType] = useState<string>(
    NegotiationType.PURCHASE,
  );
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  // Get workers for the store (only for business owners)
  const { data: workersData, loading: workersLoading } = useQuery(GET_WORKERS, {
    variables: { storeId },
    skip: !storeId,
  });

  const handleClose = () => {
    setSelectedWorkerId("");
    setNegotiationType(NegotiationType.PURCHASE);
    setIsCreating(false);
    onClose();
  };

  const workers = workersData?.workers || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Worker Selection */}
            <div className="space-y-3">
              <Label>Contact Us</Label>
              {workersLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading workers...
                </div>
              ) : workers.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No Support available. You will be connected to the store
                  owner.
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      !selectedWorkerId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedWorkerId("")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <Store className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Chat</p>
                        <p className="text-xs text-muted-foreground">
                          with the store owner
                        </p>
                      </div>
                    </div>
                  </div>

                  {workers.map((worker: Worker) => (
                    <div
                      key={worker.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedWorkerId === worker.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedWorkerId(worker.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {worker.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {worker.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Subject of Inquiry</Label>
              <span className="text-sm text-muted-foreground">
                Please select the subject of your inquiry
              </span>
              <div className="space-y-2">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    !negotiationType
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Select
                      value={negotiationType}
                      onValueChange={setNegotiationType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Inquiry Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NegotiationType.GENERAL}>
                          General Inquiry
                        </SelectItem>
                        <SelectItem value={NegotiationType.PURCHASE}>
                          Purchase Inquiry
                        </SelectItem>
                        <SelectItem value={NegotiationType.FREELANCEORDER}>
                          Freelance Order
                        </SelectItem>
                        <SelectItem value={NegotiationType.REOWNERSHIP}>
                          Re-ownership Inquiry
                        </SelectItem>
                        <SelectItem value={NegotiationType.COMPLAINT}>
                          Complaint
                        </SelectItem>
                        <SelectItem value={NegotiationType.SUPPORT}>
                          Support Request
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onChat(selectedWorkerId, negotiationType)}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? "Creating..." : "Start Chat"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
