'use client';
import React, { useEffect } from 'react';

interface MarqueeItem {
  id: number;
  component: React.ReactNode;
}

interface MarqueeScrollerProps {
  className?: string;
  logos: MarqueeItem[];
  speed?: string;
  itemWidth?: string;
  itemGap?: string;
  direction?: 'forwards' | 'reverse';
}

const Marquee: React.FC<MarqueeScrollerProps> = ({
  logos,
  speed = '25s',
  itemWidth = '120px',
  itemGap = '25px',
  direction = 'forwards',
}) => {

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'marquee-keyframes';
    styleElement.textContent = `
      @keyframes marquee-move {
        to {
          transform: translateX(calc(-100cqw - var(--item-gap)));
        }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      const existing = document.getElementById('marquee-keyframes');
      if (existing) {
        document.head.removeChild(existing);
      }
    };
  }, []);


  const numItems = logos.length;

  return (
    <div
      className="max-w-full overflow-hidden"
      style={{
        '--speed': speed,
        '--numItems': numItems,
        '--item-width': itemWidth,
        '--item-gap': itemGap,
        '--direction': direction,
        maskImage: 'linear-gradient(to right, transparent, black 2rem, black calc(100% - 2rem), transparent)',
      } as React.CSSProperties}
    >
      <div
        className="w-max flex"
        style={{
          '--track-width': `calc(var(--item-width) * ${numItems})`,
          '--track-gap': `calc(var(--item-gap) * ${numItems})`,
        } as React.CSSProperties}
      >
        {[...logos, ...logos].map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex justify-center items-center bg-[var(--secondary-light)]/10 dark:bg-[var(--secondary-dark)]/10 border border-[var(--secondary-dark)] dark:border-[var(--lightGray)] rounded-2xl"
            style={{
              width: 'var(--item-width)',
              aspectRatio: '1 / 1.2',
              marginRight: 'var(--item-gap)',
              animation: `marquee-move var(--speed) linear infinite ${direction}`,
            } as React.CSSProperties}
          >
            <div className="w-3/5 h-auto text-[var(--primary)]">{logo.component}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarqueeScroller: React.FC<MarqueeScrollerProps> = ({
  className = '',
  logos,
  speed = '25s',
  itemWidth = '120px',
  itemGap = '25px',
  direction = 'forwards',
}) => {
  return (
    <div className={`items-center overflow-hidden ${className}`}>
      <div className="w-full max-w-6xl flex flex-col gap-y-6">
        <Marquee logos={logos} speed={speed} itemWidth={itemWidth} itemGap={itemGap} direction={direction} />
      </div>
    </div>
  );
};

export default MarqueeScroller;
