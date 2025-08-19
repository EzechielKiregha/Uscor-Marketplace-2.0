import { useState, useCallback } from 'react';

export const useOpenCreateStoreModal = () => {
  const [state, setState] = useState({
    openCreateStoreModal: false,
    initialStoreData: null
  });

  const setIsOpen = useCallback((newState: any) => {
    setState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);

  return {
    isOpen: state.openCreateStoreModal,
    setIsOpen,
    initialStoreData: state.initialStoreData
  };
};