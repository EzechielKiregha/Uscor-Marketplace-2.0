// app/business/loyalty/_components/CreateLoyaltyProgramModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_LOYALTY_PROGRAM } from "@/graphql/loyalty.gql";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Users,
  Gift,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { useMe } from "@/lib/useMe";
import { BusinessEntity } from "@/lib/types";

interface CreateLoyaltyProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgramCreated: (program: any) => void;
}

export default function CreateLoyaltyProgramModal({
  isOpen,
  onClose,
  onProgramCreated,
}: CreateLoyaltyProgramModalProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointsPerPurchase: 1,
    minimumPointsToRedeem: 100,
  });
  const [tiers, setTiers] = useState([
    {
      name: "Bronze",
      minPoints: 0,
      benefits: ["10% discount on special occasions"],
    },
    {
      name: "Silver",
      minPoints: 500,
      benefits: ["15% discount on purchases", "Early access to sales"],
    },
    {
      name: "Gold",
      minPoints: 1000,
      benefits: [
        "20% discount on purchases",
        "Free delivery",
        "VIP customer service",
      ],
    },
  ]);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createLoyaltyProgram] = useMutation(CREATE_LOYALTY_PROGRAM);

  const currentUser = user as BusinessEntity;

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: "",
        description: "",
        pointsPerPurchase: 1,
        minimumPointsToRedeem: 100,
      });
      setTiers([
        {
          name: "Bronze",
          minPoints: 0,
          benefits: ["10% discount on special occasions"],
        },
        {
          name: "Silver",
          minPoints: 500,
          benefits: ["15% discount on purchases", "Early access to sales"],
        },
        {
          name: "Gold",
          minPoints: 1000,
          benefits: [
            "20% discount on purchases",
            "Free delivery",
            "VIP customer service",
          ],
        },
      ]);
      setValidationErrors({});
    }
  }, [isOpen]);

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
      const { data } = await createLoyaltyProgram({
        variables: {
          input: {
            businessId: user?.id,
            name: formData.name,
            description: formData.description,
            pointsPerPurchase: formData.pointsPerPurchase,
            minimumPointsToRedeem: formData.minimumPointsToRedeem,
            tiers: tiers.map((tier) => ({
              name: tier.name,
              minPoints: tier.minPoints,
              benefits: tier.benefits,
            })),
          },
        },
      });

      showToast("success", "Success", "Loyalty program created successfully");
      onProgramCreated(data.createLoyaltyProgram);
      onClose();
    } catch (error: any) {
      showToast(
        "error",
        "Creation Failed",
        error.message || "Failed to create loyalty program",
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

  const handleTierChange = (index: number, field: string, value: any) => {
    setTiers((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)),
    );
  };

  const handleAddTier = () => {
    setTiers((prev) => [
      ...prev,
      {
        name: `Tier ${prev.length + 1}`,
        minPoints: prev[prev.length - 1]?.minPoints + 500 || 1000,
        benefits: ["Custom benefit"],
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddBenefit = (index: number) => {
    setTiers((prev) =>
      prev.map((tier, i) =>
        i === index
          ? { ...tier, benefits: [...tier.benefits, "New benefit"] }
          : tier,
      ),
    );
  };

  const handleUpdateBenefit = (
    tierIndex: number,
    benefitIndex: number,
    value: string,
  ) => {
    setTiers((prev) =>
      prev.map((tier, i) =>
        i === tierIndex
          ? {
              ...tier,
              benefits: tier.benefits.map((benefit, j) =>
                j === benefitIndex ? value : benefit,
              ),
            }
          : tier,
      ),
    );
  };

  const handleRemoveBenefit = (tierIndex: number, benefitIndex: number) => {
    setTiers((prev) =>
      prev.map((tier, i) =>
        i === tierIndex
          ? {
              ...tier,
              benefits: tier.benefits.filter((_, j) => j !== benefitIndex),
            }
          : tier,
      ),
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Create Loyalty Program
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Set up a rewards system for your customers
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Program Details */}
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
            </div>

            {/* Points Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pointsPerPurchase"
                  className="block text-sm font-medium mb-1 flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Points per $1 Spent
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
                <p className="mt-1 text-xs text-muted-foreground">
                  How many points customers earn for each dollar spent
                </p>
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
                <p className="mt-1 text-xs text-muted-foreground">
                  Points required to redeem rewards (equivalent to $
                  {formData.minimumPointsToRedeem / 10})
                </p>
              </div>
            </div>

            {/* Loyalty Tiers */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Loyalty Tiers
                </h3>
                <Button variant="outline" size="sm" onClick={handleAddTier}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </div>

              <div className="space-y-4">
                {tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Tier {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTier(index)}
                        disabled={tiers.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tier Name
                        </label>
                        <Input
                          type="text"
                          value={tier.name}
                          onChange={(e) =>
                            handleTierChange(index, "name", e.target.value)
                          }
                          placeholder="e.g., Bronze, Silver, Gold"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Minimum Points
                        </label>
                        <Input
                          type="number"
                          value={tier.minPoints}
                          onChange={(e) =>
                            handleTierChange(
                              index,
                              "minPoints",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          placeholder="e.g., 500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="font-medium">Benefits</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddBenefit(index)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Benefit
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {tier.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex gap-2">
                            <Input
                              type="text"
                              value={benefit}
                              onChange={(e) =>
                                handleUpdateBenefit(
                                  index,
                                  benefitIndex,
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., 10% discount on all purchases"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveBenefit(index, benefitIndex)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* East Africa Specific Tips */}
            <div className="border border-border rounded-lg p-4 bg-muted">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">
                    Tips for East African Markets
                  </h3>

                  {currentUser?.businessType === "CAFE" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      For cafés, consider a "Buy 9, get 1 free" model (90 points
                      = free drink). This encourages daily customers to return
                      and builds loyalty with small, achievable goals.
                    </p>
                  )}

                  {currentUser?.businessType === "HARDWARE" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Hardware stores often benefit from point multipliers on
                      tools and equipment (e.g., 2x points for tools, 1x for
                      consumables). This encourages customers to buy
                      higher-value items from you.
                    </p>
                  )}

                  {currentUser?.businessType === "ARTISAN" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      For artisans, consider offering custom order points where
                      customers earn bonus points for placing custom orders.
                      This helps build long-term relationships for your unique,
                      handcrafted products.
                    </p>
                  )}

                  {currentUser?.businessType !== "CAFE" &&
                    currentUser?.businessType !== "HARDWARE" &&
                    currentUser?.businessType !== "ARTISAN" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        For East African markets, consider smaller point
                        thresholds to drive more frequent engagement. The
                        average customer spends $20-50 per visit, so setting
                        redemption thresholds at 100-200 points ($10-$20 value)
                        works well for local markets.
                      </p>
                    )}

                  <div className="mt-3 p-3 bg-background rounded-lg border border-border">
                    <p className="text-sm">
                      <strong>Pro Tip:</strong> In Rwanda, Uganda, and other
                      East African countries, mobile money is the primary
                      payment method. Consider offering "100 points = $10 mobile
                      money voucher" as a redemption option to align with local
                      payment preferences.
                    </p>
                  </div>
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Create Program
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
