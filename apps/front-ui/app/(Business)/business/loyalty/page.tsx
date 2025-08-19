// app/business/loyalty/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_STORES } from '@/graphql/store.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { useLoyalty } from './_hooks/use-loyalty';
import {
  Star,
  Users,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Gift
} from 'lucide-react';
import LoyaltyProgramOverview from './_components/LoyaltyProgramOverview';
import ProgramConfiguration from './_components/ProgramConfiguration';
import CustomerPointsManagement from './_components/CustomerPointsManagement';
import RedemptionProcess from './_components/RedemptionProcess';
import { useOpenCreateStoreModal } from '../_hooks/use-open-create-store-modal';
import { useMe } from '@/lib/useMe';
import { StoreEntity } from '@/lib/types';

export default function LoyaltyProgramPage() {
  const { user, role, loading: authLoading } = useMe();
  const { isOpen, setIsOpen } = useOpenCreateStoreModal();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'customers' | 'redemption'>('overview');

  const {
    data: storesData,
    loading: storesLoading,
    error: storesError
  } = useQuery(GET_STORES, {
    variables: { businessId: user?.id },
    skip: !user?.id
  });

  const {
    getPrograms,
    getSelectedProgram,
    getAnalytics,
    programsLoading,
    analyticsLoading
  } = useLoyalty(user?.id || '');

  // Auto-select first store if none selected
  useEffect(() => {
    if (storesData?.stores && storesData.stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  if (authLoading || storesLoading) return <Loader loading={true} />;
  if (storesError) return <div>Error loading stores: {storesError.message}</div>;

  const programs = getPrograms();
  const selectedProgram = getSelectedProgram();
  const analytics = getAnalytics();

  return (
    <div className="space-y-6">
      {/* Store Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground">Reward customers and grow your local community</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {storesData?.stores && storesData.stores.length > 1 && (
            <select
              title='selected store ID'
              value={selectedStoreId || ''}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full sm:w-64 p-2 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {storesData.stores.map((store: StoreEntity) => (
                <option key={store.id} value={store.id}>
                  {store.name} {store.address ? `• ${store.address}` : ''}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'configuration' ? 'default' : 'outline'}
              onClick={() => setActiveTab('configuration')}
            >
              Configuration
            </Button>
            <Button
              variant={activeTab === 'customers' ? 'default' : 'outline'}
              onClick={() => setActiveTab('customers')}
            >
              Customers
            </Button>
            <Button
              variant={activeTab === 'redemption' ? 'default' : 'outline'}
              onClick={() => setActiveTab('redemption')}
            >
              Redemption
            </Button>
          </div>

          {programs.length === 0 && (
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          )}
        </div>
      </div>

      {/* Program Selection */}
      {programs.length > 0 ? (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {programs.map((program: any) => (
              <Button
                key={program.id}
                variant={selectedProgram?.id === program.id ? 'default' : 'outline'}
                className="whitespace-nowrap"
                onClick={() => setActiveTab('overview')}
              >
                {program.name}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setActiveTab('configuration')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Edit Program
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-medium mb-2">No Loyalty Program Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create a loyalty program to reward your customers and build a community around your local business.
            Perfect for artisans, craftsmen, and small retailers to encourage repeat customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-accent text-primary-foreground"
              onClick={() => setActiveTab('configuration')}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Program
            </Button>
            <Button
              variant="outline"
              size="lg"
            >
              Learn How It Works
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {programs.length > 0 && (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <LoyaltyProgramOverview
              program={selectedProgram}
              analytics={analytics}
              loading={programsLoading || analyticsLoading}
            />
          )}

          {activeTab === 'configuration' && (
            <ProgramConfiguration
              program={selectedProgram}
              loading={programsLoading}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerPointsManagement
              programId={selectedProgram?.id || ''}
              loading={programsLoading}
            />
          )}

          {activeTab === 'redemption' && (
            <RedemptionProcess
              programId={selectedProgram?.id || ''}
              loading={programsLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}