// app/business/loyalty/_components/CustomerPointsManagement.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CUSTOMER_POINTS,
  EARN_POINTS,
  REDEEM_POINTS
} from '@/graphql/loyalty.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Star,
  Plus,
  Minus,
  Gift,
  User,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';

interface CustomerPointsManagementProps {
  programId: string;
  loading: boolean;
}

export default function CustomerPointsManagement({
  programId,
  loading
}: CustomerPointsManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPointsModal, setShowAddPointsModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [redemptionReason, setRedemptionReason] = useState('');
  const { showToast } = useToast();
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

  const [earnPoints] = useMutation(EARN_POINTS);
  const [redeemPoints] = useMutation(REDEEM_POINTS);

  const filteredCustomers = useMemo(() => {
    if (!customersData?.customerPoints) return [];

    return customersData.customerPoints.filter((customer: any) =>
      customer.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.totalPoints.toString().includes(searchQuery)
    );
  }, [customersData, searchQuery]);

  const handleAddPoints = async () => {
    if (!selectedCustomer || pointsToAdd <= 0) return;

    try {
      await earnPoints({
        variables: {
          input: {
            businessId: user?.id,
            clientId: selectedCustomer.clientId,
            points: pointsToAdd,
            reason: 'Manual adjustment'
          }
        }
      });

      showToast('success', 'Points Added', `${pointsToAdd} points added to ${selectedCustomer.clientName}`);
      setShowAddPointsModal(false);
      setPointsToAdd(0);
      refetch();
    } catch (error) {
      showToast('error', 'Error', 'Failed to add points');
    }
  };

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
      setShowRedeemModal(false);
      setPointsToRedeem(0);
      setRedemptionReason('');
      refetch();
    } catch (error) {
      showToast('error', 'Error', 'Failed to redeem points');
    }
  };

  const getPointsStatus = (customer: any) => {
    const progress = (customer.totalPoints / 100) * 100; // Assuming 100 points to redeem
    return {
      progress,
      status: progress >= 100 ? 'ready' : progress >= 75 ? 'close' : 'building'
    };
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
    <Card className="border border-orange-400/60 dark:border-orange-500/70 bg-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg">Customer Points Management</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage points for your loyalty program members
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Button
              variant="default"
              onClick={() => setShowAddPointsModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Points
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No matching customers found' : 'No customers enrolled in loyalty program yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Customer</th>
                  <th className="py-3 font-medium">Total Points</th>
                  <th className="py-3 font-medium">Progress</th>
                  <th className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer: any) => {
                  const status = getPointsStatus(customer);
                  return (
                    <tr key={customer.clientId} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                            {customer.clientName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{customer.clientName}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-medium">{customer.totalPoints}</td>
                      <td className="py-3">
                        <div className="space-y-1">
                          <div className="w-full bg-border rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${status.status === 'ready' ? 'bg-success' :
                                status.status === 'close' ? 'bg-warning' : 'bg-primary'
                                }`}
                              style={{ width: `${Math.min(status.progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {customer.totalPoints} / 100 points
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setPointsToRedeem(Math.min(100, customer.totalPoints));
                              setShowRedeemModal(true);
                            }}
                            disabled={customer.totalPoints < 100}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Redeem
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowAddPointsModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Add Points Modal */}
      {showAddPointsModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Add Points</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCustomer
                      ? `Add points for ${selectedCustomer.clientName}`
                      : 'Select a customer to add points'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAddPointsModal(false);
                    setSelectedCustomer(null);
                    setPointsToAdd(0);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!selectedCustomer ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a customer from the list to add points</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                      {selectedCustomer.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{selectedCustomer.clientName}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPointsToAdd(Math.max(0, pointsToAdd - 10))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={pointsToAdd}
                        onChange={(e) => setPointsToAdd(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 text-center"
                        min="0"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPointsToAdd(pointsToAdd + 10)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Reason</label>
                      <Input
                        type="text"
                        placeholder="e.g., Special promotion, Birthday bonus"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddPointsModal(false);
                        setSelectedCustomer(null);
                        setPointsToAdd(0);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary hover:bg-accent text-primary-foreground"
                      onClick={handleAddPoints}
                      disabled={pointsToAdd <= 0}
                    >
                      Add {pointsToAdd} Points
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Redeem Points Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Redeem Points</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Redeem points for {selectedCustomer?.clientName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowRedeemModal(false);
                    setSelectedCustomer(null);
                    setPointsToRedeem(0);
                    setRedemptionReason('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                    {selectedCustomer?.clientName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedCustomer?.clientName}</p>
                    <p className="text-sm text-muted-foreground">Available: {selectedCustomer?.totalPoints} points</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Points to Redeem</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPointsToRedeem(Math.max(100, Math.min(selectedCustomer?.totalPoints, pointsToRedeem - 100)))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={pointsToRedeem}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setPointsToRedeem(Math.min(selectedCustomer?.totalPoints, Math.max(100, value)));
                        }}
                        className="w-20 text-center"
                        min="100"
                        max={selectedCustomer?.totalPoints}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPointsToRedeem(Math.min(selectedCustomer?.totalPoints, pointsToRedeem + 100))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Minimum redemption: 100 points
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Redemption Reason</label>
                    <textarea
                      value={redemptionReason}
                      onChange={(e) => setRedemptionReason(e.target.value)}
                      placeholder="e.g., 10% discount on handmade pottery"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Points Redeemed:</span>
                    <span className="font-medium">{pointsToRedeem}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Value:</span>
                    <span>${(pointsToRedeem / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRedeemModal(false);
                      setSelectedCustomer(null);
                      setPointsToRedeem(0);
                      setRedemptionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-accent text-primary-foreground"
                    onClick={handleRedeemPoints}
                    disabled={pointsToRedeem < 100 || pointsToRedeem > (selectedCustomer?.totalPoints || 0)}
                  >
                    Redeem {pointsToRedeem} Points
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}