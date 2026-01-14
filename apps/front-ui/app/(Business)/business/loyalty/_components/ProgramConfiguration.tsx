// app/business/loyalty/_components/ProgramConfiguration.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_LOYALTY_PROGRAM,
  UPDATE_LOYALTY_PROGRAM,
  GET_LOYALTY_PROGRAMS
} from '@/graphql/loyalty.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Star,
  Gift,
  Coins,
  Percent,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';

interface ProgramConfigurationProps {
  program: any; // Replace with LoyaltyProgramEntity
  loading: boolean;
}

export default function ProgramConfiguration({
  program,
  loading
}: ProgramConfigurationProps) {
  const [formData, setFormData] = useState({
    name: 'Local Artisans Rewards',
    description: 'Earn points for every purchase and redeem for discounts or free local products',
    pointsPerPurchase: 1,
    minimumPointsToRedeem: 100
  });
  const [isCreating, setIsCreating] = useState(!program);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const { showToast } = useToast()
  const user = useMe();

  const [createProgram] = useMutation(CREATE_LOYALTY_PROGRAM, {
    refetchQueries: [GET_LOYALTY_PROGRAMS]
  });

  const [updateProgram] = useMutation(UPDATE_LOYALTY_PROGRAM, {
    refetchQueries: [GET_LOYALTY_PROGRAMS]
  });

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        description: program.description,
        pointsPerPurchase: program.pointsPerPurchase,
        minimumPointsToRedeem: program.minimumPointsToRedeem
      });
      setIsCreating(false);
    } else {
      setFormData({
        name: 'Local Artisans Rewards',
        description: 'Earn points for every purchase and redeem for discounts or free local products',
        pointsPerPurchase: 1,
        minimumPointsToRedeem: 100
      });
      setIsCreating(true);
    }
  }, [program]);

  const validateForm = () => {
    const errors: any = {};

    if (!formData.name.trim()) {
      errors.name = 'Program name is required';
    }

    if (formData.pointsPerPurchase <= 0) {
      errors.pointsPerPurchase = 'Points per purchase must be greater than 0';
    }

    if (formData.minimumPointsToRedeem <= 0) {
      errors.minimumPointsToRedeem = 'Minimum points to redeem must be greater than 0';
    }

    if (formData.minimumPointsToRedeem <= formData.pointsPerPurchase) {
      errors.minimumPointsToRedeem = 'Minimum points should be higher than points per purchase';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      if (isCreating) {
        await createProgram({
          variables: {
            input: {
              businessId: user?.id,
              name: formData.name,
              description: formData.description,
              pointsPerPurchase: formData.pointsPerPurchase,
              minimumPointsToRedeem: formData.minimumPointsToRedeem
            }
          }
        });
        showToast('success', 'Success', 'Loyalty program created successfully');
      } else {
        await updateProgram({
          variables: {
            id: program.id,
            input: {
              name: formData.name,
              description: formData.description,
              pointsPerPurchase: formData.pointsPerPurchase,
              minimumPointsToRedeem: formData.minimumPointsToRedeem
            }
          }
        });
        showToast('success', 'Success', 'Loyalty program updated successfully');
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to save loyalty program');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pointsPerPurchase' || name === 'minimumPointsToRedeem'
        ? Number(value)
        : value
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

  const calculateRedemptionValue = () => {
    return (formData.minimumPointsToRedeem / formData.pointsPerPurchase).toFixed(2);
  };

  if (loading) return (
    <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
      <CardContent className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {isCreating ? 'Create Loyalty Program' : 'Program Configuration'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your rewards program for local customers
            </p>
          </div>
          {!isCreating && (
            <div className="flex gap-2">
              <Button variant="outline">Preview</Button>
              <Button variant="destructive">Deactivate</Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Program Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-9"
                    placeholder="e.g., Local Artisans Rewards"
                  />
                </div>
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Program Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe how your loyalty program works for customers..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="pointsPerPurchase" className="block text-sm font-medium mb-1">
                  Points per Purchase
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="pointsPerPurchase"
                    name="pointsPerPurchase"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.pointsPerPurchase}
                    onChange={handleInputChange}
                    className="pl-9"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  How many points customers earn per $1 spent
                </p>
                {validationErrors.pointsPerPurchase && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.pointsPerPurchase}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="minimumPointsToRedeem" className="block text-sm font-medium mb-1">
                  Minimum Points to Redeem
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="minimumPointsToRedeem"
                    name="minimumPointsToRedeem"
                    type="number"
                    min="1"
                    value={formData.minimumPointsToRedeem}
                    onChange={handleInputChange}
                    className="pl-9"
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Minimum points required to redeem a reward
                </p>
                {validationErrors.minimumPointsToRedeem && (
                  <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {validationErrors.minimumPointsToRedeem}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Program Preview */}
          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4 bg-muted">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Program Preview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                <p className="text-sm text-muted-foreground">For every</p>
                <p className="text-2xl font-bold">${1.00}</p>
                <p className="text-sm">you spend</p>
              </div>

              <div className="p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                <p className="text-sm text-muted-foreground">Earn</p>
                <p className="text-2xl font-bold">{formData.pointsPerPurchase} pts</p>
                <p className="text-sm">points</p>
              </div>

              <div className="p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                <p className="text-sm text-muted-foreground">Redeem</p>
                <p className="text-2xl font-bold">{formData.minimumPointsToRedeem} pts</p>
                <p className="text-sm">for ${calculateRedemptionValue()}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
              <p className="font-medium">How it works for customers:</p>
              <p className="text-sm text-muted-foreground mt-1">
                "Spend ${1.00} to earn {formData.pointsPerPurchase} points.
                Collect {formData.minimumPointsToRedeem} points to get ${calculateRedemptionValue()} off your next purchase."
              </p>
            </div>
          </div>

          {/* Benefits for Local Businesses */}
          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Benefits for Your Local Business
            </h3>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Encourage repeat customers from your local community</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Perfect for artisans, wood workers, and local craftsmen to build customer loyalty</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Rewards customers while helping them access more affordable local products</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Create a community around your locally-made products and services</span>
              </li>
            </ul>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Pro Tip:</strong> For local artisans and craftsmen, consider offering
                special redemption options like "100 points = 10% off a handmade product"
                to highlight the value of your locally-made goods.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                if (program) {
                  setFormData({
                    name: program.name,
                    description: program.description,
                    pointsPerPurchase: program.pointsPerPurchase,
                    minimumPointsToRedeem: program.minimumPointsToRedeem
                  });
                } else {
                  setFormData({
                    name: 'Local Artisans Rewards',
                    description: 'Earn points for every purchase and redeem for discounts or free local products',
                    pointsPerPurchase: 1,
                    minimumPointsToRedeem: 100
                  });
                }
                setValidationErrors({});
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-accent text-primary-foreground"
            >
              {isCreating ? 'Create Program' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}