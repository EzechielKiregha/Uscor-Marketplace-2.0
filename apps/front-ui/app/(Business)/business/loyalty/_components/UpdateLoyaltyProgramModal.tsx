// app/business/loyalty/_components/UpdateLoyaltyProgramModal.tsx
"use client";

import { useMutation } from "@apollo/client";
import {
  AlertTriangle,
  CheckCircle,
  Coins,
  Gift,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GET_LOYALTY_PROGRAMS,
  UPDATE_LOYALTY_PROGRAM,
} from "@/graphql/loyalty.gql";
import { useMe } from "@/lib/useMe";

interface UpdateLoyaltyProgramModalProps {
  program: any;
  isOpen: boolean;
  onClose: () => void;
  onProgramUpdated: (program: any) => void;
}

export default function UpdateLoyaltyProgramModal({
  program,
  isOpen,
  onClose,
  onProgramUpdated,
}: UpdateLoyaltyProgramModalProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointsPerPurchase: 1,
    minimumPointsToRedeem: 100,
  });
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateLoyaltyProgram] = useMutation(UPDATE_LOYALTY_PROGRAM, {
    refetchQueries: [GET_LOYALTY_PROGRAMS],
  });

  useEffect(() => {
    if (program && isOpen) {
      setFormData({
        name: program.name,
        description: program.description || "",
        pointsPerPurchase: program.pointsPerPurchase,
        minimumPointsToRedeem: program.minimumPointsToRedeem,
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: "",
        description: "",
        pointsPerPurchase: 1,
        minimumPointsToRedeem: 100,
      });
      setValidationErrors({});
    }
  }, [program, isOpen]);

  const validateForm = () => {
    const errors: any = {};

    if (!formData.name.trim()) {
      errors.name = "Program name is required";
    }

    if (formData.pointsPerPurchase <= 0) {
      errors.pointsPerPurchase = "Points per purchase must be greater than 0";
    }

    if (formData.minimumPointsToRedeem <= 0) {
      errors.minimumPointsToRedeem =
        "Minimum points to redeem must be greater than 0";
    }

    if (formData.minimumPointsToRedeem < formData.pointsPerPurchase * 10) {
      errors.minimumPointsToRedeem =
        "Minimum points should be at least 10x the points per purchase";
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
      const { data } = await updateLoyaltyProgram({
        variables: {
          id: program.id,
          input: {
            name: formData.name,
            description: formData.description,
            pointsPerPurchase: formData.pointsPerPurchase,
            minimumPointsToRedeem: formData.minimumPointsToRedeem,
          },
        },
      });

      showToast("success", "Success", "Loyalty program updated successfully");
      onProgramUpdated(data.updateLoyaltyProgram);
      onClose();
    } catch (error: any) {
      showToast(
        "error",
        "Update Failed",
        error.message || "Failed to update loyalty program",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
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

  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Update Loyalty Program
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Modify your existing rewards system
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
                  htmlFor="name"
                  className="block text-sm font-medium mb-1 flex items-center gap-2"
                >
                  <Star className="h-4 w-4 text-muted-foreground" />
                  Program Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Local Artisans Rewards"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Program Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe how customers can earn and redeem points..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pointsPerPurchase"
                    className="block text-sm font-medium mb-1 flex items-center gap-2"
                  >
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    Points per Purchase
                  </label>
                  <div className="relative">
                    <Input
                      id="pointsPerPurchase"
                      name="pointsPerPurchase"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.pointsPerPurchase}
                      onChange={handleInputChange}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      points per $1
                    </span>
                  </div>
                  {validationErrors.pointsPerPurchase && (
                    <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationErrors.pointsPerPurchase}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="minimumPointsToRedeem"
                    className="block text-sm font-medium mb-1 flex items-center gap-2"
                  >
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    Minimum Points to Redeem
                  </label>
                  <div className="relative">
                    <Input
                      id="minimumPointsToRedeem"
                      name="minimumPointsToRedeem"
                      type="number"
                      min="1"
                      value={formData.minimumPointsToRedeem}
                      onChange={handleInputChange}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      points
                    </span>
                  </div>
                  {validationErrors.minimumPointsToRedeem && (
                    <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {validationErrors.minimumPointsToRedeem}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Program Preview */}
            <div className="border border-border rounded-lg p-4 bg-muted">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Program Preview
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>For every $1 spent</span>
                  <span>{formData.pointsPerPurchase} points earned</span>
                </div>
                <div className="flex justify-between">
                  <span>To redeem rewards</span>
                  <span>{formData.minimumPointsToRedeem} points</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Customer needs to spend</span>
                  <span>
                    $
                    {(
                      formData.minimumPointsToRedeem /
                      formData.pointsPerPurchase
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Program Stats */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Current Program Stats</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Active Members
                  </p>
                  <p className="text-xl font-bold">
                    {program.totalMembers || 0}
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Points Redeemed
                  </p>
                  <p className="text-xl font-bold">
                    {program.pointsRedeemed || 0}
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Redemption Rate
                  </p>
                  <p className="text-xl font-bold">
                    {program.totalMembers > 0
                      ? (
                          (program.pointsRedeemed / program.totalMembers) *
                          100
                        ).toFixed(1) + "%"
                      : "0%"}
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Avg. Points/Member
                  </p>
                  <p className="text-xl font-bold">
                    {program.totalMembers > 0
                      ? (program.totalPoints / program.totalMembers).toFixed(0)
                      : "0"}
                  </p>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Update Program
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
