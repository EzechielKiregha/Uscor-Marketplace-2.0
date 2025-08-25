'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS, DELETE_PRODUCT } from '@/graphql/product.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Plus, Search, Filter, Package } from 'lucide-react';
import { useOpenCreateProductModal } from '../_hooks/use-open-create-product-modal';
import { useState } from 'react';
import { ProductEntity } from '@/lib/types';
import { useToast } from '@/components/toast-provider';
import { useMe } from '@/lib/useMe';

export default function BusinessProductsPage() {
  const { isOpen, setIsOpen } = useOpenCreateProductModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const showToast = useToast().showToast
  const bUser = useMe()

  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS);
  // 1

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [GET_PRODUCTS]
  });

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct({ variables: { id: productId } });
        showToast(
          'success',
          'Success',
          'Product deleted successfully',
        );
      } catch (error: any) {
        showToast('error', 'Error', error.message);
      }
    }
  };

  if (loading) return <Loader loading={true} />;
  if (error) return <div>Error loading products</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <select
            title='all categories'
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-48 p-2 border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Categories</option>
            {/* In real app, fetch categories */}
            <option value="1">Electronics</option>
            <option value="2">Clothing</option>
            <option value="3">Home & Kitchen</option>
          </select>

          <Button onClick={() => setIsOpen({ openCreateProductModal: true, initialProductData: null })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.products.items.map((product: ProductEntity) => (
          <div key={product.id} className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="relative pt-[100%]">
              {product.medias?.[0] ? (
                <img
                  src={product.medias[0].url}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-foreground line-clamp-1">{product.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>

              <div className="mt-3 flex justify-between items-center">
                <span className="font-bold">${product.price.toFixed(2)}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${product.quantity > 10
                  ? 'bg-green-100 text-green-800'
                  : product.quantity > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsOpen({
                    openCreateProductModal: true,
                    initialProductData: product
                  })}
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
      {data.products.items.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-6">Get started by creating your first product</p>
          <Button onClick={() => setIsOpen({ openCreateProductModal: true, initialProductData: null })}>
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </div>
      )}
    </div>
  );
}