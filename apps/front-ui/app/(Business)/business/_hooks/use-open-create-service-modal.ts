import { useState, useCallback } from 'react';

export const useOpenCreateServiceModal = () => {
  const [state, setState] = useState({
    openCreateServiceModal: false,
    initialServiceData: null
  });

  const setIsOpen = useCallback((newState: any) => {
    setState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);

  return {
    isOpen: state.openCreateServiceModal,
    setIsOpen,
    initialServiceData: state.initialServiceData
  };
};