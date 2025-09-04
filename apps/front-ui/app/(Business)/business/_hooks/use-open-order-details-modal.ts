import { create } from 'zustand';

interface OrderDetailsModalState {
  openOrderDetailsModal: boolean;
  orderId: string | null;
  setIsOpen: (newState: { openOrderDetailsModal: boolean; orderId: string | null }) => void;
}

const useOrderDetailsModalStore = create<OrderDetailsModalState>((set) => ({
  openOrderDetailsModal: false,
  orderId: null,
  setIsOpen: (newState) => {
    console.log('OrderDetailsModal state change:', newState);
    set(newState);
  },
}));

export const useOpenOrderDetailsModal = () => {
  const { openOrderDetailsModal, orderId, setIsOpen } = useOrderDetailsModalStore();
  
  return {
    isOpen: openOrderDetailsModal,
    setIsOpen,
    orderId
  };
};