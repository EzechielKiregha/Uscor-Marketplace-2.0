// app/business/_hooks/use-open-create-product-modal.ts
import { useState, useCallback } from 'react';

export const useOpenCreateProductModal = () => {
  const [state, setState] = useState({
    openCreateProductModal: false,
    initialProductData: null
  });

  const setIsOpen = useCallback((newState: any) => {
    setState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);

  return {
    isOpen: state.openCreateProductModal,
    setIsOpen,
    initialProductData: state.initialProductData
  };
};