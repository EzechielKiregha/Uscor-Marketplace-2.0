'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Star,
  Gift,
  ShoppingCart,
  MessageSquare,
  MapPin,
  Loader2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import ProductDetailsModal from './ProductDetailsModal';
import AddToCartButton from '@/components/AddToCartButton';
import { useCart } from '@/hooks/use-cart';

interface ProductCardProps {
  product: any;
  viewMode: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false);
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

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const handleChat = () => {
    // In a real app, this would open a chat with the business
    showToast('success', 'Chat Opened', 'You can now chat with the business about this product');

    // Navigate to chat
    setTimeout(() => {
      window.location.href = `/chats?businessId=${product.business.id}&productId=${product.id}`;
    }, 1000);
  };

  const handleAddToCart = () => {
    // In a real app, this would add the product to the cart
    showToast('success', 'Added to Cart', `${product.title} has been added to your cart`);
  };

  if (viewMode === 'grid') {
    return (
      <>
        <div className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card">
          {/* Product Image */}
          <div className="h-48 bg-muted relative">
            {product.medias && product.medias.length > 0 ? (
              <img
                src={product.medias[0].url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Promotion Badge */}
            {hasPromotion && (
              <div className="absolute top-2 right-2 bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Gift className="h-3 w-3" />
                {promotion.discountPercentage}% off
              </div>
            )}
          </div>

          <div className="p-4">
            {/* Business Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">
                {getBusinessTypeIcon()}
              </div>
              <div>
                <h3 className="font-medium text-sm truncate">{product.business.name}</h3>
                {product.store && (
                  <p className="text-xs text-muted-foreground truncate">{product.store.name}</p>
                )}
              </div>
              {product.business.kycStatus === 'VERIFIED' && (
                <ShieldCheck className="h-4 w-4 text-primary ml-1" />
              )}
            </div>

            {/* Product Title */}
            <h4 className="font-medium mb-1 line-clamp-1">{product.title}</h4>

            {/* Product Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-3">
              {hasPromotion ? (
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">${getDiscountedPrice().toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleViewDetails}
              >
                View Details
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => {
                  addItem(product)
                  setIsSuccess(true)
                  showToast('success', 'Added to Cart', `${product.title} has been added to your cart`);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Modal */}
        {showDetails && (
          <ProductDetailsModal
            product={product}
            onClose={() => setShowDetails(false)}
            onChat={handleChat}
            onAddToCart={handleAddToCart}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card flex flex-col md:flex-row">
        {/* Product Image */}
        <div className="md:w-48 h-32 md:h-auto bg-muted relative">
          {product.medias && product.medias.length > 0 ? (
            <img
              src={product.medias[0].url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Promotion Badge */}
          {hasPromotion && (
            <div className="absolute top-2 right-2 bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Gift className="h-3 w-3" />
              {promotion.discountPercentage}% off
            </div>
          )}
        </div>

        <div className="p-4 flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div>
              {/* Business Info */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">
                  {getBusinessTypeIcon()}
                </div>
                <h3 className="font-medium text-sm">{product.business.name}</h3>
                {product.business.kycStatus === 'VERIFIED' && (
                  <ShieldCheck className="h-4 w-4 text-primary ml-1" />
                )}
                {product.store && (
                  <span className="text-xs text-muted-foreground ml-1">• {product.store.name}</span>
                )}
              </div>

              {/* Product Title */}
              <h4 className="font-medium mb-1 line-clamp-1">{product.title}</h4>

              {/* Product Description */}
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {product.description}
                </p>
              )}

              {/* Business Address */}
              {product.business.address && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{product.business.address}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              {/* Price */}
              <div className="mb-2">
                {hasPromotion ? (
                  <div className="flex flex-col items-end">
                    <p className="font-bold text-lg">${getDiscountedPrice().toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewDetails}
                >
                  View Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetails && (
        <ProductDetailsModal
          product={product}
          onClose={() => setShowDetails(false)}
          onChat={handleChat}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}