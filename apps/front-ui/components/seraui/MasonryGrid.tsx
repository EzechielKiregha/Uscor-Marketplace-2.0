'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TypeScript Interfaces ---
interface Product {
  id: string | number;
  imageUrl: string;
  title: string;
  price: number;
  quantity?: number;
  href: string;
  categoryName?: string;
  businessName?: string;
  businessAvatarUrl?: string;
}

interface GridItemProps {
  product: Product;
  onLike?: (id: string | number) => void;
}

interface MasonryGridProps {
  products: Product[];
  onLike?: (id: string | number) => void;
}

// --- SVG Icons ---
const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-white group-hover:text-pink-500 transition-colors duration-200"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

// --- GridItem Component ---
const GridItem: React.FC<GridItemProps> = ({ product, onLike }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.imageUrl);

  const handleImageError = () => {
    setImgSrc(`https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(product.title)}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) onLike(product.id);
  };

  return (
    <motion.div
      className="mb-6 break-inside-avoid cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => (window.location.href = product.href)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg bg-muted">
        <img
          src={imgSrc}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={handleImageError}
        />

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"
            >
              <div className="p-4 h-full flex flex-col justify-between pointer-events-auto">
                <div className="flex justify-start">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={handleLike}
                    className="p-2 bg-background dark:bg-gray-950/30 rounded-lg backdrop-blur-sm group"
                    aria-label={`Like ${product.title}`}
                  >
                    <HeartIcon />
                  </motion.button>
                </div>

                <div>
                  <p className="text-white font-bold text-base truncate">{product.title}</p>
                  <p className="text-white text-sm opacity-90">${product.price.toFixed(2)}</p>
                  {product.quantity !== undefined && (
                    <p className="text-white/75 text-xs">Only {product.quantity} left</p>
                  )}
                  {product.categoryName && (
                    <p className="text-white text-xs opacity-80">{product.categoryName}</p>
                  )}
                  {product.businessName && (
                    <div className="flex items-center mt-1">
                      {product.businessAvatarUrl && (
                        <img
                          src={product.businessAvatarUrl}
                          alt={product.businessName}
                          className="w-5 h-5 rounded-full mr-2"
                        />
                      )}
                      <p className="text-white text-xs opacity-80">{product.businessName}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile/Fallback Info */}
      {!isHovered && (
        <div className="mt-2">
          <p className="text-foreground font-medium truncate">{product.title}</p>
          <p className="text-primary text-sm font-bold">${product.price.toFixed(2)}</p>
          {product.categoryName && (
            <p className="text-muted-foreground text-xs">{product.categoryName}</p>
          )}
          {product.businessName && (
            <div className="flex items-center mt-1">
              {product.businessAvatarUrl && (
                <img
                  src={product.businessAvatarUrl}
                  alt={product.businessName}
                  className="w-4 h-4 rounded-full mr-1"
                />
              )}
              <p className="text-xs text-muted-foreground">{product.businessName}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// --- MasonryGrid Component ---
export default function MasonryGrid({ products, onLike }: MasonryGridProps) {
  return (
    <div className="space-y-6">
      <div className="columns-1 gap-6 sm:columns-2 md:columns-3 lg:columns-4">
        {products.map((product) => (
          <GridItem key={product.id} product={product} onLike={onLike} />
        ))}
      </div>
    </div>
  );
}
