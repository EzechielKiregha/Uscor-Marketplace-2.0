import { useCallback, useState } from 'react';

export const useOpenAddWorkerModal = () => {
  const [state, setState] = useState({
    openAddWorkerModal: false,
    initialWorkerData: null
  });

  const setIsOpen = useCallback((newState: any) => {
    setState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);

  return {
    isOpen: state.openAddWorkerModal,
    setIsOpen,
    initialWorkerData: state.initialWorkerData
  };
};