'use client';

import React from 'react';


// Reusable MarqueeScroller Component
export default function MarqueeScroller({
  items,
  speed = '25s',
  direction = 'forwards', // 'forwards' | 'reverse'
  itemWidth = '120px',
  className = '',
}: {
  items: { id: number; component: React.ReactNode }[];
  speed?: string;
  direction?: 'forwards' | 'reverse';
  itemWidth?: string;
  className?: string;
}) {
  // Inject keyframes dynamically
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes marquee-move {
        to {
          transform: translateX(calc(-100cqw - var(--item-gap)));
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const isReverse = direction === 'reverse';

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 2rem, black calc(100% - 2rem), transparent)',
      }}
    >
      <div
        className="flex"
        style={{
          '--item-gap': '1rem',
          '--item-width': itemWidth,
        } as React.CSSProperties}
      >
        {items.concat(items).map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex-shrink-0 flex items-center justify-center bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-2xl text-foreground"
            style={{
              width: 'var(--item-width)',
              aspectRatio: '1 / 1.2',
              marginRight: 'var(--item-gap)',
              animation: `marquee-move ${speed} linear infinite ${isReverse ? 'reverse' : 'forwards'}`,
            }}
          >
            <div className="w-3/5 h-auto">{item.component}</div>
          </div>
        ))}
      </div>
    </div>
  );
}