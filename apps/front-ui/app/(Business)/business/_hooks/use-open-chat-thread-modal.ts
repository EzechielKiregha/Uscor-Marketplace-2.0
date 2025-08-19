import { useState, useCallback } from 'react';

export const useOpenChatThreadModal = () => {
  const [state, setState] = useState({
    openChatThreadModal: false,
    initialProductData: null
  });

  const setIsOpen = useCallback((newState: any) => {
    setState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);

  return {
    isOpen: state.openChatThreadModal,
    setIsOpen,
    initialProductData: state.initialProductData
  };
};