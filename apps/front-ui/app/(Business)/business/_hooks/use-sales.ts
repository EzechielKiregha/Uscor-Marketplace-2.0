// app/business/sales/_hooks/use-sales.ts
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_ACTIVE_SALES, 
  GET_SALES_HISTORY,
  CREATE_SALE,
  ADD_SALE_PRODUCT,
  COMPLETE_SALE,
  ON_SALE_CREATED,
  ON_SALE_UPDATED
} from '@/graphql/sales.gql';
import { useToast } from '@/components/toast-provider';
import { useRouter } from 'next/navigation';

export const useSales = (storeId: string, wUserId: string, role?: string) => {
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
  const {showToast} = useToast()
  const router = useRouter();
  
  const { 
    data: activeSalesData, 
    loading: activeSalesLoading,
    refetch: refetchActiveSales
  } = useQuery(GET_ACTIVE_SALES, {
    variables: { storeId },
    skip: !storeId
  });

  const { 
    data: salesHistoryData, 
    loading: salesHistoryLoading,
    refetch: refetchSalesHistory
  } = useQuery(GET_SALES_HISTORY, {
    variables: { 
      storeId,
      status: 'CLOSED'
    },
    skip: !storeId
  });

  const [createSaleMutation] = useMutation(CREATE_SALE);
  const [addSaleProductMutation] = useMutation(ADD_SALE_PRODUCT);
  const [completeSaleMutation] = useMutation(COMPLETE_SALE);

  // Handle real-time updates
  useSubscription(ON_SALE_CREATED, {
    variables: { storeId },
    onData: ({ data }) => {
      refetchActiveSales();
      refetchSalesHistory();
    }
  });

  useSubscription(ON_SALE_UPDATED, {
    variables: { storeId },
    onData: ({ data }) => {
      refetchActiveSales();
      refetchSalesHistory();
    }
  });

  // Create a new sale
  const createSale = useCallback(async (workerId?: string, clientId?: string) => {
    try {
      const { data } = await createSaleMutation({
        variables: { 
          input: { 
            storeId,
            workerId: workerId, // Use provided workerId (can be undefined for business sales)
            clientId: clientId || undefined, // Optional client
            totalAmount: 0,
            discount: 0,
            paymentMethod: 'CASH',
            saleProducts: []
          }
        }
      });
      
      const newSaleId = data.createSale.id;
      setCurrentSaleId(newSaleId);
      showToast('success', 'New Sale', 'Sale created successfully');
      router.refresh(); // Refresh to update any dependent data
      return newSaleId;
    } catch (error: any) {
      console.error('Create sale error:', error);
      showToast('error', 'Error', error.message || 'Failed to create sale');
      throw error;
    }
  }, [storeId, createSaleMutation]);

  // Add product to current sale
  const addProductToSale = useCallback(async (productId: string, quantity: number = 1, modifiers?: any) => {
    if (!currentSaleId) {
      // For auto-creating sales when adding products, use current user as worker if they're a worker
      const workerId = role === 'worker' ? wUserId : undefined;
      await createSale(workerId);
    }
    
    try {
      await addSaleProductMutation({
        variables: { 
          input: { 
            saleId: currentSaleId || '',
            productId,
            quantity,
            modifiers
          } 
        }
      });
      showToast('success', 'Product Added', 'Item added to sale');
      return true;
    } catch (error) {
      showToast('error', 'Error', 'Failed to add product to sale');
      return false;
    }
  }, [currentSaleId, createSale, addSaleProductMutation]);

  // Complete the current sale
  const completeSale = useCallback(async (paymentMethod: string) => {
    if (!currentSaleId) return false;
    
    try {
      await completeSaleMutation({
        variables: { 
          id: currentSaleId,
          paymentMethod
        }
      });
      setCurrentSaleId(null);
      showToast('success', 'Sale Completed', 'Payment processed successfully');
      return true;
    } catch (error) {
      showToast('error', 'Error', 'Failed to complete sale');
      return false;
    }
  }, [currentSaleId, completeSaleMutation]);

  // Get current active sale
  const getCurrentSale = useCallback(() => {
    if (!activeSalesData?.activeSales?.length) return null;
    return activeSalesData.activeSales[0]; // Assuming only one active sale per worker
  }, [activeSalesData]);

  // Get sales history
  const getSalesHistory = useCallback(() => {
    return salesHistoryData?.salesHistory?.items || [];
  }, [salesHistoryData]);

  return {
    currentSaleId,
    setCurrentSaleId,
    getCurrentSale,
    getSalesHistory,
    createSale,
    addProductToSale,
    completeSale,
    activeSalesLoading,
    salesHistoryLoading
  };
};