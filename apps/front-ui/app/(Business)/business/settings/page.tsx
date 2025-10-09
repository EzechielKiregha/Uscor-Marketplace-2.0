// app/business/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_STORES } from '@/graphql/store.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { useSettings } from './_hooks/use-settings';
import {
  Settings,
  User,
  FileText,
  CreditCard,
  Printer,
  Globe,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import ProfileSettings from './_components/ProfileSettings';
import PaymentConfiguration from './_components/PaymentConfiguration';
import HardwareSetup from './_components/HardwareSetup';
import KycVerification from './_components/KycVerification';
import PricingPlans from './_components/PricingPlans';
import Preferences from './_components/Preferences';
import { useMe } from '@/lib/useMe';

export default function SettingsPage() {
  const { user, role, loading: authLoading } = useMe();
  const {
    activeSection,
    setActiveSection,
    getBusinessSettings,
    businessLoading
  } = useSettings(user?.id || '');

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError
  } = useQuery(GET_STORES, {
    variables: { businessId: user?.id },
    skip: !user?.id
  });

  const business = getBusinessSettings();

  if (authLoading || storesLoading || businessLoading) return <Loader loading={true} />;
  if (storesError) return <div>Error loading settings: {storesError.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your business profile, payment configuration, and preferences
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          <Button
            variant={activeSection === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveSection('profile')}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button
            variant={activeSection === 'payment' ? 'default' : 'outline'}
            onClick={() => setActiveSection('payment')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Payment
          </Button>
          <Button
            variant={activeSection === 'hardware' ? 'default' : 'outline'}
            onClick={() => setActiveSection('hardware')}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Hardware
          </Button>
          <Button
            variant={activeSection === 'kyc' ? 'default' : 'outline'}
            onClick={() => setActiveSection('kyc')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            KYC Verification
          </Button>
          <Button
            variant={activeSection === 'pricing' ? 'default' : 'outline'}
            onClick={() => setActiveSection('pricing')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Pricing
          </Button>
          <Button
            variant={activeSection === 'preferences' ? 'default' : 'outline'}
            onClick={() => setActiveSection('preferences')}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Preferences
          </Button>
        </div>
      </div>

      {/* KYC Status Banner */}
      {business && business.kycStatus !== 'VERIFIED' && (
        <div className={`p-4 rounded-lg ${business.kycStatus === 'PENDING'
            ? 'bg-warning/10 text-warning'
            : business.kycStatus === 'REJECTED'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted'
          }`}>
          <div className="flex items-start gap-3">
            {business.kycStatus === 'PENDING' && (
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            {business.kycStatus === 'REJECTED' && (
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            {business.kycStatus === 'PENDING' && (
              <div>
                <h3 className="font-semibold">KYC Verification Pending</h3>
                <p className="mt-1">
                  Your KYC documents are being reviewed. Once verified, you'll be able to
                  purchase products and services from other businesses in the marketplace.
                </p>
              </div>
            )}
            {business.kycStatus === 'REJECTED' && (
              <div>
                <h3 className="font-semibold">KYC Verification Rejected</h3>
                <p className="mt-1">
                  Your KYC submission was rejected. Please review the rejection reason and
                  resubmit your documents for verification.
                </p>
              </div>
            )}
            {business.kycStatus === 'PENDING' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setActiveSection('kyc')}
              >
                View Status
              </Button>
            )}
            {business.kycStatus === 'REJECTED' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setActiveSection('kyc')}
              >
                Resubmit Documents
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div>
        {activeSection === 'profile' && <ProfileSettings />}
        {activeSection === 'payment' && <PaymentConfiguration />}
        {activeSection === 'hardware' && <HardwareSetup />}
        {activeSection === 'kyc' && <KycVerification />}
        {activeSection === 'pricing' && <PricingPlans />}
        {activeSection === 'preferences' && <Preferences />}
      </div>
    </div>
  );
}