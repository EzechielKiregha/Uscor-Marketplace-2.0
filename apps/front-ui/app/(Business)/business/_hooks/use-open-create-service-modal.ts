import { create } from 'zustand';

interface CreateServiceModalState {
  openCreateServiceModal: boolean;
  initialServiceData: any;
  setIsOpen: (newState: { openCreateServiceModal: boolean; initialServiceData: any }) => void;
}

const useCreateServiceModalStore = create<CreateServiceModalState>((set) => ({
  openCreateServiceModal: false,
  initialServiceData: null,
  setIsOpen: (newState) => {
    console.log('CreateServiceModal state change:', newState);
    set(newState);
  },
}));

export const useOpenCreateServiceModal = () => {
  const { openCreateServiceModal, initialServiceData, setIsOpen } = useCreateServiceModalStore();
  
  return {
    isOpen: openCreateServiceModal,
    setIsOpen,
    initialServiceData
  };
};