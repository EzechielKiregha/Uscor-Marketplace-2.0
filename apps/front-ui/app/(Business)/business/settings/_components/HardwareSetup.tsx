// app/business/settings/_components/HardwareSetup.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  GET_HARDWARE_RECOMMENDATIONS,
  UPDATE_HARDWARE_CONFIG
} from '@/graphql/settings.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import {
  Printer,
  ScanLine,
  CreditCard as CreditCardIcon,
  Box,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';
import { GET_BUSINESS_BY_ID } from '@/graphql/business.gql';

// Hardware types with icons
const hardwareTypes = [
  {
    id: 'RECEIPT_PRINTER',
    label: 'Receipt Printer',
    icon: Printer,
    description: 'Print receipts for your customers'
  },
  {
    id: 'BARCODE_SCANNER',
    label: 'Barcode Scanner',
    icon: ScanLine,
    description: 'Scan product barcodes for quick checkout'
  },
  {
    id: 'CASH_DRAWER',
    label: 'Cash Drawer',
    icon: Box,
    description: 'Store cash securely at your POS'
  },
  {
    id: 'CARD_READER',
    label: 'Card Reader',
    icon: CreditCardIcon,
    description: 'Accept credit/debit card payments'
  },
];

interface HardwareSetupProps {
  // Optional props if needed
}

type HardwareKey = 'receiptPrinter' | 'barcodeScanner' | 'cashDrawer' | 'cardReader';

export default function HardwareSetup({ }: HardwareSetupProps) {
  const { user, loading: authLoading } = useMe();
  const [formData, setFormData] = useState<Record<HardwareKey, string>>({
    receiptPrinter: '',
    barcodeScanner: '',
    cashDrawer: '',
    cardReader: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const { data: businessData } = useQuery(GET_BUSINESS_BY_ID, {
    variables: { userId: user?.id },
    skip: !user?.id
  })

  const {
    data: hardwareRecommendationsData,
    loading: hardwareLoading,
    refetch
  } = useQuery(GET_HARDWARE_RECOMMENDATIONS, {
    variables: {
      businessType: businessData?.businessType || 'ARTISAN',
      country: businessData?.country || 'RWANDA'
    },
    skip: !businessData?.businessType || !businessData?.country
  });

  const [updateHardwareConfig] = useMutation(UPDATE_HARDWARE_CONFIG);

  useEffect(() => {
    if (businessData?.hardwareConfig) {
      setFormData({
        receiptPrinter: businessData.hardwareConfig.receiptPrinter || '',
        barcodeScanner: businessData.hardwareConfig.barcodeScanner || '',
        cashDrawer: businessData.hardwareConfig.cashDrawer || '',
        cardReader: businessData.hardwareConfig.cardReader || ''
      });
    }
  }, [user]);

  const handleSelectHardware = (type: string, model: string) => {
    setFormData(prev => ({ ...prev, [type]: model }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateHardwareConfig({
        variables: {
          businessId: user?.id,
          input: {
            receiptPrinter: formData.receiptPrinter,
            barcodeScanner: formData.barcodeScanner,
            cashDrawer: formData.cashDrawer,
            cardReader: formData.cardReader
          }
        }
      });

      showToast('success', 'Success', 'Hardware configuration updated successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to update hardware configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || hardwareLoading) return (
    <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
      <CardContent className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </CardContent>
    </Card>
  );

  const businessType = businessData?.businessType || 'ARTISAN';
  const country = businessData?.country || 'RWANDA';

  // Group recommendations by type
  const recommendationsByType = hardwareRecommendationsData?.hardwareRecommendations?.reduce((acc: any, rec: any) => {
    if (!acc[rec.type]) {
      acc[rec.type] = [];
    }
    acc[rec.type].push(rec);
    return acc;
  }, {}) || {};

  return (
    <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Hardware Setup
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configure hardware for your Point of Sale system
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Setup Guides</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hardware Selection */}
          <div className="space-y-6">
            {hardwareTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                  <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {recommendationsByType[type.id] && recommendationsByType[type.id].length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendationsByType[type.id].map((rec: any) => (
                          <div
                            key={rec.model}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${formData[type.id.toLowerCase() as HardwareKey] === rec.model
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                              }`}
                            onClick={() => handleSelectHardware(type.id.toLowerCase() as HardwareKey, rec.model)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{rec.model}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {rec.priceRange}
                                </p>
                              </div>
                              {formData[type.id.toLowerCase() as HardwareKey] === rec.model && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              )}
                            </div>

                            <p className="text-sm mt-2">
                              {rec.description || 'Recommended model for your business type'}
                            </p>

                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {rec.localSupplier || 'Available locally'}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={rec.setupGuideUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Setup Guide <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Box className="h-8 w-8 mx-auto mb-2" />
                        <p>No hardware recommendations available for {businessType} in {country}</p>
                        <Button
                          variant="link"
                          className="mt-2"
                          onClick={() => refetch()}
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Business Type Benefits */}
          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4 bg-muted">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Hardware Tips for {businessType === 'ARTISAN' ? 'Artisans' : businessType}
            </h3>

            <ul className="space-y-2">
              {businessType === 'ARTISAN' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>A portable receipt printer is essential for artisans selling at markets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>For wood workers, a simple mobile POS setup is ideal for workshop sales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Consider a Bluetooth receipt printer that works with your mobile device</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Local suppliers in {country} can provide hardware at competitive prices</span>
                  </li>
                </>
              )}
              {businessType === 'GROCERY' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>A durable receipt printer that handles high volume is crucial for grocery stores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Multiple barcode scanners help speed up checkout during peak hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Consider a cash drawer with multiple compartments for organized cash handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>In {country}, mobile POS systems are increasingly popular for small grocery stores</span>
                  </li>
                </>
              )}
              {businessType === 'CAFE' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>A kitchen printer is essential for sending orders directly to your baristas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Consider a compact setup that fits behind your counter without taking up space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>For coffee shops in {country}, mobile payment readers are becoming standard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>A silent receipt printer helps maintain the cafe ambiance during service</span>
                  </li>
                </>
              )}
              {businessType === 'RETAIL' && (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>A high-speed receipt printer improves customer throughput during busy periods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Consider a wireless barcode scanner for flexibility on the sales floor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>For retail in {country}, integrated card readers are increasingly important</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                    <span>Look for hardware that works well in the local climate conditions</span>
                  </li>
                </>
              )}
            </ul>

            <div className="mt-4 p-3 bg-background rounded-lg border border-orange-400/60 dark:border-orange-500/70">
              <p className="text-sm">
                <strong>Pro Tip:</strong> In East Africa, many businesses start with a basic mobile POS
                setup (smartphone/tablet + portable printer) before investing in more comprehensive hardware.
                This is especially effective for artisans, wood workers, and small retailers.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form
                setFormData({
                  receiptPrinter: businessData?.hardwareConfig?.receiptPrinter || '',
                  barcodeScanner: businessData?.hardwareConfig?.barcodeScanner || '',
                  cashDrawer: businessData?.hardwareConfig?.cashDrawer || '',
                  cardReader: businessData?.hardwareConfig?.cardReader || ''
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
              ) : 'Save Hardware Configuration'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}