// app/admin/_components/UserDetailModal.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  X,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Star,
  BriefcaseBusiness,
  Building2,
  User,
  Settings,
  Ban,
  CheckCircle,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useMutation } from '@apollo/client';
import { VERIFY_KYC, REJECT_KYC, UPDATE_USER_STATUS } from '@/graphql/admin.gql';

interface UserDetailModalProps {
  user: any;
  userType: string;
  onClose: () => void;
  onKycVerified: () => void;
}

export default function UserDetailModal({
  user,
  userType,
  onClose,
  onKycVerified
}: UserDetailModalProps) {
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const { showToast } = useToast();

  const [verifyKyc] = useMutation(VERIFY_KYC);
  const [rejectKyc] = useMutation(REJECT_KYC);
  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS);

  const handleVerifyKyc = async () => {
    setVerifying(true);
    try {
      await verifyKyc({
        variables: {
          businessId: user.id,
          notes: 'KYC verified by admin'
        }
      });

      showToast('success', 'Success', 'Business KYC verified successfully');
      onKycVerified();
      onClose();
    } catch (error: any) {
      showToast('error', 'Verification Failed', error.message || 'Failed to verify KYC');
      setVerifying(false);
    }
  };

  const handleRejectKyc = async () => {
    const rejectionReason = prompt('Please enter the reason for rejection:');
    if (rejectionReason) {
      setRejecting(true);
      try {
        await rejectKyc({
          variables: {
            businessId: user.id,
            rejectionReason
          }
        });

        showToast('success', 'Success', 'Business KYC rejected successfully');
        onKycVerified();
        onClose();
      } catch (error: any) {
        showToast('error', 'Rejection Failed', error.message || 'Failed to reject KYC');
        setRejecting(false);
      }
    }
  };

  const handleSuspendUser = async () => {
    setSuspending(true);
    try {
      await updateUserStatus({
        variables: {
          id: user.id,
          userType,
          status: userType === 'ADMIN' ? 'INACTIVE' : 'SUSPENDED'
        }
      });

      showToast('success', 'Success', `${userType} account suspended successfully`);
      onKycVerified();
      onClose();
    } catch (error: any) {
      showToast('error', 'Suspension Failed', error.message || 'Failed to suspend account');
      setSuspending(false);
    }
  };

  const handleActivateUser = async () => {
    setSuspending(true);
    try {
      await updateUserStatus({
        variables: {
          id: user.id,
          userType,
          status: userType === 'ADMIN' ? 'ACTIVE' : 'ACTIVE'
        }
      });

      showToast('success', 'Success', `${userType} account activated successfully`);
      onKycVerified();
      onClose();
    } catch (error: any) {
      showToast('error', 'Activation Failed', error.message || 'Failed to activate account');
      setSuspending(false);
    }
  };

  const getUserStatus = () => {
    if (userType === 'BUSINESS') {
      return user.kycStatus;
    } else if (userType === 'CLIENT') {
      return 'ACTIVE'; // Clients don't have a status field in your schema
    } else if (userType === 'WORKER') {
      return user.isVerified ? 'VERIFIED' : 'PENDING';
    } else if (userType === 'ADMIN') {
      return user.isActive ? 'ACTIVE' : 'INACTIVE';
    }
    return 'N/A';
  };

  const renderUserTypeSpecificContent = () => {
    switch (userType) {
      case 'BUSINESS':
        return (
          <>
            {/* Business Information */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Business Information</h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Business Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Business Type</p>
                    <div className="flex items-center gap-2">
                      <span>
                        {user.businessType === 'ARTISAN' && '🎨 Artisan & Handcrafted Goods'}
                        {user.businessType === 'BOOKSTORE' && '📚 Bookstore & Stationery'}
                        {user.businessType === 'ELECTRONICS' && '🔌 Electronics & Gadgets'}
                        {user.businessType === 'HARDWARE' && '🔨 Hardware & Tools'}
                        {user.businessType === 'GROCERY' && '🛒 Grocery & Convenience'}
                        {user.businessType === 'CAFE' && '☕ Café & Coffee Shops'}
                        {user.businessType === 'RESTAURANT' && '🍽️ Restaurant & Dining'}
                        {user.businessType === 'RETAIL' && '🏬 Retail & General Stores'}
                        {user.businessType === 'BAR' && '🍷 Bar & Pub'}
                        {user.businessType === 'CLOTHING' && '👕 Clothing & Accessories'}
                        {!user.businessType && 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="font-medium">{user.address || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">B2B Enabled</p>
                    <p className="font-medium">{user.isB2BEnabled ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Products Sold</p>
                </div>
                <p className="font-bold text-lg">{user.totalProductsSold}</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Workers</p>
                </div>
                <p className="font-bold text-lg">{user.totalWorkers}</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                </div>
                <p className="font-bold text-lg">{user.totalClients}</p>
              </div>
            </div>

            {/* Business Stats */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Business Statistics</h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                    <p className="font-medium">{user.totalSales}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="font-medium">${user.totalRevenueGenerated.toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Workers</p>
                    <p className="font-medium">{user.totalWorkers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Description */}
            {user.description && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">Business Description</h3>
                </div>

                <div className="p-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {user.description}
                  </p>
                </div>
              </div>
            )}
          </>
        );

      case 'CLIENT':
        return (
          <>
            {/* Client Information */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Client Information</h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="font-medium">{user.fullName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="font-medium">{user.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
                <p className="font-bold text-lg">{user.totalOrders}</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
                <p className="font-bold text-lg">${user.totalSpent.toFixed(2)}</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                </div>
                <p className="font-bold text-lg">{user.loyaltyPoints}</p>
              </div>
            </div>

            {/* Addresses */}
            {user.addresses && user.addresses.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">Addresses</h3>
                </div>

                <div className="divide-y divide-border">
                  {user.addresses.map((address: any) => (
                    <div key={address.id} className="p-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{address.street}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.country}
                          </p>
                          {address.postalCode && (
                            <p className="text-sm text-muted-foreground">
                              Postal Code: {address.postalCode}
                            </p>
                          )}
                        </div>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      case 'WORKER':
        return (
          <>
            {/* Worker Information */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Worker Information</h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="font-medium">{user.fullName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Business</p>
                    <p className="font-medium">{user.business?.name || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Verified</p>
                    <p className="font-medium">{user.isVerified ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                </div>
                <p className="font-medium">0</p>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Shifts Worked</p>
                </div>
                <p className="font-medium">0</p>
              </div>
            </div>

            {/* KYC Information */}
            {user.kyc && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">KYC Information</h3>
                </div>

                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${user.kyc.status === 'VERIFIED' ? 'bg-success/10 text-success' :
                          user.kyc.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                            'bg-destructive/10 text-destructive'
                        }`}>
                        {user.kyc.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Submitted At</p>
                      <p className="font-medium">
                        {new Date(user.kyc.submittedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {user.kyc.verifiedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Verified At</p>
                        <p className="font-medium">
                          {new Date(user.kyc.verifiedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {user.kyc.rejectionReason && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Rejection Reason</p>
                        <p className="font-medium text-destructive">
                          {user.kyc.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case 'ADMIN':
        return (
          <>
            {/* Admin Information */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Admin Information</h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                    <p className="font-medium">{user.fullName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="font-medium">{user.isActive ? 'Yes' : 'No'}</p>
                  </div>

                  {user.lastLogin && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last Login</p>
                      <p className="font-medium">
                        {new Date(user.lastLogin).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Permissions */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b border-border">
                <h3 className="font-semibold">Permissions</h3>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">User Management</p>
                      <p className="text-xs text-muted-foreground">Create, edit, and delete users</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-success" />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Content Moderation</p>
                      <p className="text-xs text-muted-foreground">Review and approve content</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-success" />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Financial Management</p>
                      <p className="text-xs text-muted-foreground">View and manage transactions</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-success" />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">System Settings</p>
                      <p className="text-xs text-muted-foreground">Configure platform settings</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-success" />
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return <div>No user type specified</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {userType === 'BUSINESS' && <Building2 className="h-5 w-5 text-primary" />}
                {userType === 'CLIENT' && <User className="h-5 w-5 text-success" />}
                {userType === 'WORKER' && <BriefcaseBusiness className="h-5 w-5 text-warning" />}
                {userType === 'ADMIN' && <Settings className="h-5 w-5 text-destructive" />}
                <h2 className="text-xl font-bold">
                  {user.fullName || user.name} Details
                </h2>
              </div>
              <p className="text-muted-foreground mt-1">
                View and manage {userType.toLowerCase()} information
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
            {/* User Profile */}
            <div className="lg:col-span-1 space-y-6">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">User Profile</h3>
                </div>

                <div className="p-4">
                  <div className="text-center mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName || user.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto text-2xl font-bold">
                        {user.fullName?.charAt(0) || user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <h3 className="font-medium text-lg mt-3">
                      {user.fullName || user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">User Type</p>
                        <p className="font-medium capitalize">{userType.toLowerCase()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">
                          {userType === 'BUSINESS' ? user.address : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getUserStatus() === 'VERIFIED' || getUserStatus() === 'ACTIVE' ? 'bg-success/10 text-success' :
                            getUserStatus() === 'PENDING' || getUserStatus() === 'INACTIVE' ? 'bg-warning/10 text-warning' :
                              'bg-destructive/10 text-destructive'
                          }`}>
                          {getUserStatus()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {userType === 'BUSINESS' && user.kycStatus === 'PENDING' && (
                  <>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={handleVerifyKyc}
                      disabled={verifying}
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Verify KYC
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleRejectKyc}
                      disabled={rejecting}
                    >
                      {rejecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Reject KYC
                        </>
                      )}
                    </Button>
                  </>
                )}

                {getUserStatus() !== 'SUSPENDED' && getUserStatus() !== 'INACTIVE' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSuspendUser}
                    disabled={suspending}
                  >
                    {suspending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suspending...
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend Account
                      </>
                    )}
                  </Button>
                )}

                {(getUserStatus() === 'SUSPENDED' || getUserStatus() === 'INACTIVE') && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleActivateUser}
                    disabled={suspending}
                  >
                    {suspending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activate Account
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="lg:col-span-2 space-y-6">
              {renderUserTypeSpecificContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}