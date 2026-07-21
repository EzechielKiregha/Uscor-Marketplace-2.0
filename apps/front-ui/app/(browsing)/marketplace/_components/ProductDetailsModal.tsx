"use client";

import { useCart } from "@/app/context/use-cart";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBusinessTypeConfig, getBusinessTypeEmoji } from "@/config/business-types";
import {
    AlertTriangle,
    BaggageClaim,
    Gift,
    MapPin,
    MessageSquare,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingCart,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import TypeSpecificFields from "./TypeSpecificFields";

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
  onOpenChat: (open: boolean) => void;
  onAddToCart: () => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onOpenChat,
  onAddToCart,
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const { showToast } = useToast();

  const { addItem } = useCart();
  const [_isSuccess, setIsSuccess] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    product.medias?.[0]?.url || null,
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSuccess(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);
  // Check if product has an active promotion
  const hasPromotion = product.promotions && product.promotions.length > 0;
  const promotion = hasPromotion ? product.promotions[0] : null;

  // Calculate discounted price if promotion exists
  const getDiscountedPrice = () => {
    if (!promotion) return product.price;
    return product.price * (1 - promotion.discountPercentage / 100);
  };

  const getBusinessTypeIcon = () =>
    getBusinessTypeEmoji(product.business.businessType);

  const handleIncrement = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCartWithQuantity = () => {
    // In a real app, this would add the product with quantity to the cart
    addItem(product);
    setIsSuccess(true);
    showToast(
      "success",
      "Added to Cart",
      `${quantity}x ${product.title} has been added to your cart`,
    );
    onClose();
  };

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariant(variantId);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border hover:border-primary  rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">{product.title}</h2>
              <p className="text-muted-foreground mt-1">
                {product.business.name} • {product.store?.name}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
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
                    src={selectedImage || product.medias[0].url}
                    alt={product.title}
                    className="w-full h-80 sm:h-80 md:h-105 object-cover rounded-lg transition-all duration-300"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {product.medias.map((media: any, index: number) => {
                    const isActive = selectedImage === media.url;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImage(media.url)}
                        className={`relative shrink-0 w-18 h-18 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          isActive
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-transparent hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={media.url}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {isActive && (
                          <div className="absolute inset-0 bg-primary/10" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Business Info */}
              <div className="border hover:border-primary  rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold shrink-0">
                    {getBusinessTypeIcon()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-semibold text-base truncate">
                        {product.business.name}
                      </h3>
                      <div className="">
                        {product.business.isVerified && (
                          <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-[11px] font-medium">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                          </div>
                        )}

                        {product.business.isB2BEnabled && (
                          <div className="inline-flex items-center bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full text-[11px] font-medium">
                            <BaggageClaim className="h-3.5 w-3.5" />
                            B2B
                          </div>
                        )}
                      </div>
                    </div>

                    {product.store?.name && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {product.store.name}
                      </p>
                    )}
                  </div>
                </div>

                {product.business.address && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">
                      {product.business.address}
                    </span>
                  </div>
                )}

                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() =>
                      (window.location.href = `/b-view/${product.business.id}`)
                    }
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
                      <p className="text-3xl font-bold">
                        ${getDiscountedPrice().toFixed(2)}
                      </p>
                      <p className="text-lg text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-warning/10 text-warning px-3 py-2 rounded-lg inline-flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        {promotion.discountPercentage}% discount - Offer ends{" "}
                        {new Date(promotion.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-3xl font-bold">
                    ${product.price.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Product Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">About this product</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
              )}

              {/* Type-Specific Product Details */}
              <TypeSpecificFields
                product={product}
                context="detail"
                className="p-4 rounded-lg bg-muted/50 border border-border"
              />

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border hover:border-primary  rounded-md">
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
                      const value = parseInt(e.target.value, 10);
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
                  Add to Cart - ${(getDiscountedPrice() * quantity).toFixed(2)}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 text-lg"
                  onClick={() => onOpenChat(true)}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat with Seller
                </Button>
              </div>

              {/* Business Type Information */}
              {(() => {
                const config = getBusinessTypeConfig(product.business?.businessType);
                return (
                  <div className="mt-6 p-4 bg-muted rounded-lg border hover:border-primary ">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-md ${config.color.badge} shrink-0`}>
                        <config.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.description}. Contact the business directly for
                          any questions about this product, availability, or
                          customization options.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
