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
  ShoppingCart,
  User,
  Mail
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { GET_PRODUCTS, GET_PRODUCTS_BY_NAME } from '@/graphql/product.gql';
import { ProductEntity } from '@/lib/types';
import ClientSelectionModal from './ClientSelectionModal';
import NewSaleModal from './NewSaleModal';

interface CurrentSalePanelProps {
  storeId: string;
  currentSale: any; // Replace with SaleEntity type
  onNewSale: (workerId?: string, clientId?: string) => Promise<void>;
  userRole: string;
  userId: string;
}

export default function CurrentSalePanel({
  storeId,
  currentSale,
  onNewSale,
  userRole,
  userId
}: CurrentSalePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModifiers, setShowModifiers] = useState(false);
  const [modifiers, setModifiers] = useState<any>({});
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const { showToast } = useToast()

  // Get products for the store
  const {
    data: productsData,
    loading: productsLoading,
    refetch: refetchProducts
  } = useQuery(GET_PRODUCTS_BY_NAME, {
    variables: {
      storeId,
      title: searchQuery
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

  const filteredProducts = productsData?.productsByName?.filter((product: ProductEntity) =>
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
          paymentMethod,
          paymentDetails: Object.keys(paymentDetails).length > 0 ? paymentDetails : undefined
        }
      });
      showToast('success', 'Sale Completed', 'Payment processed successfully');
      onNewSale();
    } catch (error: any) {
      showToast('error', 'Error', error.message);
    } finally {
      setIsCompleting(false);
      setPaymentMethod(null);
      setPaymentDetails({});
      setShowPaymentForm(false);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setPaymentDetails({});
    if (method === 'MOBILE_MONEY' || method === 'CARD' || method === 'TOKEN' || method === 'CASH') {
      setShowPaymentForm(true);
    } else {
      setShowPaymentForm(false);
      setPaymentDetails({});
      setShowPaymentForm(false);
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
            onClick={() => setShowNewSaleModal(true)}
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
    <div className="border border-border rounded-lg bg-card h-[900px] overflow-hidden flex flex-col">
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
          onClick={() => setShowNewSaleModal(true)}
        >
          <ArrowRightLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Client Selection */}
      <div className="border-b border-border p-4">
        {selectedClient || currentSaleDetails?.client ? (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {(selectedClient || currentSaleDetails?.client)?.fullName ||
                    (selectedClient || currentSaleDetails?.client)?.username || 'Unknown Client'}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {(selectedClient || currentSaleDetails?.client)?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedClient(null);
                setShowClientModal(true);
              }}
            >
              Change
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowClientModal(true)}
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Select Client (Optional)
          </Button>
        )}
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
                  <img
                    src={product.medias && product.medias.length > 0 ? product.medias[0].url : 'image.png'}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={
                      (event) => {
                        event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`;
                      }
                    }
                  />
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
                  <img
                    src={selectedProduct.medias && selectedProduct.medias.length > 0 ? selectedProduct.medias[0].url : 'image.png'}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover rounded"
                    onError={
                      (event) => {
                        event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(selectedProduct.title)}`;
                      }
                    }
                  />
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
                onClick={() => handlePaymentMethodSelect('CASH')}
              >
                <CreditCard className="h-4 w-4" />
                Cash
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => handlePaymentMethodSelect('CARD')}
              >
                <CreditCard className="h-4 w-4" />
                Card
                {/* Payment Form */}
                {showPaymentForm && paymentMethod && (
                  <div className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Payment Details</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPaymentMethod(null);
                          setShowPaymentForm(false);
                          setPaymentDetails({});
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {paymentMethod === 'MOBILE_MONEY' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Mobile Money Provider</label>
                          <select
                            className="w-full mt-1 p-2 border border-border rounded-md"
                            value={paymentDetails.mobileMoneyMethod || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, mobileMoneyMethod: e.target.value })}
                          >
                            <option value="">Select Provider</option>
                            <option value="MTN_MONEY">MTN Money</option>
                            <option value="AIRTEL_MONEY">Airtel Money</option>
                            <option value="ORANGE_MONEY">Orange Money</option>
                            <option value="MPESA">M-Pesa</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Country</label>
                          <select
                            className="w-full mt-1 p-2 border border-border rounded-md"
                            value={paymentDetails.country || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, country: e.target.value })}
                          >
                            <option value="">Select Country</option>
                            <option value="DRC">DRC</option>
                            <option value="KENYA">Kenya</option>
                            <option value="UGANDA">Uganda</option>
                            <option value="RWANDA">Rwanda</option>
                            <option value="BURUNDI">Burundi</option>
                            <option value="TANZANIA">Tanzania</option>
                          </select>
                        </div>
                        {paymentDetails.mobileMoneyMethod && paymentDetails.country && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm font-medium mb-2">Payment Code:</p>
                            <code className="text-lg font-mono bg-background p-2 rounded border">
                              *{paymentDetails.mobileMoneyMethod?.substring(0, 3)}*{paymentDetails.country?.substring(0, 2)}*{Math.random().toString(36).substring(2, 8).toUpperCase()}#
                            </code>
                            <p className="text-xs text-muted-foreground mt-2">
                              Dial this code on your mobile phone to complete payment
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium">Transaction ID (Optional)</label>
                          <Input
                            placeholder="Enter operator transaction ID"
                            value={paymentDetails.operatorTransactionId || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, operatorTransactionId: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'CARD' && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Card Number</label>
                          <Input
                            placeholder="1234 5678 9012 3456"
                            value={paymentDetails.cardNumber || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Cardholder Name</label>
                          <Input
                            placeholder="John Doe"
                            value={paymentDetails.cardHolderName || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolderName: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium">Expiry Date</label>
                            <Input
                              placeholder="MM/YY"
                              value={paymentDetails.expiryDate || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">CVV</label>
                            <Input
                              placeholder="123"
                              value={paymentDetails.cvv || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'TOKEN' && (
                      <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Amount:</span>
                            <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium">Token Amount:</span>
                            <span className="text-lg font-bold text-primary">
                              {(calculateTotal() / 10).toFixed(2)} uTn
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            1 uTn = $10.00 USD
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => handlePaymentMethodSelect('MOBILE_MONEY')}
              >
                <CreditCard className="h-4 w-4" />
                Mobile
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => handlePaymentMethodSelect('TOKEN')}
              >
                <CreditCard className="h-4 w-4" />
                Token
                {paymentMethod === 'TOKEN' && ` (${(calculateTotal() / 10).toFixed(2)} uTn)`}
              </Button>
            </div>
          )}

          {/* Payment Form */}
          {showPaymentForm && paymentMethod && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Payment Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setPaymentMethod(null);
                    setShowPaymentForm(false);
                    setPaymentDetails({});
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {paymentMethod === 'MOBILE_MONEY' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Mobile Money Provider</label>
                    <select
                      className="w-full mt-1 p-2 border border-border rounded-md"
                      value={paymentDetails.mobileMoneyMethod || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, mobileMoneyMethod: e.target.value })}
                    >
                      <option value="">Select Provider</option>
                      <option value="MTN_MONEY">MTN Money</option>
                      <option value="AIRTEL_MONEY">Airtel Money</option>
                      <option value="ORANGE_MONEY">Orange Money</option>
                      <option value="MPESA">M-Pesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <select
                      className="w-full mt-1 p-2 border border-border rounded-md"
                      value={paymentDetails.country || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, country: e.target.value })}
                    >
                      <option value="">Select Country</option>
                      <option value="DRC">DRC</option>
                      <option value="KENYA">Kenya</option>
                      <option value="UGANDA">Uganda</option>
                      <option value="RWANDA">Rwanda</option>
                      <option value="BURUNDI">Burundi</option>
                      <option value="TANZANIA">Tanzania</option>
                    </select>
                  </div>
                  {paymentDetails.mobileMoneyMethod && paymentDetails.country && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-2">Payment Code:</p>
                      <code className="text-lg font-mono bg-background p-2 rounded border">
                        *{paymentDetails.mobileMoneyMethod?.substring(0, 3)}*{paymentDetails.country?.substring(0, 2)}*{Math.random().toString(36).substring(2, 8).toUpperCase()}#
                      </code>
                      <p className="text-xs text-muted-foreground mt-2">
                        Dial this code on your mobile phone to complete payment
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Transaction ID (Optional)</label>
                    <Input
                      placeholder="Enter operator transaction ID"
                      value={paymentDetails.operatorTransactionId || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, operatorTransactionId: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Card Number</label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cardholder Name</label>
                    <Input
                      placeholder="John Doe"
                      value={paymentDetails.cardHolderName || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolderName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Expiry Date</label>
                      <Input
                        placeholder="MM/YY"
                        value={paymentDetails.expiryDate || ''}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">CVV</label>
                      <Input
                        placeholder="123"
                        value={paymentDetails.cvv || ''}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'TOKEN' && (
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Amount:</span>
                      <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium">Token Amount:</span>
                      <span className="text-lg font-bold text-primary">
                        {(calculateTotal() / 10).toFixed(2)} uTn
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      1 uTn = $10.00 USD
                    </p>
                  </div>
                </div>
              )}
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
                  {paymentMethod === 'TOKEN' && ` (${(calculateTotal() / 10).toFixed(2)} uTn)`}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* New Sale Modal */}
      <NewSaleModal
        isOpen={showNewSaleModal}
        onClose={() => setShowNewSaleModal(!showNewSaleModal)}
        onCreateSale={onNewSale}
        storeId={storeId}
        userRole={userRole}
        userId={userId}
      />

      {/* Client Selection Modal */}
      <ClientSelectionModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientSelected={(client) => {
          setSelectedClient(client);
          setShowClientModal(false);
        }}
      />
    </div>
  );
}