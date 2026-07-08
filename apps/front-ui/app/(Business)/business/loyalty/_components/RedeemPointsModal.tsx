// app/business/loyalty/_components/RedeemPointsModal.tsx
"use client";

import { useMutation } from "@apollo/client";
import {
  AlertTriangle,
  Gift,
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
import { REDEEM_POINTS } from "@/graphql/loyalty.gql";
import { useMe } from "@/lib/useMe";

interface RedeemPointsModalProps {
  clientId?: string;
  programId: string;
  isOpen: boolean;
  onClose: () => void;
  onPointsRedeemed: (transaction: any) => void;
}

export default function RedeemPointsModal({
  clientId,
  programId,
  isOpen,
  onClose,
  onPointsRedeemed,
}: RedeemPointsModalProps) {
  //   const { user } = useMe();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    points: 0,
    rewardDescription: "",
  });
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [customerBalance, setCustomerBalance] = useState(0);

  const [redeemPoints] = useMutation(REDEEM_POINTS);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        points: 0,
        rewardDescription: "",
      });
      setSelectedClientId(clientId || "");
      setSearchQuery("");
      setCustomerBalance(0);
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

    if (formData.points > customerBalance) {
      errors.points = `Customer only has ${customerBalance} points available`;
    }

    if (!formData.rewardDescription.trim()) {
      errors.rewardDescription = "Reward description is required";
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
      const { data } = await redeemPoints({
        variables: {
          input: {
            clientId: selectedClientId,
            loyaltyProgramId: programId,
            points: formData.points,
            rewardDescription: formData.rewardDescription,
          },
        },
      });

      showToast(
        "success",
        "Success",
        `${formData.points} points redeemed successfully`,
      );
      onPointsRedeemed(data.redeemPoints);
      onClose();
    } catch (error: any) {
      showToast(
        "error",
        "Points Redemption Failed",
        error.message || "Failed to redeem points",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
                <Gift className="h-5 w-5 text-primary" />
                Redeem Loyalty Points
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Process a customer's point redemption
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
                          Available Points: {customerBalance}
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
                  Points to Redeem
                </label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={handleInputChange}
                  placeholder="Enter points amount to redeem"
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
                  htmlFor="rewardDescription"
                  className="block text-sm font-medium mb-1"
                >
                  Reward Description
                </label>
                <Textarea
                  id="rewardDescription"
                  name="rewardDescription"
                  value={formData.rewardDescription}
                  onChange={handleInputChange}
                  placeholder="e.g., $10 discount on next purchase, Free coffee, Product exchange..."
                  rows={3}
                />
                {validationErrors.rewardDescription && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {validationErrors.rewardDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Redemption Preview */}
            <div className="border border-border rounded-lg p-4 bg-muted">
              <h3 className="font-semibold mb-2">Redemption Preview</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Points to redeem</span>
                  <span>{formData.points}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer balance after redemption</span>
                  <span>{customerBalance - formData.points}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Value of redemption</span>
                  <span>${(formData.points / 100).toFixed(2)}</span>
                </div>
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
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Process Redemption
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
