// app/business/loyalty/_components/EarnPointsModal.tsx
"use client";

import { useMutation } from "@apollo/client";
import {
  AlertTriangle,
  Coins,
  Loader2,
  Search,
  Star,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EARN_POINTS } from "@/graphql/loyalty.gql";
import { useMe } from "@/lib/useMe";

interface EarnPointsModalProps {
  clientId?: string;
  programId: string;
  isOpen: boolean;
  onClose: () => void;
  onPointsEarned: (transaction: any) => void;
}

export default function EarnPointsModal({
  clientId,
  programId,
  isOpen,
  onClose,
  onPointsEarned,
}: EarnPointsModalProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    points: 0,
    reason: "",
  });
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  const [searchQuery, setSearchQuery] = useState("");

  const [earnPoints] = useMutation(EARN_POINTS);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        points: 0,
        reason: "",
      });
      setSelectedClientId(clientId || "");
      setSearchQuery("");
      setValidationErrors({});
    }
  }, [isOpen, clientId]);

  const validateForm = () => {
    const errors: any = {};

    if (formData.points <= 0) {
      errors.points = "Points must be greater than 0";
    }

    if (!selectedClientId) {
      errors.clientId = "Please select a customer";
    }

    if (!formData.reason.trim()) {
      errors.reason = "Reason is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast(
        "error",
        "Validation Error",
        "Please fix the errors in the form",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await earnPoints({
        variables: {
          input: {
            clientId: selectedClientId,
            loyaltyProgramId: programId,
            points: formData.points,
            reason: formData.reason,
          },
        },
      });

      showToast(
        "success",
        "Success",
        `${formData.points} points earned successfully`,
      );
      onPointsEarned(data.earnPoints);
      onClose();
    } catch (error: any) {
      showToast(
        "error",
        "Points Earn Failed",
        error.message || "Failed to earn points",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "points" ? Number(value) : value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Award Loyalty Points
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manually award points to a customer
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="clientId"
                  className="block text-sm font-medium mb-1 flex items-center gap-2"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Select Customer
                </label>

                {selectedClientId ? (
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                        {selectedClientId.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">Customer Name</p>
                        <p className="text-sm text-muted-foreground">
                          customer@email.com
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedClientId("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search customers by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                {validationErrors.clientId && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {validationErrors.clientId}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="points"
                  className="block text-sm font-medium mb-1 flex items-center gap-2"
                >
                  <Star className="h-4 w-4 text-muted-foreground" />
                  Points to Award
                </label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={handleInputChange}
                  placeholder="Enter points amount"
                />
                {validationErrors.points && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {validationErrors.points}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium mb-1"
                >
                  Reason for Awarding Points
                </label>
                <Textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g., Special promotion, Birthday bonus, Loyalty reward..."
                  rows={3}
                />
                {validationErrors.reason && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {validationErrors.reason}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-accent text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Awarding...
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4 mr-2" />
                    Award Points
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
