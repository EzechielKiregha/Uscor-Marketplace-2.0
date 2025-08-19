// app/business/orders/_hooks/use-open-order-details-modal.ts
import { ClientEntity, OrderProductEntity, PaymentTransactionEntity } from '@/lib/types';
import { useState, useCallback } from 'react';

export const useOpenOrderDetailsModal = () => {
  const [state, setState] = useState({
    openOrderDetailsModal: false,
    orderId: ''
  });

  const setIsOpen = useCallback((newState: any) => {
    setState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);

  return {
    isOpen: state.openOrderDetailsModal,
    setIsOpen,
    orderId: state.orderId
  };
};