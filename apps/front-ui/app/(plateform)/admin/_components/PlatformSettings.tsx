// app/admin/_components/PlatformSettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PLATFORM_SETTINGS,
  UPDATE_PLATFORM_SETTINGS
} from '@/graphql/admin.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  DollarSign,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
  BarChart,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import Loader from '@/components/seraui/Loader';

interface PlatformSettingsProps {
  settings: any;
}

export default function PlatformSettings({ settings }: PlatformSettingsProps) {
  const [formData, setFormData] = useState({
    platformFeePercentage: 5,
    minTransactionAmount: 1,
    maxTransactionAmount: 10000,
    currency: 'USD',
    tokenValue: 10,
    tokenSymbol: 'uTn',
    kycRequired: true,
    b2bEnabled: true,
    marketplaceEnabled: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const {
    data,
    loading: settingsLoading,
    error: settingsError,
    refetch
  } = useQuery(GET_PLATFORM_SETTINGS);

  const [updateSettings] = useMutation(UPDATE_PLATFORM_SETTINGS);

  useEffect(() => {
    if (settings) {
      setFormData({
        platformFeePercentage: settings.platformFeePercentage,
        minTransactionAmount: settings.minTransactionAmount,
        maxTransactionAmount: settings.maxTransactionAmount,
        currency: settings.currency,
        tokenValue: settings.tokenValue,
        tokenSymbol: settings.tokenSymbol,
        kycRequired: settings.kycRequired,
        b2bEnabled: settings.b2bEnabled,
        marketplaceEnabled: settings.marketplaceEnabled
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateSettings({
        variables: {
          input: {
            platformFeePercentage: parseFloat(formData.platformFeePercentage.toString()),
            minTransactionAmount: parseFloat(formData.minTransactionAmount.toString()),
            maxTransactionAmount: parseFloat(formData.maxTransactionAmount.toString()),
            currency: formData.currency,
            tokenValue: parseFloat(formData.tokenValue.toString()),
            tokenSymbol: formData.tokenSymbol,
            kycRequired: formData.kycRequired,
            b2bEnabled: formData.b2bEnabled,
            marketplaceEnabled: formData.marketplaceEnabled
          }
        }
      });

      showToast('success', 'Success', 'Platform settings updated successfully');
      refetch();
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Failed to update platform settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (settingsLoading) return <Loader loading={true} />;
  if (settingsError) return <div>Error loading settings: {settingsError.message}</div>;

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Platform Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure platform rules, fees, and features
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Transaction Fees Section */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Transaction Fees
                </h2>
                <p className="text-muted-foreground mt-1">
                  Configure platform commission rates and transaction limits
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="platformFeePercentage" className="block text-sm font-medium mb-1">
                    Platform Fee Percentage
                  </label>
                  <div className="relative">
                    <Input
                      id="platformFeePercentage"
                      name="platformFeePercentage"
                      type="number"
                      value={formData.platformFeePercentage}
                      onChange={handleInputChange}
                      placeholder="5"
                      min="0"
                      max="100"
                      step="0.1"
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Percentage fee charged on each transaction
                  </p>
                </div>

                <div>
                  <label htmlFor="minTransactionAmount" className="block text-sm font-medium mb-1">
                    Minimum Transaction Amount
                  </label>
                  <div className="relative">
                    <Input
                      id="minTransactionAmount"
                      name="minTransactionAmount"
                      type="number"
                      value={formData.minTransactionAmount}
                      onChange={handleInputChange}
                      placeholder="1"
                      min="0"
                      step="0.01"
                      className="pr-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Minimum amount for a valid transaction
                  </p>
                </div>

                <div>
                  <label htmlFor="maxTransactionAmount" className="block text-sm font-medium mb-1">
                    Maximum Transaction Amount
                  </label>
                  <div className="relative">
                    <Input
                      id="maxTransactionAmount"
                      name="maxTransactionAmount"
                      type="number"
                      value={formData.maxTransactionAmount}
                      onChange={handleInputChange}
                      placeholder="10000"
                      min="0"
                      step="0.01"
                      className="pr-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Maximum amount for a single transaction
                  </p>
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium mb-1">
                    Platform Currency
                  </label>
                  <Input
                    id="currency"
                    name="currency"
                    type="text"
                    value={formData.currency}
                    onChange={handleInputChange}
                    placeholder="USD"
                    maxLength={3}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Primary currency used on the platform
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* USCOR Token Section */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  USCOR Token Configuration
                </h2>
                <p className="text-muted-foreground mt-1">
                  Configure the USCOR token settings and value
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tokenValue" className="block text-sm font-medium mb-1">
                    Token Value (USD)
                  </label>
                  <div className="relative">
                    <Input
                      id="tokenValue"
                      name="tokenValue"
                      type="number"
                      value={formData.tokenValue}
                      onChange={handleInputChange}
                      placeholder="10"
                      min="0"
                      step="0.01"
                      className="pr-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Current value of 1 USCOR token in USD
                  </p>
                </div>

                <div>
                  <label htmlFor="tokenSymbol" className="block text-sm font-medium mb-1">
                    Token Symbol
                  </label>
                  <Input
                    id="tokenSymbol"
                    name="tokenSymbol"
                    type="text"
                    value={formData.tokenSymbol}
                    onChange={handleInputChange}
                    placeholder="uTn"
                    maxLength={5}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Symbol used to represent USCOR tokens
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                <p className="text-sm">
                  <span className="font-medium">Current Configuration:</span> 1 {formData.tokenSymbol} = ${formData.tokenValue} USD
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This means 1 {formData.tokenSymbol} can be used to purchase $${formData.tokenValue} worth of products or services.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Rules Section */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Platform Rules
                </h2>
                <p className="text-muted-foreground mt-1">
                  Configure platform-wide rules and requirements
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">KYC Verification Required</h3>
                    <p className="text-sm text-muted-foreground">
                      Require businesses to complete KYC verification
                    </p>
                  </div>
                  <Switch
                    checked={formData.kycRequired}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, kycRequired: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">B2B Transactions Enabled</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow businesses to purchase from other businesses
                    </p>
                  </div>
                  <Switch
                    checked={formData.b2bEnabled}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, b2bEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Marketplace Enabled</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable the public marketplace for all users
                    </p>
                  </div>
                  <Switch
                    checked={formData.marketplaceEnabled}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, marketplaceEnabled: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* East Africa Specific Settings */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  East Africa Specific Settings
                </h2>
                <p className="text-muted-foreground mt-1">
                  Configure settings specific to East African markets
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Mobile Money Integration</h3>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-medium">Show USSD codes</p>
                        <p className="text-xs text-muted-foreground">
                          Display the full USSD code for customers to dial
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-medium">Show QR codes</p>
                        <p className="text-xs text-muted-foreground">
                          Display QR codes for mobile money apps
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-medium">Auto-verify payments</p>
                        <p className="text-xs text-muted-foreground">
                          Automatically verify mobile money payments
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Local Market Settings</h3>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-medium">Use local product categories</p>
                        <p className="text-xs text-muted-foreground">
                          Show categories common in East African markets
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <p className="font-medium">Show local holidays</p>
                        <p className="text-xs text-muted-foreground">
                          Display East African holidays in the calendar
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                setFormData({
                  platformFeePercentage: settings.platformFeePercentage,
                  minTransactionAmount: settings.minTransactionAmount,
                  maxTransactionAmount: settings.maxTransactionAmount,
                  currency: settings.currency,
                  tokenValue: settings.tokenValue,
                  tokenSymbol: settings.tokenSymbol,
                  kycRequired: settings.kycRequired,
                  b2bEnabled: settings.b2bEnabled,
                  marketplaceEnabled: settings.marketplaceEnabled
                });
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-accent text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : 'Save Settings'}
            </Button>
          </div>

          {/* East Africa Information */}
          <div className="p-4 bg-muted rounded-lg border border-orange-400/60 dark:border-orange-500/70">
            <div className="flex items-start gap-3">
              <BarChart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">East Africa Platform Configuration</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  USCOR is optimized for the East African market with special configurations
                  for mobile money payments, local business types, and regional requirements.
                </p>

                <div className="mt-3 p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
                  <p className="text-sm">
                    <span className="font-medium">Pro Tip:</span> For East African markets,
                    we recommend setting the token value to 10 (1 uTn = $10) to align with
                    common transaction values in the region. Mobile money integration should
                    be enabled for all East African countries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}