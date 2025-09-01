import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_INVENTORY,
  GET_PURCHASE_ORDERS,
  GET_TRANSFER_ORDERS,
  CREATE_PURCHASE_ORDER,
  CREATE_TRANSFER_ORDER,
  CREATE_INVENTORY_ADJUSTMENT,
  ON_PURCHASE_ORDER_CREATED,
  ON_PURCHASE_ORDER_UPDATED,
  ON_TRANSFER_ORDER_CREATED,
  ON_TRANSFER_ORDER_UPDATED
} from '@/graphql/inventory.gql';
import { useToast } from '@/components/toast-provider';

export const useInventory = (storeId: string, businessId: string) => {
  const [inventoryFilter, setInventoryFilter] = useState({
    lowStockOnly: false,
    productId: ''
  });
  
  const [purchaseOrderFilter, setPurchaseOrderFilter] = useState({
    status: '',
    startDate: null,
    endDate: null
  });
  
  const [transferOrderFilter, setTransferOrderFilter] = useState({
    status: '',
    startDate: null,
    endDate: null
  });

  // Get inventory data
  const { 
    data: inventoryData,
    loading: inventoryLoading,
    refetch: refetchInventory
  } = useQuery(GET_INVENTORY, {
    variables: {
      storeId,
      lowStockOnly: inventoryFilter.lowStockOnly,
      productId: inventoryFilter.productId || undefined
    },
    skip: !storeId
  });

  // Get purchase orders
  const { 
    data: purchaseOrdersData,
    loading: purchaseOrdersLoading,
    refetch: refetchPurchaseOrders
  } = useQuery(GET_PURCHASE_ORDERS, {
    variables: { 
      businessId,
      storeId,
      status: purchaseOrderFilter.status || undefined,
      startDate: purchaseOrderFilter.startDate,
      endDate: purchaseOrderFilter.endDate
    },
    skip: !businessId || !storeId
  });

  // Get transfer orders
  const { 
    data: transferOrdersData,
    loading: transferOrdersLoading,
    refetch: refetchTransferOrders
  } = useQuery(GET_TRANSFER_ORDERS, {
    variables: { 
      fromStoreId: storeId,
      toStoreId: storeId,
      status: transferOrderFilter.status || undefined,
      startDate: transferOrderFilter.startDate,
      endDate: transferOrderFilter.endDate
    },
    skip: !storeId
  });

  const [createPurchaseOrderMutation] = useMutation(CREATE_PURCHASE_ORDER);
  const [createTransferOrderMutation] = useMutation(CREATE_TRANSFER_ORDER);
  const [createInventoryAdjustmentMutation] = useMutation(CREATE_INVENTORY_ADJUSTMENT);
  const { showToast } = useToast()
  // Handle real-time updates
  useSubscription(ON_PURCHASE_ORDER_CREATED, {
    variables: { businessId, storeId },
    onData: ({ data }) => {
      refetchPurchaseOrders();
      refetchInventory();
    }
  });

  useSubscription(ON_PURCHASE_ORDER_UPDATED, {
    variables: { businessId, storeId },
    onData: ({ data }) => {
      refetchPurchaseOrders();
      refetchInventory();
    }
  });

  useSubscription(ON_TRANSFER_ORDER_CREATED, {
    variables: { fromStoreId: storeId },
    onData: ({ data }) => {
      refetchTransferOrders();
      refetchInventory();
    }
  });

  useSubscription(ON_TRANSFER_ORDER_UPDATED, {
    variables: { fromStoreId: storeId },
    onData: ({ data }) => {
      refetchTransferOrders();
      refetchInventory();
    }
  });

  // Create purchase order
  const createPurchaseOrder = useCallback(async (input: any) => {
    try {
      const { data } = await createPurchaseOrderMutation({
        variables: { input }
      });
      showToast('success', 'Success', 'Purchase order created');
      return data.createPurchaseOrder;
    } catch (error) {
      showToast('error', 'Error', 'Failed to create purchase order');
      throw error;
    }
  }, [createPurchaseOrderMutation]);

  // Create transfer order
  const createTransferOrder = useCallback(async (input: any) => {
    try {
      const { data } = await createTransferOrderMutation({
        variables: { input }
      });
      showToast('success', 'Success', 'Transfer order created');
      return data.createTransferOrder;
    } catch (error) {
      showToast('error', 'Error', 'Failed to create transfer order');
      throw error;
    }
  }, [createTransferOrderMutation]);

  // Create inventory adjustment
  const createInventoryAdjustment = useCallback(async (input: any) => {
    try {
      const { data } = await createInventoryAdjustmentMutation({
        variables: { input }
      });
      showToast('success', 'Success', 'Inventory adjusted');
      refetchInventory();
      return data.createInventoryAdjustment;
    } catch (error) {
      showToast('error', 'Error', 'Failed to adjust inventory');
      throw error;
    }
  }, [createInventoryAdjustmentMutation, refetchInventory]);

  // Get inventory items
  const getInventory = useCallback(() => {
    return inventoryData?.inventory?.items || [];
  }, [inventoryData]);

  // Get purchase orders
  const getPurchaseOrders = useCallback(() => {
    return purchaseOrdersData?.purchaseOrders?.items || [];
  }, [purchaseOrdersData]);

  // Get transfer orders
  const getTransferOrders = useCallback(() => {
    return transferOrdersData?.transferOrders?.items || [];
  }, [transferOrdersData]);

  return {
    getInventory,
    getPurchaseOrders,
    getTransferOrders,
    createPurchaseOrder,
    createTransferOrder,
    createInventoryAdjustment,
    inventoryLoading,
    purchaseOrdersLoading,
    transferOrdersLoading,
    setInventoryFilter,
    setPurchaseOrderFilter,
    setTransferOrderFilter
  };
};