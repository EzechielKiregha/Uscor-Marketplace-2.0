"use client";

import { useOpenCreateServiceModal } from "../../_hooks/use-open-create-service-modal";
import ResponsiveModal from "../responsive-modal";
import ServiceForm from "./ServiceForm";

export default function CreateServiceModal() {
  const { isOpen, setIsOpen, initialServiceData } = useOpenCreateServiceModal();

  const handleClose = () => {
    setIsOpen({
      openCreateServiceModal: false,
      initialServiceData: null
    });
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      setIsOpen={(open) => setIsOpen({
        openCreateServiceModal: open,
        initialServiceData
      })}
      title={initialServiceData ? "Edit Service" : "Create New Service"}
      description={initialServiceData ? "Update your service details" : "Add a new service to your business"}
      size="lg"
    >
      <ServiceForm
        initialData={initialServiceData}
        onSuccess={handleClose}
        onCancel={handleClose}
      />
    </ResponsiveModal>
  );
}