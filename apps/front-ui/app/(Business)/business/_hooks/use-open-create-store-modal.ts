"use client"

import { create } from 'zustand';

interface CreateStoreModalState {
  openCreateStoreModal: boolean;
  initialStoreData: any;
  setIsOpen: (newState: { openCreateStoreModal: boolean; initialStoreData: any }) => void;
}

const useCreateStoreModalStore = create<CreateStoreModalState>((set) => ({
  openCreateStoreModal: false,
  initialStoreData: null,
  setIsOpen: (newState) => {
    console.log('CreateStoreModal state change:', newState);
    set(newState);
  },
}));

export const useOpenCreateStoreModal = () => {
  const { openCreateStoreModal, initialStoreData, setIsOpen } = useCreateStoreModalStore();
  
  return {
    isOpen: openCreateStoreModal,
    setIsOpen,
    initialStoreData
  };
};