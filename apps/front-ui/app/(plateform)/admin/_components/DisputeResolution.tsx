// app/admin/_components/DisputeResolution.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_DISPUTES,
  RESOLVE_DISPUTE
} from '@/graphql/admin.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  AlertTriangle,
  Loader2,
  MessageSquare,
  CheckCircle,
  X,
  MapPin,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';
import DisputeDetailModal from './DisputeDetailModal';
import { useToast } from '@/components/toast-provider';
import Loader from '@/components/seraui/Loader';

interface DisputeResolutionProps {
  // Optional props if needed
}

export default function DisputeResolution({ }: DisputeResolutionProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: ''
  });
  const [page, setPage] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const { showToast } = useToast();

  const {
    data: disputesData,
    loading: disputesLoading,
    error: disputesError,
    refetch
  } = useQuery(GET_DISPUTES, {
    variables: {
      search: filters.search || undefined,
      status: filters.status || undefined,
      type: filters.type || undefined,
      page,
      limit: 10
    }
  });

  const [resolveDispute] = useMutation(RESOLVE_DISPUTE);

  const disputes = disputesData?.disputes?.items || [];
  const totalDisputes = disputesData?.disputes?.total || 0;
  const totalPages = Math.ceil(totalDisputes / 10);

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    const resolutionNotes = prompt('Please enter your resolution notes:');
    if (resolutionNotes) {
      try {
        await resolveDispute({
          variables: {
            disputeId,
            resolutionNotes,
            refundAmount: 0,
            compensation: 0
          }
        });

        showToast('success', 'Success', 'Dispute resolved successfully');
        refetch();
      } catch (error: any) {
        showToast('error', 'Resolution Failed', error.message || 'Failed to resolve dispute');
      }
    }
  };

  if (disputesLoading) return <Loader loading={true} />;
  if (disputesError) return <div>Error loading disputes: {disputesError.message}</div>;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search disputes..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full sm:w-32 p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full sm:w-32 p-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Types</option>
            <option value="PAYMENT">Payment Issue</option>
            <option value="PRODUCT">Product Issue</option>
            <option value="SERVICE">Service Issue</option>
            <option value="DELIVERY">Delivery Issue</option>
          </select>
        </div>
      </div>

      {/* Dispute Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left p-4 font-semibold">Dispute</th>
              <th className="text-left p-4 font-semibold">Business</th>
              <th className="text-left p-4 font-semibold">Type</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Reported</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No disputes found matching your criteria
                </td>
              </tr>
            ) : (
              disputes.map((dispute: any) => (
                <tr
                  key={dispute.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium truncate">{dispute.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {dispute.description}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    {dispute.business && (
                      <div className="flex items-center gap-2">
                        {dispute.business.avatar ? (
                          <img
                            src={dispute.business.avatar}
                            alt={dispute.business.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                            {dispute.business.name.charAt(0)}
                          </div>
                        )}
                        <span>{dispute.business.name}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${dispute.type === 'PAYMENT' ? 'bg-destructive/10 text-destructive' :
                      dispute.type === 'PRODUCT' ? 'bg-warning/10 text-warning' :
                        dispute.type === 'SERVICE' ? 'bg-info/10 text-info' :
                          'bg-muted'
                      }`}>
                      {dispute.type}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${dispute.status === 'OPEN' ? 'bg-warning/10 text-warning' :
                      dispute.status === 'IN_PROGRESS' ? 'bg-info/10 text-info' :
                        'bg-success/10 text-success'
                      }`}>
                      {dispute.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(dispute.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>

                      {dispute.status !== 'RESOLVED' && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-success"
                          onClick={() => handleResolveDispute(dispute.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalDisputes > 10 && (
        <div className="p-4 bg-muted border-t border-border flex justify-between items-center">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </Button>
          <span>Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <DisputeDetailModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolved={refetch}
        />
      )}
    </div>
  );
}