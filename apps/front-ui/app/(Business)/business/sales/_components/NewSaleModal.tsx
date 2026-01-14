'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Users, Store, Plus } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { GET_WORKERS } from '@/graphql/worker.gql';
import ClientSelectionModal from './ClientSelectionModal';

interface Worker {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Client {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isVerified: boolean;
}

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSale: (workerId?: string, clientId?: string) => Promise<void>;
  storeId: string;
  userRole: string;
  userId: string;
}

export default function NewSaleModal({
  isOpen,
  onClose,
  onCreateSale,
  storeId,
  userRole,
  userId
}: NewSaleModalProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  // Get workers for the store (only for business owners)
  const { data: workersData, loading: workersLoading } = useQuery(GET_WORKERS, {
    variables: { storeId },
    skip: userRole !== 'business' || !storeId,
  });

  // Auto-select worker based on user role
  useEffect(() => {
    if (userRole === 'worker') {
      setSelectedWorkerId(userId);
    } else if (userRole === 'business' && workersData?.workers?.length > 0) {
      // Don't auto-select for business owners, let them choose
      setSelectedWorkerId('');
    }
  }, [userRole, userId, workersData]);

  const handleCreateSale = async () => {
    try {
      setIsCreating(true);

      // Determine the worker ID to use
      let workerIdToUse: string | undefined;

      if (userRole === 'worker') {
        // Workers create sales for themselves
        workerIdToUse = userId;
      } else if (userRole === 'business') {
        // Business owners can create sales with or without a specific worker
        if (selectedWorkerId && selectedWorkerId !== '') {
          workerIdToUse = selectedWorkerId;
        } else {
          // Business sale without specific worker
          workerIdToUse = undefined;
        }
      }

      await onCreateSale(workerIdToUse, selectedClient?.id);
      handleClose();
    } catch (error: any) {
      console.error('Create sale error:', error);
      showToast('error', 'Error', error.message || 'Failed to create sale');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedWorkerId(userRole === 'worker' ? userId : '');
    setSelectedClient(null);
    setIsCreating(false);
    onClose();
  };

  const workers = workersData?.workers || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Sale</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Worker Selection (only for business owners) */}
            {userRole === 'business' && (
              <div className="space-y-3">
                <Label>Select Worker (Optional)</Label>
                {workersLoading ? (
                  <div className="text-sm text-muted-foreground">Loading workers...</div>
                ) : workers.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No workers found for this store</div>
                ) : (
                  <div className="space-y-2">
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${!selectedWorkerId ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                        }`}
                      onClick={() => setSelectedWorkerId('')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Store className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Business Sale</p>
                          <p className="text-xs text-muted-foreground">Sale without specific worker (worker account is recommended)</p>
                        </div>
                      </div>
                    </div>

                    {workers.map((worker: Worker) => (
                      <div
                        key={worker.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedWorkerId === worker.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                          }`}
                        onClick={() => setSelectedWorkerId(worker.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{worker.fullName}</p>
                            <p className="text-xs text-muted-foreground">{worker.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Worker Info (for workers) */}
            {userRole === 'worker' && (
              <div className="space-y-3">
                <Label>Worker</Label>
                <div className="p-3 border border-primary bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">You (Current Worker)</p>
                      <p className="text-xs text-muted-foreground">Creating sale for yourself</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Client Selection */}
            <div className="space-y-3">
              <Label>Client (Optional)</Label>
              {selectedClient ? (
                <div className="p-3 border border-orange-400/60 dark:border-orange-500/70 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {selectedClient.fullName || selectedClient.username}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClientModal(true)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowClientModal(true)}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Client
                </Button>
              )}
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
                onClick={handleCreateSale}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Start Sale'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Selection Modal */}
      <ClientSelectionModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientSelected={(client) => {
          setSelectedClient(client);
          setShowClientModal(false);
        }}
      />
    </>
  );
}