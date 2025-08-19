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

export const useSales = (storeId: string) => {
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null);
  const {showToast} = useToast()
  
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
      status: 'COMPLETED'
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
  const createSale = useCallback(async () => {
    try {
      const { data } = await createSaleMutation({
        variables: { 
          input: { 
            storeId,
            workerId: 'current-worker-id' // In real app, get from useMe()
          } 
        }
      });
      
      const newSaleId = data.createSale.id;
      setCurrentSaleId(newSaleId);
      showToast('success', 'New Sale', 'Sale created successfully');
      return newSaleId;
    } catch (error) {
      showToast('error', 'Error', 'Failed to create sale');
      throw error;
    }
  }, [storeId, createSaleMutation]);

  // Add product to current sale
  const addProductToSale = useCallback(async (productId: string, quantity: number = 1, modifiers?: any) => {
    if (!currentSaleId) {
      await createSale();
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
    return salesHistoryData?.sales?.items || [];
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