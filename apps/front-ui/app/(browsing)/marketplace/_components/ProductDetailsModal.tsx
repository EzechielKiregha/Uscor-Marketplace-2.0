'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Star,
  Gift,
  ShoppingCart,
  MessageSquare,
  MapPin,
  Loader2,
  X,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Minus
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { useCart } from '@/hooks/use-cart';

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
  onChat: () => void;
  onAddToCart: () => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onChat,
  onAddToCart
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const { showToast } = useToast();

  const { addItem } = useCart()
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSuccess(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [isSuccess])
  // Check if product has an active promotion
  const hasPromotion = product.promotions && product.promotions.length > 0;
  const promotion = hasPromotion ? product.promotions[0] : null;

  // Calculate discounted price if promotion exists
  const getDiscountedPrice = () => {
    if (!promotion) return product.price;
    return product.price * (1 - promotion.discountPercentage / 100);
  };

  // Get business type icon
  const getBusinessTypeIcon = () => {
    switch (product.business.businessType) {
      case 'ARTISAN':
        return '🎨';
      case 'BOOKSTORE':
        return '📚';
      case 'ELECTRONICS':
        return '🔌';
      case 'HARDWARE':
        return '🔨';
      case 'GROCERY':
        return '🛒';
      case 'CAFE':
        return '☕';
      case 'RESTAURANT':
        return '🍽️';
      case 'RETAIL':
        return '🏬';
      case 'BAR':
        return '🍷';
      case 'CLOTHING':
        return '👕';
      default:
        return '🏢';
    }
  };

  const handleIncrement = () => {
    setQuantity(q => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCartWithQuantity = () => {
    // In a real app, this would add the product with quantity to the cart
    addItem(product)
    setIsSuccess(true)
    showToast('success', 'Added to Cart', `${quantity}x ${product.title} has been added to your cart`);
    onClose();
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariant(variantId);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">{product.title}</h2>
              <p className="text-muted-foreground mt-1">
                {product.business.name} • {product.store?.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative">
                {product.medias && product.medias.length > 0 ? (
                  <img
                    src={product.medias[0].url}
                    alt={product.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Promotion Badge */}
                {hasPromotion && (
                  <div className="absolute top-4 right-4 bg-warning/20 text-warning px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    {promotion.discountPercentage}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.medias && product.medias.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.medias.slice(1).map((media: any, index: number) => (
                    <div
                      key={index}
                      className="w-20 h-20 border-2 border-transparent rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    >
                      <img
                        src={media.url}
                        alt={`${product.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Business Info */}
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                    {getBusinessTypeIcon()}
                  </div>
                  <div>
                    <h3 className="font-medium">{product.business.name}</h3>
                    {product.business.kycStatus === 'VERIFIED' && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1 mt-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Business
                      </span>
                    )}
                  </div>
                </div>

                {product.business.address && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{product.business.address}</span>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onChat}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat About Product
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => window.location.href = `/b-view/${product.business.id}`}
                  >
                    View Business
                  </Button>
                </div>
              </div>

              {/* Product Price */}
              <div>
                {hasPromotion ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold">${getDiscountedPrice().toFixed(2)}</p>
                      <p className="text-lg text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-warning/10 text-warning px-3 py-2 rounded-lg inline-flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{promotion.discountPercentage}% discount - Offer ends {new Date(promotion.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
                )}
              </div>

              {/* Product Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">About this product</h3>
                  <p className="text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Variants Selection */}
              {product.variants && (
                <div>
                  <h3 className="font-semibold mb-2">Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(product.variants).map(variant => (
                      <Button
                        key={variant}
                        variant={selectedVariant === variant ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectVariant(variant)}
                      >
                        {variant}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={handleDecrement}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0) setQuantity(value);
                    }}
                    className="w-16 h-8 text-center border-0 focus:ring-0 p-0"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={handleIncrement}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="default"
                  size="lg"
                  className="h-12 text-lg"
                  onClick={handleAddToCartWithQuantity}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - ${getDiscountedPrice() * quantity}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 text-lg"
                  onClick={onChat}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat About Product
                </Button>
              </div>

              {/* Business Type Specific Information */}
              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Product Information</h3>

                    {product.business.businessType === 'ARTISAN' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        As a handcrafted product, this item may have slight variations that make it unique.
                        Artisans typically take 2-4 weeks to complete custom orders. Contact the business
                        directly for customization options.
                      </p>
                    )}

                    {product.business.businessType === 'GROCERY' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        This grocery item is typically available for same-day delivery. Check with the
                        business for current stock availability and delivery options in your area.
                      </p>
                    )}

                    {product.business.businessType === 'BOOKSTORE' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Bookstore items may include special editions or signed copies. Ask about
                        availability of specific editions or related products that might interest you.
                      </p>
                    )}

                    {(product.business.businessType !== 'ARTISAN' &&
                      product.business.businessType !== 'GROCERY' &&
                      product.business.businessType !== 'BOOKSTORE') && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Contact the business directly for any questions about this product,
                          availability, or customization options.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}