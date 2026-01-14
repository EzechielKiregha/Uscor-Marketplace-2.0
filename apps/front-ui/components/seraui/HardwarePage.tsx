'use client';

import React, { useState } from 'react';

// --- Hardware Data (from your scraped file) ---
type HardwareItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  type: 'printer' | 'mobile-printer' | 'label-printer' | 'scanner' | 'cash-drawer' | 'terminal' | 'card-reader' | 'stand';
  compatibility: ('android' | 'ios' | 'desktop' | 'card-readers')[];
  connectivity: ('USB' | 'Bluetooth' | 'Ethernet' | 'Wi-Fi')[];
};

const hardwareItems: HardwareItem[] = [
  {
    id: 1,
    title: 'Epson TM-T88VI-i',
    description: 'Offering fast print speeds and high reliability, with advanced features.',
    image: '/images/hardware/epson-tmt88vi.jpg',
    type: 'printer',
    compatibility: ['android', 'ios'],
    connectivity: ['Ethernet'],
  },
  {
    id: 2,
    title: 'Epson TM-m30',
    description: 'Available in both black and white, its very small footprint makes it ideal for customers with limited counter space.',
    image: '/images/hardware/epson-tmm30.jpg',
    type: 'printer',
    compatibility: ['android', 'ios'],
    connectivity: ['Ethernet', 'Bluetooth', 'USB'],
  },
  {
    id: 3,
    title: 'XPrinter XP-Q800',
    description: 'Provides reliable quality at a low price. With LAN interface and Epson ESC/POS commands compatibility.',
    image: '/images/hardware/xprinter-xpq800.jpg',
    type: 'printer',
    compatibility: ['android'],
    connectivity: ['Ethernet'],
  },
  {
    id: 4,
    title: 'Star TSP143IIIU',
    description: 'Enables reliable USB communication and simultaneous charging with an iPad or iPhone.',
    image: '/images/hardware/star-tsp143iiiu.jpg',
    type: 'printer',
    compatibility: ['ios'],
    connectivity: ['USB'],
  },
  {
    id: 5,
    title: 'Citizen CT-E651ET',
    description: 'Stylish, high-performance 3-inch receipt printer. A model that combines design and practicality.',
    image: '/images/hardware/citizen-cte651et.jpg',
    type: 'printer',
    compatibility: ['android', 'ios'],
    connectivity: ['Ethernet'],
  },
  {
    id: 6,
    title: 'SPRT SP-POS890',
    description: 'High speed receipt printer with auto cutter. 58mm and 80mm paper width support. Sound and light alarm.',
    image: '/images/hardware/sprt-sp-pos890.jpg',
    type: 'printer',
    compatibility: ['android', 'ios'],
    connectivity: ['Ethernet'],
  },
  {
    id: 7,
    title: 'Star SM-T300i',
    description: 'Portable mobile Bluetooth thermal receipt printer. It has reliable and quick print speed of 75mm per second.',
    image: '/images/hardware/star-sm-t300i.jpg',
    type: 'mobile-printer',
    compatibility: ['ios'],
    connectivity: ['Bluetooth'],
  },
  {
    id: 8,
    title: 'Seiko MP-B20',
    description: 'Compact and ultra-lightweight 2” mobile printer has a rugged, drop-resistant design.',
    image: '/images/hardware/seiko-mp-b20.jpg',
    type: 'mobile-printer',
    compatibility: ['android'],
    connectivity: ['Bluetooth'],
  },
  {
    id: 9,
    title: 'Zebra ZD410',
    description: 'Designed for the smallest of workspaces, easy to use, maximizing printer uptime.',
    image: '/images/hardware/zebra-zd410.jpg',
    type: 'label-printer',
    compatibility: ['desktop'],
    connectivity: ['USB'],
  },
  {
    id: 10,
    title: 'Motorola CS3070',
    description: 'The tiny device fits in a pocket. Can be utilized in standalone mode for the batch scanning of bar codes.',
    image: '/images/hardware/motorola-cs3070.jpg',
    type: 'scanner',
    compatibility: ['android'],
    connectivity: ['Bluetooth'],
  },
  {
    id: 11,
    title: 'Datalogic QuickScan Lite QW2100',
    description: 'Small, lightweight and its ergonomic design is comfortable to use during daily operations.',
    image: '/images/hardware/datalogic-qw2100.jpg',
    type: 'scanner',
    compatibility: ['android'],
    connectivity: ['USB'],
  },
  {
    id: 12,
    title: 'Zebex Z-3250',
    description: 'The compact scanner offers a wide scanning range and wireless communication technology for easy handling of any applications.',
    image: '/images/hardware/zebex-z3250.jpg',
    type: 'scanner',
    compatibility: ['android'],
    connectivity: ['Bluetooth'],
  },
  {
    id: 13,
    title: 'Volcora',
    description: '16" Drawer 5 Bill / 6 Coin Tray, Auto-open, Removable Coin Compartment.',
    image: '/images/hardware/volcora.jpg',
    type: 'cash-drawer',
    compatibility: ['android', 'ios'],
    connectivity: [],
  },
  {
    id: 14,
    title: 'Sunmi',
    description: 'Uscor is compatible with built-in printers on Sunmi devices.',
    image: '/images/hardware/sunmi.jpg',
    type: 'terminal',
    compatibility: ['android'],
    connectivity: ['Ethernet', 'Bluetooth', 'USB'],
  },
  {
    id: 15,
    title: 'BOXaPOS small printer stand',
    description: 'Spacing for a compact printer. At the rear, a payment holder or extra display can be put. Fits all tablets.',
    image: '/images/hardware/boxapos-small-stand.jpg',
    type: 'stand',
    compatibility: ['android', 'ios'],
    connectivity: [],
  },
  {
    id: 16,
    title: 'Kensington Adjustable Kickstand',
    description: 'Makes typing and viewing easier for customers. Provides 180 degree of adjustability.',
    image: '/images/hardware/kensington-kickstand.jpg',
    type: 'stand',
    compatibility: ['ios'],
    connectivity: [],
  },
  {
    id: 17,
    title: 'PayPal Zettle',
    description: 'PayPal Reader – Accept contactless, chip, and swipe payments.',
    image: '/images/hardware/paypal-zettle.jpg',
    type: 'card-reader',
    compatibility: ['ios', 'android', 'card-readers'],
    connectivity: ['Bluetooth'],
  },
];

