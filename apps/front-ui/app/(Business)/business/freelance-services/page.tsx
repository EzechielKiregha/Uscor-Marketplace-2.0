// app/business/freelance-services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_STORES } from '@/graphql/store.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { useFreelanceServices } from './_hooks/use-freelance-services';
import {
  BriefcaseBusiness,
  Plus,
  Search,
  Filter,
  Download,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useOpenCreateServiceModal } from '../_hooks/use-open-create-service-modal';
import { useMe } from '@/lib/useMe';
import { Input } from '@/components/ui/input';
import ServiceOverview from './_components/ServiceOverview';
import ServiceManagement from './_components/ServiceManagement';
import OrderManagement from './_components/OrderManagement';
import WorkerAssignment from './_components/WorkerAssignment';
import { FreelanceServiceEntity, StoreEntity } from '@/lib/types';

export default function FreelanceServicesPage() {
  const { user, role, loading: authLoading } = useMe();
  const { isOpen, setIsOpen } = useOpenCreateServiceModal();
  const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'orders' | 'workers'>('overview');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const {
    data: storesData,
    loading: storesLoading,
    error: storesError
  } = useQuery(GET_STORES);

  const {
    getServices,
    getSelectedService,
    setSelectedServiceId,
    getServiceOrders,
    servicesLoading,
    ordersLoading
  } = useFreelanceServices(user?.id || '');

  const services = getServices();
  const selectedService = getSelectedService();
  const serviceOrders = getServiceOrders();

  // Auto-select first store if none selected
  useEffect(() => {
    if (storesData?.stores && storesData.stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(storesData.stores[0].id);
    }
  }, [storesData, selectedStoreId]);

  if (storesError) return <div>Error loading stores: {storesError.message}</div>;

  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedService, setSelectedServiceId]);

  if (authLoading || storesLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader loading={true} />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Freelance Services</h1>
          <p className="text-muted-foreground">Manage services offered by your business</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex flex-col space-y-2">
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
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search services..."
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeTab === 'management' ? 'default' : 'outline'}
              onClick={() => setActiveTab('management')}
            >
              Services
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </Button>
            <Button
              variant={activeTab === 'workers' ? 'default' : 'outline'}
              onClick={() => setActiveTab('workers')}
            >
              Workers
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsOpen({ openCreateServiceModal: true, initialServiceData: null })}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Service
          </Button>
        </div>
      </div>

      {/* Service Selection */}
      {services.length > 0 ? (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {services.map((service: FreelanceServiceEntity) => (
              <Button
                key={service.id}
                variant={selectedService?.id === service.id ? 'default' : 'outline'}
                className="whitespace-nowrap"
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setActiveTab('management')
                }}
              >
                {service.title}
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
              onClick={() => setIsOpen({
                openCreateServiceModal: true,
                initialServiceData: selectedService
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Edit Service
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BriefcaseBusiness className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-medium mb-2">No Services Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create services to offer to your customers. Perfect for artisans, craftsmen,
            and local businesses to expand their offerings beyond physical products.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-accent text-primary-foreground"
            onClick={() => setIsOpen({ openCreateServiceModal: true, initialServiceData: null })}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Service
          </Button>
        </div>
      )}

      {/* Main Content */}
      {services.length > 0 && (
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <ServiceOverview
              services={services}
              serviceOrders={serviceOrders}
              loading={servicesLoading || ordersLoading}
            />
          )}

          {activeTab === 'management' && (
            <ServiceManagement
              service={selectedService}
              loading={servicesLoading}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManagement
              serviceId={selectedService?.id || ''}
              serviceOrders={serviceOrders}
              loading={ordersLoading}
            />
          )}

          {activeTab === 'workers' && (
            <WorkerAssignment
              serviceId={selectedService?.id || ''}
              loading={servicesLoading}
              storeId={selectedStoreId}
            />
          )}
        </div>
      )}
    </div>
  );
}