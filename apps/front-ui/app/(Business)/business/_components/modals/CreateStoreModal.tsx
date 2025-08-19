"use client";

import { useOpenCreateStoreModal } from "../../_hooks/use-open-create-store-modal";
import ResponsiveModal from "../responsive-modal";
import StoreForm from "./StoreForm";


export default function CreateStoreModal() {
  const { isOpen, setIsOpen, initialStoreData } = useOpenCreateStoreModal();

  const handleClose = () => {
    setIsOpen({
      openCreateStoreModal: false,
      initialStoreData: null
    });
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      setIsOpen={(open) => setIsOpen({
        openCreateStoreModal: open,
        initialStoreData
      })}
      title={initialStoreData ? "Edit Store" : "Create New Store"}
      description={initialStoreData ? "Update your store details" : "Add a new store location"}
      size="md"
    >
      <StoreForm
        initialData={initialStoreData}
        onSuccess={handleClose}
        onCancel={handleClose}
      />
    </ResponsiveModal>
  );
}