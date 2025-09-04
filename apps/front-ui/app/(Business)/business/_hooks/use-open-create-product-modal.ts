import { create } from 'zustand';

interface CreateProductModalState {
  openCreateProductModal: boolean;
  initialProductData: any;
  setIsOpen: (newState: { openCreateProductModal: boolean; initialProductData: any }) => void;
}

const useCreateProductModalStore = create<CreateProductModalState>((set) => ({
  openCreateProductModal: false,
  initialProductData: null,
  setIsOpen: (newState) => {
    console.log('CreateProductModal state change:', newState);
    set(newState);
  },
}));

export const useOpenCreateProductModal = () => {
  const { openCreateProductModal, initialProductData, setIsOpen } = useCreateProductModalStore();
  
  return {
    isOpen: openCreateProductModal,
    setIsOpen,
    initialProductData
  };
};