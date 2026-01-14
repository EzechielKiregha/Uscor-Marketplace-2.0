// app/admin/_components/DisputeDetailModal.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Loader2,
  X,
  MessageSquare,
  CheckCircle,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useMutation } from '@apollo/client';
import { RESOLVE_DISPUTE } from '@/graphql/admin.gql';

interface DisputeDetailModalProps {
  dispute: any;
  onClose: () => void;
  onResolved: () => void;
}

export default function DisputeDetailModal({
  dispute,
  onClose,
  onResolved
}: DisputeDetailModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [compensation, setCompensation] = useState('');
  const [resolving, setResolving] = useState(false);
  const { showToast } = useToast();

  const [resolveDispute] = useMutation(RESOLVE_DISPUTE);

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      showToast('error', 'Validation Error', 'Resolution notes are required');
      return;
    }

    setResolving(true);
    try {
      await resolveDispute({
        variables: {
          disputeId: dispute.id,
          resolutionNotes,
          refundAmount: refundAmount ? parseFloat(refundAmount) : 0,
          compensation: compensation ? parseFloat(compensation) : 0
        }
      });

      showToast('success', 'Success', 'Dispute resolved successfully');
      onResolved();
      onClose();
    } catch (error: any) {
      showToast('error', 'Resolution Failed', error.message || 'Failed to resolve dispute');
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h2 className="text-xl font-bold">Dispute Details</h2>
              </div>
              <p className="text-muted-foreground mt-1">
                #{dispute.id.substring(0, 8)} • {dispute.status}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dispute Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Dispute Summary */}
              <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">Dispute Summary</h3>
                </div>

                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${dispute.type === 'PAYMENT' ? 'bg-destructive/10 text-destructive' :
                        dispute.type === 'PRODUCT' ? 'bg-warning/10 text-warning' :
                          dispute.type === 'SERVICE' ? 'bg-info/10 text-info' :
                            'bg-muted'
                        }`}>
                        {dispute.type}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${dispute.status === 'OPEN' ? 'bg-warning/10 text-warning' :
                        dispute.status === 'IN_PROGRESS' ? 'bg-info/10 text-info' :
                          'bg-success/10 text-success'
                        }`}>
                        {dispute.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reported</p>
                      <div className="flex flex-col">
                        <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(dispute.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {dispute.resolvedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                        <div className="flex flex-col">
                          <span>{new Date(dispute.resolvedAt).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(dispute.resolvedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Involved Parties */}
              <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">Involved Parties</h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Reporter */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Reported By</p>
                    <div className="flex items-center gap-3">
                      {dispute.reporter.avatar ? (
                        <img
                          src={dispute.reporter.avatar}
                          alt={dispute.reporter.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                          {dispute.reporter.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{dispute.reporter.fullName}</p>
                        <p className="text-sm text-muted-foreground">Customer</p>
                      </div>
                    </div>
                  </div>

                  {/* Business */}
                  {dispute.business && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Business</p>
                      <div className="flex items-center gap-3">
                        {dispute.business.avatar ? (
                          <img
                            src={dispute.business.avatar}
                            alt={dispute.business.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                            {dispute.business.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{dispute.business.name}</p>
                          <p className="text-sm text-muted-foreground">Business</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order */}
                  {dispute.order && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Order</p>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">#{dispute.order.orderNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Actions */}
              {dispute.status !== 'RESOLVED' && (
                <div className="space-y-2">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleResolve}
                    disabled={resolving}
                  >
                    {resolving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Resolving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve Dispute
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // In a real app, this would send a message to the parties
                      showToast('info', 'Feature Coming Soon', 'Messaging feature will be available soon');
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Parties
                  </Button>
                </div>
              )}
            </div>

            {/* Dispute Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dispute Description */}
              <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">Dispute Description</h3>
                </div>

                <div className="p-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {dispute.description}
                  </p>
                </div>
              </div>

              {/* Communication History */}
              <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">Communication History</h3>
                </div>

                <div className="divide-y divide-border max-h-96 overflow-y-auto">
                  {dispute.messages && dispute.messages.length > 0 ? (
                    dispute.messages.map((message: any) => (
                      <div key={message.id} className="p-4">
                        <div className="flex items-start gap-3">
                          {message.sender.avatar ? (
                            <img
                              src={message.sender.avatar}
                              alt={message.sender.fullName}
                              className="w-8 h-8 rounded-full object-cover mt-1"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs mt-1">
                              {message.sender.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{message.sender.fullName}</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No messages yet
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button variant="default">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              {/* Resolution Details */}
              {dispute.status === 'RESOLVED' && dispute.resolutionNotes && (
                <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                  <div className="p-4 bg-muted border-b border-border">
                    <h3 className="font-semibold">Resolution Details</h3>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Resolution Notes</p>
                      <p className="text-muted-foreground">
                        {dispute.resolutionNotes}
                      </p>
                    </div>

                    {(dispute.refundAmount > 0 || dispute.compensation > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        {dispute.refundAmount > 0 && (
                          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="h-4 w-4 text-destructive" />
                              <p className="text-sm text-muted-foreground">Refund</p>
                            </div>
                            <p className="font-bold">${dispute.refundAmount.toFixed(2)}</p>
                          </div>
                        )}

                        {dispute.compensation > 0 && (
                          <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="h-4 w-4 text-success" />
                              <p className="text-sm text-muted-foreground">Compensation</p>
                            </div>
                            <p className="font-bold">${dispute.compensation.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resolution Form */}
              {dispute.status !== 'RESOLVED' && (
                <div className="border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
                  <div className="p-4 bg-muted border-b border-border">
                    <h3 className="font-semibold">Resolve Dispute</h3>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <label htmlFor="resolutionNotes" className="block text-sm font-medium mb-1">
                        Resolution Notes
                      </label>
                      <Textarea
                        id="resolutionNotes"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Explain how you resolved this dispute..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="refundAmount" className="block text-sm font-medium mb-1">
                          Refund Amount ($)
                        </label>
                        <Input
                          id="refundAmount"
                          type="number"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label htmlFor="compensation" className="block text-sm font-medium mb-1">
                          Compensation ($)
                        </label>
                        <Input
                          id="compensation"
                          type="number"
                          value={compensation}
                          onChange={(e) => setCompensation(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Note:</span> Refund amounts will be
                        deducted from the business's account. Compensation amounts will be
                        paid from platform funds as a goodwill gesture.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}