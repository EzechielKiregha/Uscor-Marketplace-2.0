// app/business/loyalty/_components/RedemptionProcess.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CUSTOMER_POINTS,
  REDEEM_POINTS
} from '@/graphql/loyalty.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Gift,
  CreditCard,
  ShoppingCart,
  Scan,
  CheckCircle,
  AlertTriangle,
  User,
  X,
  Minus,
  Plus,
  Star
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loader from '@/components/seraui/Loader';
import { useMe } from '@/lib/useMe';

interface RedemptionProcessProps {
  programId: string;
  loading: boolean;
}

export default function RedemptionProcess({
  programId,
  loading
}: RedemptionProcessProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [redemptionReason, setRedemptionReason] = useState('');
  const [transactionAmount, setTransactionAmount] = useState(0);
  const { showToast } = useToast()
  const user = useMe();

  const {
    data: customersData,
    loading: customersLoading,
    refetch
  } = useQuery(GET_CUSTOMER_POINTS, {
    variables: {
      businessId: user?.id,
      clientId: 'current-client-id'
    },
    skip: !programId
  });

  const [redeemPoints] = useMutation(REDEEM_POINTS);

  const filteredCustomers = useMemo(() => {
    if (!customersData?.customerPoints) return [];

    return customersData.customerPoints.filter((customer: any) =>
      customer.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.totalPoints.toString().includes(searchQuery)
    );
  }, [customersData, searchQuery]);

  const handleRedeemPoints = async () => {
    if (!selectedCustomer || pointsToRedeem <= 0 || pointsToRedeem > selectedCustomer.totalPoints) return;

    try {
      await redeemPoints({
        variables: {
          input: {
            businessId: user?.id,
            clientId: selectedCustomer.clientId,
            points: pointsToRedeem,
            reason: redemptionReason || 'Redeemed reward'
          }
        }
      });

      showToast('success', 'Points Redeemed', `${pointsToRedeem} points redeemed for ${selectedCustomer.clientName}`);
      setSelectedCustomer(null);
      setPointsToRedeem(0);
      setRedemptionReason('');
      setTransactionAmount(0);
      refetch();
    } catch (error) {
      showToast('error', 'Error', 'Failed to redeem points');
    }
  };

  const calculateDiscount = () => {
    // Assuming 100 points = $1 discount
    return (pointsToRedeem / 100).toFixed(2);
  };

  const handleScan = () => {
    setScanning(true);
    // In a real implementation, this would interface with a barcode scanner
    setTimeout(() => {
      // Simulate scan result
      const sampleCustomers = [
        { id: 'cust-1', name: 'Sarah Johnson', points: 150 },
        { id: 'cust-2', name: 'Michael Thompson', points: 225 },
        { id: 'cust-3', name: 'Elena Rodriguez', points: 310 }
      ];

      const randomCustomer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
      setScanResult(randomCustomer.id);
      setScanning(false);

      // Find the customer in our data
      const customer = filteredCustomers.find((c: any) => c.clientId === randomCustomer.id);
      if (customer) {
        setSelectedCustomer(customer);
        setPointsToRedeem(Math.min(100, customer.totalPoints));
      }
    }, 1500);
  };

  const handleTransactionAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setTransactionAmount(amount);

    // Calculate points to earn (1 point per $1)
    const points = Math.floor(amount);
    setPointsToRedeem(Math.min(points, selectedCustomer?.totalPoints || 0));
  };

  if (loading || customersLoading) return (
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Redemption Process */}
      <div className="lg:col-span-2">
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Redemption Process
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Customer Selection */}
              <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">1. Select Customer</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScan}
                    disabled={scanning}
                  >
                    {scanning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin mr-2" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Scan Card
                      </>
                    )}
                  </Button>
                </div>

                {selectedCustomer ? (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg">
                      {selectedCustomer.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{selectedCustomer.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        Available: {selectedCustomer.totalPoints} points
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search customer by name or scan loyalty card..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                )}

                {!selectedCustomer && filteredCustomers.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    {filteredCustomers.slice(0, 5).map((customer: any) => (
                      <div
                        key={customer.clientId}
                        className="flex items-center justify-between p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setPointsToRedeem(Math.min(100, customer.totalPoints));
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                            {customer.clientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{customer.clientName}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{customer.totalPoints} pts</p>
                          <p className="text-sm text-success">Ready to redeem</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transaction Details */}
              {selectedCustomer && (
                <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">2. Enter Transaction Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Transaction Amount
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          $
                        </div>
                        <Input
                          type="number"
                          value={transactionAmount}
                          onChange={handleTransactionAmountChange}
                          className="pl-9"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Customer will earn {transactionAmount} points for this transaction
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Points to Redeem
                      </label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPointsToRedeem(Math.max(100, Math.min(selectedCustomer.totalPoints, pointsToRedeem - 100)))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={pointsToRedeem}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setPointsToRedeem(Math.min(selectedCustomer.totalPoints, Math.max(100, value)));
                          }}
                          className="w-20 text-center"
                          min="100"
                          max={selectedCustomer.totalPoints}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPointsToRedeem(Math.min(selectedCustomer.totalPoints, pointsToRedeem + 100))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        100 points = $1 discount
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Transaction Amount:</span>
                      <span>${transactionAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Points to Redeem:</span>
                      <span>{pointsToRedeem}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-border">
                      <span>Total Discount:</span>
                      <span>-${calculateDiscount()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Redemption Confirmation */}
              {selectedCustomer && (
                <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">3. Confirm Redemption</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Redemption Reason</label>
                      <textarea
                        value={redemptionReason}
                        onChange={(e) => setRedemptionReason(e.target.value)}
                        placeholder="e.g., 10% discount on handmade pottery"
                        rows={2}
                      />
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Customer will receive:</span>
                        <span className="text-primary font-bold">-${calculateDiscount()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This discount will be applied to the current transaction
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedCustomer(null);
                          setTransactionAmount(0);
                          setPointsToRedeem(0);
                          setRedemptionReason('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
                        onClick={handleRedeemPoints}
                        disabled={pointsToRedeem < 100 || pointsToRedeem > selectedCustomer.totalPoints}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Redemption
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Program Benefits */}
      <div className="lg:col-span-1">
        <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Loyalty Program Benefits</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                For Local Artisans & Craftsmen
              </h3>
              <ul className="space-y-2 mt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                  <span>Build customer loyalty for your handmade products</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                  <span>Reward customers while helping them access more affordable local products</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                  <span>Create a community around your locally-made goods</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                  <span>Encourage repeat customers from your neighborhood</span>
                </li>
              </ul>
            </div>

            <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Best Practices
              </h3>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">For Wood Workers & Tool Makers</h4>
                  <p className="text-sm text-muted-foreground">
                    Offer special redemption options like "200 points = 10% off a custom woodworking project"
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">For Local Retailers</h4>
                  <p className="text-sm text-muted-foreground">
                    Create seasonal promotions where points earned on local products can be redeemed for community events
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">For Artisans</h4>
                  <p className="text-sm text-muted-foreground">
                    Partner with other local businesses to create a community-wide loyalty program
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Sample Redemption Options
              </h3>

              <div className="space-y-2 mt-3">
                <div className="p-2 bg-background rounded border">
                  <p className="text-sm">100 points = $1 off any purchase</p>
                </div>
                <div className="p-2 bg-background rounded border">
                  <p className="text-sm">500 points = Free small handmade item</p>
                </div>
                <div className="p-2 bg-background rounded border">
                  <p className="text-sm">1000 points = 15% off custom order</p>
                </div>
                <div className="p-2 bg-background rounded border">
                  <p className="text-sm">2000 points = Featured on local artisan showcase</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  // Logic to customize redemption options
                }}
              >
                Customize Redemption Options
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}