// --- SVG Icons ---
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// --- Hardware Card ---
const HardwareCard = ({ item }: { item: HardwareItem }) => {
  return (
    <div className="bg-card border border-orange-400/60 dark:border-orange-500/70/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://placehold.co/300x300/E2E8F0/333333?text=${encodeURIComponent(item.title)}`;
          }}
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.description}</p>

        {/* Compatibility */}
        <div className="flex flex-wrap gap-2 mb-3">
          {item.compatibility.map((os) => (
            <span
              key={os}
              className={`
                text-xs px-2 py-1 rounded-full capitalize
                ${os === 'android' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                ${os === 'ios' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                ${os === 'desktop' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                ${os === 'card-readers' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : ''}
              `}
            >
              {os.replace('-readers', '')}
            </span>
          ))}
        </div>

        {/* Connectivity */}
        <div className="flex flex-wrap gap-1">
          {item.connectivity.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Export ---
export default function HardwarePage() {
  const [filter, setFilter] = useState<'all' | 'android' | 'ios'>('all');

  const filteredItems = hardwareItems.filter((item) => {
    if (filter === 'all') return true;
    return item.compatibility.includes(filter);
  });

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Hardware for Your Uscor POS
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Pair your Uscor Intelligent POS with best-in-class hardware — from receipt printers to card readers — all tested and compatible.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center border border-orange-400/60 dark:border-orange-500/70 rounded-lg px-3 py-2 bg-muted w-full sm:w-auto">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search hardware..."
            className="ml-2 bg-transparent outline-none text-foreground placeholder-muted-foreground w-full"
          />
        </div>

        <div className="flex border border-orange-400/60 dark:border-orange-500/70 rounded-lg overflow-hidden bg-muted w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('android')}
            className={`px-4 py-2 text-sm font-medium ${filter === 'android' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Android
          </button>
          <button
            onClick={() => setFilter('ios')}
            className={`px-4 py-2 text-sm font-medium ${filter === 'ios' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            iOS
          </button>
        </div>
      </div>

      {/* Hardware Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <HardwareCard key={item.id} item={item} />
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <p className="text-muted-foreground mb-6">Need help choosing the right setup?</p>
        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent transition-colors shadow-md hover:shadow-lg">
          Contact Sales
        </button>
      </div>
    </div>
  );
}