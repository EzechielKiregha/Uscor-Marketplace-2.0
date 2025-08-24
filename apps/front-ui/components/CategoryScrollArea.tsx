'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { PRODUCT_CATEGORIES } from '@/config/product-categories';
import { FREELANCE_SERVICE_CATEGORIES } from '@/config/freelance-categories';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryScrollAreaProps {
  type: 'products' | 'freelance';
}

const CategoryScrollArea = ({ type }: CategoryScrollAreaProps) => {
  const categories = type === 'products' ? PRODUCT_CATEGORIES : FREELANCE_SERVICE_CATEGORIES;

  return (
    <ScrollArea className="h-[calc(100vh)] w-80 flex-shrink-0 hidden lg:block rounded-xl backdrop-blur-xl bg-white/95 dark:bg-gray-950/95 border border-orange-400/60 dark:border-orange-500/70 shadow-lg p-1">
      <div className="space-y-4">
        {categories.map((category: any) => (
          <div key={category.label} className="pb-2">
            <div className="flex flex-row justify-between mx-2">
              <category.icon size={20} className="text-primary" />
              <h3 className="px-4 text-sm font-semibold text-foreground">{category.label}</h3>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 px-2">
              {category[type === 'products' ? 'products' : 'services'].map((item: any) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted mb-2">
                    <img
                      src={item.imageSrc}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(item.name)}`; // Fallback image
                      }}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  {item.desc && (
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CategoryScrollArea;