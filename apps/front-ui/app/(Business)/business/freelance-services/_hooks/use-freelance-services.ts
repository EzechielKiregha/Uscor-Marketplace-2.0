// app/business/freelance-services/_hooks/use-freelance-services.ts
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_FREELANCE_SERVICES,
  GET_FREELANCE_ORDERS,
  CREATE_FREELANCE_SERVICE,
  UPDATE_FREELANCE_SERVICE,
  ASSIGN_WORKER_TO_SERVICE,
  COMPLETE_FREELANCE_ORDER,
  ON_FREELANCE_SERVICE_CREATED,
  ON_FREELANCE_SERVICE_UPDATED,
  ON_FREELANCE_ORDER_UPDATED
} from '@/graphql/freelance.gql';
import { useToast } from '@/components/toast-provider';
import { FreelanceServiceEntity } from '@/lib/types';

export const useFreelanceServices = (businessId: string) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const {showToast} = useToast();
  const [filters, setFilters] = useState({
    category: '',
    minRate: 0,
    maxRate: 0,
    isHourly: false,
    search: ''
  });
  
  const { 
    data: servicesData,
    loading: servicesLoading,
    refetch: refetchServices
  } = useQuery(GET_FREELANCE_SERVICES, {
    variables: { 
      businessId,
      category: filters.category || undefined,
      minRate: filters.minRate || undefined,
      maxRate: filters.maxRate || undefined,
      isHourly: filters.isHourly || undefined,
      search: filters.search || undefined
    },
    skip: !businessId
  });

  const { 
    data: ordersData,
    loading: ordersLoading,
    refetch: refetchOrders
  } = useQuery(GET_FREELANCE_ORDERS, {
    variables: { 
      businessId,
      serviceId: selectedServiceId || undefined
    },
    skip: !businessId
  });

  const [createServiceMutation] = useMutation(CREATE_FREELANCE_SERVICE);
  const [updateServiceMutation] = useMutation(UPDATE_FREELANCE_SERVICE);
  const [assignWorkerMutation] = useMutation(ASSIGN_WORKER_TO_SERVICE);
  const [completeOrderMutation] = useMutation(COMPLETE_FREELANCE_ORDER);

  // Handle real-time updates
  useSubscription(ON_FREELANCE_SERVICE_CREATED, {
    variables: { businessId },
    onData: ({ data }) => {
      refetchServices();
    }
  });

  useSubscription(ON_FREELANCE_SERVICE_UPDATED, {
    variables: { businessId },
    onData: ({ data }) => {
      refetchServices();
    }
  });

  useSubscription(ON_FREELANCE_ORDER_UPDATED, {
    variables: { businessId },
    onData: ({ data }) => {
      refetchOrders();
      refetchServices();
    }
  });

  // Create a new service
  const createService = useCallback(async (input: any) => {
    try {
      const { data } = await createServiceMutation({
        variables: { input }
      });
      showToast('success', 'Success', 'Service created successfully');
      return data.createFreelanceService;
    } catch (error) {
      showToast('error', 'Error', 'Failed to create service');
      throw error;
    }
  }, [createServiceMutation]);

  // Update service
  const updateService = useCallback(async (id: string, input: any) => {
    try {
      const { data } = await updateServiceMutation({
        variables: { id, input }
      });
      showToast('success', 'Success', 'Service updated successfully');
      return data.updateFreelanceService;
    } catch (error) {
      showToast('error', 'Error', 'Failed to update service');
      throw error;
    }
  }, [updateServiceMutation]);

  // Assign worker to service
  const assignWorker = useCallback(async (input: any) => {
    try {
      const { data } = await assignWorkerMutation({
        variables: { input }
      });
      showToast('success', 'Success', 'Worker assigned successfully');
      return data.assignWorkerToService;
    } catch (error) {
      showToast('error', 'Error', 'Failed to assign worker');
      throw error;
    }
  }, [assignWorkerMutation]);

  // Complete order
  const completeOrder = useCallback(async (id: string) => {
    try {
      const { data } = await completeOrderMutation({
        variables: { id }
      });
      showToast('success', 'Success', 'Order completed successfully');
      return data.completeFreelanceOrder;
    } catch (error) {
      showToast('error', 'Error', 'Failed to complete order');
      throw error;
    }
  }, [completeOrderMutation]);

  // Get freelance services
  const getServices = useCallback(() => {
    return servicesData?.freelanceServices?.items || [];
  }, [servicesData]);


  // Get selected service
  const getSelectedService = useCallback(() => {
    if (!selectedServiceId || !servicesData?.freelanceServices?.items) return null;
    return servicesData.freelanceServices.items.find((s : FreelanceServiceEntity) => s.id === selectedServiceId);
  }, [selectedServiceId, servicesData]);

  console.log('Selected Service ID:', selectedServiceId);

  // Get service orders
  const getServiceOrders = useCallback(() => {
    return ordersData?.freelanceOrders?.items || [];
  }, [ordersData]);

  // Update filters
  const updateFilters = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    selectedServiceId,
    setSelectedServiceId,
    filters,
    updateFilters,
    getServices,
    getSelectedService,
    getServiceOrders,
    createService,
    updateService,
    assignWorker,
    completeOrder,
    servicesLoading,
    ordersLoading
  };
};