// app/admin/_components/UserManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  GET_USERS,
  ON_NEW_BUSINESS,
  ON_NEW_CLIENT,
  ON_NEW_WORKER,
  ON_NEW_ADMIN
} from '@/graphql/admin.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Users,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Eye,
  Ban,
  CheckCircle,
  X,
  MapPin,
  Calendar,
  Building2,
  User,
  Briefcase,
  Settings
} from 'lucide-react';
import UserDetailModal from './UserDetailModal';
import { useToast } from '@/components/toast-provider';
import Loader from '@/components/seraui/Loader';

interface UserManagementProps {
  // Optional props if needed
}

export default function UserManagement({ }: UserManagementProps) {
  const [filters, setFilters] = useState({
    search: '',
    userType: 'BUSINESS',
    status: '',
    kycStatus: '',
    businessType: ''
  });
  const [page, setPage] = useState(1);
  const { showToast } = useToast();
  const [selectedUser, setSelectedUser] = useState<{ user: any, type: string } | null>(null);

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch
  } = useQuery(GET_USERS, {
    variables: {
      input: {
        search: filters.search || undefined,
        userType: filters.userType !== 'ALL' ? filters.userType : undefined,
        status: filters.status || undefined,
        kycStatus: filters.kycStatus || undefined,
        businessType: filters.businessType || undefined,
        page,
        limit: 10,
      },

      includeBusinesses: filters.userType === 'BUSINESS',
      includeClients: filters.userType === 'CLIENT',
      includeWorkers: filters.userType === 'WORKER',
      includeAdmins: filters.userType === 'ADMIN',
    }
  });

  // Handle real-time updates for each user type
  useSubscription(ON_NEW_BUSINESS, {
    onData: ({ data }) => {
      if (filters.userType === 'ALL' || filters.userType === 'BUSINESS') {
        refetch();
      }
    }
  });

  useSubscription(ON_NEW_CLIENT, {
    onData: ({ data }) => {
      if (filters.userType === 'ALL' || filters.userType === 'CLIENT') {
        refetch();
      }
    }
  });

  useSubscription(ON_NEW_WORKER, {
    onData: ({ data }) => {
      if (filters.userType === 'ALL' || filters.userType === 'WORKER') {
        refetch();
      }
    }
  });

  useSubscription(ON_NEW_ADMIN, {
    onData: ({ data }) => {
      if (filters.userType === 'ALL' || filters.userType === 'ADMIN') {
        refetch();
      }
    }
  });

  const getUserTypeData = () => {
    if (filters.userType === 'BUSINESS') {
      return {
        items: usersData?.all_businesses?.items || [],
        total: usersData?.all_businesses?.total || 0
      };
    } else if (filters.userType === 'CLIENT') {
      return {
        items: usersData?.all_clients?.items || [],
        total: usersData?.all_clients?.total || 0
      };
    } else if (filters.userType === 'WORKER') {
      return {
        items: usersData?.workers?.items || [],
        total: usersData?.workers?.total || 0
      };
    } else if (filters.userType === 'ADMIN') {
      return {
        items: usersData?.all_admins?.items || [],
        total: usersData?.all_admins?.total || 0
      };
    } else {
      // ALL user types
      const allItems = [
        ...(usersData?.all_businesses?.items?.map((item: any) => ({ ...item, userType: 'BUSINESS' })) || []),
        ...(usersData?.all_clients?.items?.map((item: any) => ({ ...item, userType: 'CLIENT' })) || []),
        ...(usersData?.all_workers?.items?.map((item: any) => ({ ...item, userType: 'WORKER' })) || []),
        ...(usersData?.all_admins?.items?.map((item: any) => ({ ...item, userType: 'ADMIN' })) || [])
      ];

      return {
        items: allItems,
        total: (usersData?.all_businesses?.total || 0) +
          (usersData?.all_clients?.total || 0) +
          (usersData?.all_workers?.total || 0) +
          (usersData?.all_admins?.total || 0)
      };
    }
  };

  const { items: users, total: totalUsers } = getUserTypeData();
  const totalPages = Math.ceil(totalUsers / 10);

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

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'BUSINESS':
        return <Building2 className="h-4 w-4 text-primary" />;
      case 'CLIENT':
        return <User className="h-4 w-4 text-success" />;
      case 'WORKER':
        return <Briefcase className="h-4 w-4 text-warning" />;
      case 'ADMIN':
        return <Settings className="h-4 w-4 text-destructive" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getUserStatus = (user: any, userType: string) => {
    switch (userType) {
      case 'BUSINESS':
        return user.kycStatus;
      case 'CLIENT':
        return 'ACTIVE'; // Clients don't have a status field in your schema
      case 'WORKER':
        return user.isVerified ? 'VERIFIED' : 'PENDING';
      case 'ADMIN':
        return user.isActive ? 'ACTIVE' : 'INACTIVE';
      default:
        return 'N/A';
    }
  };

  const getUserStatusBadge = (user: any, userType: string) => {
    const status = getUserStatus(user, userType);

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${status === 'VERIFIED' || status === 'ACTIVE' ? 'bg-success/10 text-success' :
        status === 'PENDING' || status === 'INACTIVE' ? 'bg-warning/10 text-warning' :
          'bg-destructive/10 text-destructive'
        }`}>
        {status}
      </span>
    );
  };

  if (usersLoading) return <Loader loading={true} />;
  if (usersError) return <div>Error loading users: {usersError.message}</div>;

  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.userType}
            onChange={(e) => handleFilterChange('userType', e.target.value)}
            className="w-full sm:w-32 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="ALL">All User Types</option>
            <option value="BUSINESS">Businesses</option>
            <option value="CLIENT">Clients</option>
            <option value="WORKER">Workers</option>
            <option value="ADMIN">Admins</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full sm:w-32 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {filters.userType === 'BUSINESS' && (
            <select
              value={filters.kycStatus}
              onChange={(e) => handleFilterChange('kycStatus', e.target.value)}
              className="w-full sm:w-32 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">KYC Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          )}

          {(filters.userType === 'BUSINESS' || filters.userType === 'WORKER') && (
            <select
              value={filters.businessType}
              onChange={(e) => handleFilterChange('businessType', e.target.value)}
              className="w-full sm:w-40 p-2 border border-orange-400/60 dark:border-orange-500/70 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Business Type</option>
              <option value="ARTISAN">Artisan & Handcrafted Goods</option>
              <option value="BOOKSTORE">Bookstore & Stationery</option>
              <option value="ELECTRONICS">Electronics & Gadgets</option>
              <option value="HARDWARE">Hardware & Tools</option>
              <option value="GROCERY">Grocery & Convenience</option>
              <option value="CAFE">Café & Coffee Shops</option>
              <option value="RESTAURANT">Restaurant & Dining</option>
              <option value="RETAIL">Retail & General Stores</option>
              <option value="BAR">Bar & Pub</option>
              <option value="CLOTHING">Clothing & Accessories</option>
            </select>
          )}
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="text-left p-4 font-semibold">User</th>
              <th className="text-left p-4 font-semibold">Type</th>
              <th className="text-left p-4 font-semibold">Status</th>
              {filters.userType === 'BUSINESS' && (
                <th className="text-left p-4 font-semibold">Business Type</th>
              )}
              <th className="text-left p-4 font-semibold">Joined</th>
              <th className="text-right p-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No users found matching your criteria
                </td>
              </tr>
            ) : (
              users.map((user: any) => {
                const userType = user.userType || filters.userType;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName || user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                            {user.fullName?.charAt(0) || user.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {user.fullName || user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getUserTypeIcon(userType)}
                        <span className="capitalize">
                          {userType.toLowerCase()}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {getUserStatusBadge(user, userType)}
                    </td>

                    {userType === 'BUSINESS' && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>
                            {user.businessType === 'ARTISAN' && '🎨 Artisan'}
                            {user.businessType === 'BOOKSTORE' && '📚 Bookstore'}
                            {user.businessType === 'ELECTRONICS' && '🔌 Electronics'}
                            {user.businessType === 'HARDWARE' && '🔨 Hardware'}
                            {user.businessType === 'GROCERY' && '🛒 Grocery'}
                            {user.businessType === 'CAFE' && '☕ Café'}
                            {user.businessType === 'RESTAURANT' && '🍽️ Restaurant'}
                            {user.businessType === 'RETAIL' && '🏬 Retail'}
                            {user.businessType === 'BAR' && '🍷 Bar'}
                            {user.businessType === 'CLOTHING' && '👕 Clothing'}
                            {!user.businessType && 'N/A'}
                          </span>
                        </div>
                      </td>
                    )}

                    <td className="p-4">
                      <div className="flex flex-col">
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedUser({ user, type: userType })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalUsers > 10 && (
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

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser.user}
          userType={selectedUser.type}
          onClose={() => setSelectedUser(null)}
          onKycVerified={refetch}
        />
      )}
    </div>
  );
}