"use client";
import { useOpenCreateProductModal } from "../../_hooks/use-open-create-product-modal";
import ResponsiveModal from "../responsive-modal";
import ProductForm from "./ProductForm";


export default function CreateProductModal() {
  const { isOpen, setIsOpen, initialProductData } = useOpenCreateProductModal();

  const handleClose = () => {
    setIsOpen({
      openCreateProductModal: false,
      initialProductData: null
    });
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      setIsOpen={(open) => setIsOpen({
        openCreateProductModal: open,
        initialProductData
      })}
      title={initialProductData ? "Edit Product" : "Create New Product"}
      description={initialProductData ? "Update your product details" : "Add a new product to your store"}
      size="lg"
    >
      <ProductForm
        initialData={initialProductData}
        onSuccess={handleClose}
        onCancel={handleClose}
      />
    </ResponsiveModal>
  );
}