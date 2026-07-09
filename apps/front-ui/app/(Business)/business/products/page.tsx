"use client";

import EmptyState, { emptyStateIcons } from "@/components/EmptyState";
import MotionPage from "@/components/MotionPage";
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import {
    DELETE_PRODUCT,
    GET_PRODUCTS_BY_BUSINESS_ID,
    SEARCHED_PRODUCTS,
} from "@/graphql/product.gql";
import { ProductEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import { useMutation, useQuery } from "@apollo/client";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import CreateProductModal from "../_components/modals/CreateProductModal";
import { useOpenCreateProductModal } from "../_hooks/use-open-create-product-modal";

export default function BusinessProductsPage() {
  const { isOpen, setIsOpen } = useOpenCreateProductModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const showToast = useToast().showToast;
  const { user: bUser } = useMe();
  const [products, setProducts] = useState<ProductEntity[]>([]);

  const {
    data: productsData,
    loading,
    error,
  } = useQuery(SEARCHED_PRODUCTS, {
    variables: {
      title: searchTerm,
    },
  });

  const { data: fetchedProducts, loading: productsLoading } = useQuery(
    GET_PRODUCTS_BY_BUSINESS_ID,
  );

  useEffect(() => {
    if (productsData?.searchedProducts) {
      setProducts(productsData?.searchedProducts);
    }

    if (fetchedProducts?.fetchedBusinessProducts) {
      setProducts(fetchedProducts?.fetchedBusinessProducts);
    }
  }, [productsData, fetchedProducts]);
  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [GET_PRODUCTS_BY_BUSINESS_ID],
  });

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct({ variables: { id: productId } });
        showToast("success", "Success", "Product deleted successfully");
      } catch (error: any) {
        showToast("error", "Error", error.message);
      }
    }
  };

  const filteredProducts =
    products?.filter(
      (product: ProductEntity) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  if ((loading && searchTerm.trim() === "") || productsLoading)
    return <CardGridSkeleton variant="product" columns={4} />;
  if (error) return <div>Error loading products</div>;

  return (
    <MotionPage className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-page-title">Products</h1>
          <p className="text-page-subtitle">Manage your product catalog</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <select
            title="all categories"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 p-2 border border-border hover:border-primary hover:bg-primary/5 rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Categories</option>
  
            <option value="1">Electronics</option>
            <option value="2">Clothing</option>
            <option value="3">Home & Kitchen</option>
          </select>

          <Button
            onClick={() =>
              setIsOpen({
                openCreateProductModal: true,
                initialProductData: null,
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product: ProductEntity) => (
          <div
            key={product.id}
            className="border border-border hover:border-primary hover:bg-primary/5 rounded-lg overflow-hidden bg-card"
          >
            <div className="relative pt-[100%]">
              <img
                src={
                  product.medias && product.medias.length > 0
                    ? product.medias[0].url
                    : `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`
                }
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`;
                }}
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-foreground line-clamp-1">
                {product.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>

              <div className="mt-3 flex justify-between items-center">
                <span className="font-bold">${product.price.toFixed(2)}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    product.quantity > 10
                      ? "bg-green-100 text-green-800"
                      : product.quantity > 0
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.quantity > 0
                    ? `${product.quantity} in stock`
                    : "Out of stock"}
                </span>
              </div>

              {product.store && (
                <div className="mt-3 flex items-start">
                  <span className="mr-2 text-muted-foreground">Store:</span>
                  <span>
                    {product?.store.name}{" "}
                    {product.store.address ? `• ${product.store.address}` : ""}
                  </span>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    setIsOpen({
                      openCreateProductModal: true,
                      initialProductData: product,
                    })
                  }
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <EmptyState
          icon={emptyStateIcons.products}
          title="No products yet"
          description="Get started by creating your first product"
          action={{
            label: "Add Product",
            onClick: () =>
              setIsOpen({
                openCreateProductModal: true,
                initialProductData: null,
              }),
          }}
        />
      )}

      {/* Create Product Modal */}
      <CreateProductModal />
    </MotionPage>
  );
}
