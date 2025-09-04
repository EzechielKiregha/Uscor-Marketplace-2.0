import { create } from 'zustand';

interface ChatThreadModalState {
  openChatThreadModal: boolean;
  initialProductData: any;
  setIsOpen: (newState: { openChatThreadModal: boolean; initialProductData: any }) => void;
}

const useChatThreadModalStore = create<ChatThreadModalState>((set) => ({
  openChatThreadModal: false,
  initialProductData: null,
  setIsOpen: (newState) => {
    console.log('ChatThreadModal state change:', newState);
    set(newState);
  },
}));

export const useOpenChatThreadModal = () => {
  const { openChatThreadModal, initialProductData, setIsOpen } = useChatThreadModalStore();
  
  return {
    isOpen: openChatThreadModal,
    setIsOpen,
    initialProductData
  };
};