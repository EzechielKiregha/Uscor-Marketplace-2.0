// app/business/sales/_components/CurrentSalePanel.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_SALE_BY_ID,
  ADD_SALE_PRODUCT,
  UPDATE_SALE_PRODUCT,
  REMOVE_SALE_PRODUCT,
  COMPLETE_SALE
} from '@/graphql/sales.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  X,
  Plus,
  Minus,
  CreditCard,
  ArrowRightLeft,
  Receipt,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { GET_PRODUCTS } from '@/graphql/product.gql';
import { ProductEntity } from '@/lib/types';

interface CurrentSalePanelProps {
  storeId: string;
  currentSale: any; // Replace with SaleEntity type
  onNewSale: () => void;
}

export default function CurrentSalePanel({
  storeId,
  currentSale,
  onNewSale
}: CurrentSalePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModifiers, setShowModifiers] = useState(false);
  const [modifiers, setModifiers] = useState<any>({});
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const { showToast } = useToast()

  // Get products for the store
  const {
    data: productsData,
    loading: productsLoading,
    refetch: refetchProducts
  } = useQuery(GET_PRODUCTS, {
    variables: {
      storeId,
      search: searchQuery
    },
    skip: !storeId
  });

  // Get current sale details if ID exists
  const {
    data: saleData,
    loading: saleLoading,
    refetch: refetchSale
  } = useQuery(GET_SALE_BY_ID, {
    variables: { id: currentSale?.id },
    skip: !currentSale?.id
  });

  const [addSaleProduct] = useMutation(ADD_SALE_PRODUCT);
  const [updateSaleProduct] = useMutation(UPDATE_SALE_PRODUCT);
  const [removeSaleProduct] = useMutation(REMOVE_SALE_PRODUCT);
  const [completeSale] = useMutation(COMPLETE_SALE);

  // Auto-refresh when currentSale changes
  useEffect(() => {
    if (currentSale?.id) {
      refetchSale();
    }
  }, [currentSale, refetchSale]);

  const filteredProducts = productsData?.products?.items?.filter((product: ProductEntity) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const currentSaleDetails = saleData?.sale || currentSale;

  const handleAddProduct = async (product: any) => {
    if (!currentSaleDetails?.id) {
      await onNewSale();
      // Wait for new sale to be created
      setTimeout(async () => {
        await addSaleProduct({
          variables: {
            input: {
              saleId: currentSaleDetails.id,
              productId: product.id,
              quantity,
              modifiers: Object.keys(modifiers).length > 0 ? modifiers : null
            }
          }
        });
        refetchSale();
        setSelectedProduct(null);
        setQuantity(1);
        setModifiers({});
        setShowModifiers(false);
      }, 300);
    } else {
      await addSaleProduct({
        variables: {
          input: {
            saleId: currentSaleDetails.id,
            productId: product.id,
            quantity,
            modifiers: Object.keys(modifiers).length > 0 ? modifiers : null
          }
        }
      });
      refetchSale();
      setSelectedProduct(null);
      setQuantity(1);
      setModifiers({});
      setShowModifiers(false);
    }
  };

  const handleUpdateQuantity = async (saleProductId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    await updateSaleProduct({
      variables: {
        id: saleProductId,
        input: {
          quantity: newQuantity
        }
      }
    });
    refetchSale();
  };

  const handleRemoveProduct = async (saleProductId: string) => {
    await removeSaleProduct({
      variables: { id: saleProductId }
    });
    refetchSale();
  };

  const handleCompleteSale = async () => {
    if (!paymentMethod || !currentSaleDetails?.id) return;

    setIsCompleting(true);
    try {
      await completeSale({
        variables: {
          id: currentSaleDetails.id,
          paymentMethod
        }
      });
      showToast('success', 'Sale Completed', 'Payment processed successfully');
      onNewSale();
    } catch (error) {
      showToast('error', 'Error', 'Failed to complete sale');
    } finally {
      setIsCompleting(false);
      setPaymentMethod(null);
    }
  };

  const calculateTotal = useCallback(() => {
    if (!currentSaleDetails?.saleProducts) return 0;

    return currentSaleDetails.saleProducts.reduce(
      (total: number, item: any) => total + (item.price * item.quantity),
      0
    ) - (currentSaleDetails.discount || 0);
  }, [currentSaleDetails]);

  if (!currentSale && !currentSaleDetails) {
    return (
      <div className="border border-border rounded-lg bg-card h-[600px] flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-muted/50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Active Sale</h2>
          <p className="text-muted-foreground mb-6">
            Start a new sale to begin processing transactions
          </p>
          <Button
            size="lg"
            onClick={onNewSale}
            className="bg-primary hover:bg-accent text-primary-foreground"
          >
            <Plus className="h-5 w-5 mr-2" />
            Start New Sale
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden h-[600px] flex flex-col">
      {/* Sale Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Current Sale</h2>
          <p className="text-sm text-muted-foreground">
            {currentSaleDetails?.id ? `ID: ${currentSaleDetails.id.substring(0, 8)}...` : 'New Sale'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewSale}
        >
          <ArrowRightLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Product Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products by name or scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {productsLoading ? (
          <div className="flex justify-center py-8">
            <Loader loading={true} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No products found' : 'Start searching to add products to your sale'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.map((product: ProductEntity) => (
              <div
                key={product.id}
                className="border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative pt-[100%]">
                  {product.medias && product.medias.length > 0 && product.medias[0].url ? (
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
                <div className="p-3">
                  <h3 className="font-medium text-foreground line-clamp-1">{product.title}</h3>
                  <p className="text-sm text-primary font-bold">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Selection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex -mx-4 -mt-4 -mb-4 bg-muted border-b border-border p-4 mb-4">
                <div className="w-24 h-24 flex-shrink-0 mr-4">
                  {selectedProduct.medias && selectedProduct.medias.length > 0 && selectedProduct.medias[0].url ? (
                    <img
                      src={selectedProduct.medias[0].url}
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{selectedProduct.title}</h3>
                  <p className="text-2xl font-bold text-primary mt-1">${selectedProduct.price.toFixed(2)}</p>
                  {selectedProduct.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{selectedProduct.description}</p>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between mb-6">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-9 w-16 text-center border-0 focus:ring-0 p-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-l-none"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
                  onClick={() => handleAddProduct(selectedProduct)}
                >
                  Add to Sale
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Summary */}
      <div className="border-t border-border p-4">
        <div className="space-y-3">
          {/* Sale Items */}
          <div className="max-h-40 overflow-y-auto">
            {currentSaleDetails?.saleProducts && currentSaleDetails.saleProducts.length > 0 ? (
              <div className="space-y-2">
                {currentSaleDetails.saleProducts.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveProduct(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No items in sale</p>
            )}
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          {!paymentMethod && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => setPaymentMethod('CASH')}
              >
                <CreditCard className="h-4 w-4" />
                Cash
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => setPaymentMethod('CARD')}
              >
                <CreditCard className="h-4 w-4" />
                Card
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => setPaymentMethod('MOBILE_MONEY')}
              >
                <CreditCard className="h-4 w-4" />
                Mobile
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => setPaymentMethod('TOKEN')}
              >
                <CreditCard className="h-4 w-4" />
                Token
              </Button>
            </div>
          )}

          {/* Complete Sale Button */}
          {paymentMethod && (
            <Button
              className="w-full bg-primary hover:bg-accent text-primary-foreground h-12 text-lg"
              disabled={isCompleting || currentSaleDetails?.saleProducts?.length === 0}
              onClick={handleCompleteSale}
            >
              {isCompleting ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  Complete Sale • ${calculateTotal().toFixed(2)}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}