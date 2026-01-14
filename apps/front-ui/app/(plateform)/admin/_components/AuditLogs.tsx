// app/admin/_components/AuditLogs.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_AUDIT_LOGS } from '@/graphql/admin.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity,
  Filter,
  Search,
  Calendar,
  Clock,
  Users,
  Settings,
  AlertTriangle,
  Loader2,
  Eye,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import Loader from '@/components/seraui/Loader';

interface AuditLogsProps {
  // Optional props if needed
}

export default function AuditLogs({ }: AuditLogsProps) {
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(1);

  const {
    data: auditLogsData,
    loading: auditLogsLoading,
    error: auditLogsError,
    refetch
  } = useQuery(GET_AUDIT_LOGS, {
    variables: {
      search: filters.search || undefined,
      action: filters.action || undefined,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      page,
      limit: 10
    }
  });

  const auditLogs = auditLogsData?.auditLogs?.items || [];
  const totalLogs = auditLogsData?.auditLogs?.total || 0;
  const totalPages = Math.ceil(totalLogs / 10);

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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case 'LOGOUT':
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case 'CREATE':
        return <Settings className="h-4 w-4 text-muted-foreground" />;
      case 'UPDATE':
        return <Settings className="h-4 w-4 text-muted-foreground" />;
      case 'DELETE':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'VERIFY_KYC':
        return <ShieldCheck className="h-4 w-4 text-success" />;
      case 'REJECT_KYC':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'RESOLVE_DISPUTE':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (auditLogsLoading) return <Loader loading={true} />;
  if (auditLogsError) return <div>Error loading audit logs: {auditLogsError.message}</div>;

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search audit logs..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="w-full sm:w-32 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VERIFY_KYC">Verify KYC</option>
            <option value="REJECT_KYC">Reject KYC</option>
            <option value="RESOLVE_DISPUTE">Resolve Dispute</option>
          </select>

          <div className="flex gap-2">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-36"
              max={filters.endDate || new Date().toISOString().split('T')[0]}
            />
            <span className="flex items-center">to</span>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-36"
              min={filters.startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left p-4 font-semibold">Action</th>
              <th className="text-left p-4 font-semibold">Entity</th>
              <th className="text-left p-4 font-semibold">Performed By</th>
              <th className="text-left p-4 font-semibold">Timestamp</th>
              <th className="text-right p-4 font-semibold">Details</th>
            </tr>
          </thead>

          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No audit logs found matching your criteria
                </td>
              </tr>
            ) : (
              auditLogs.map((log: any) => (
                <tr
                  key={log.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="capitalize">{log.action.toLowerCase().replace('_', ' ')}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div>
                      <p className="font-medium capitalize">{log.entityType.toLowerCase()}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        ID: {log.entityId.substring(0, 8)}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {log.admin.avatar ? (
                        <img
                          src={log.admin.avatar}
                          alt={log.admin.fullName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {log.admin.fullName.charAt(0)}
                        </div>
                      )}
                      <span>{log.admin.fullName}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="icon"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalLogs > 10 && (
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
    </div>
  );
}