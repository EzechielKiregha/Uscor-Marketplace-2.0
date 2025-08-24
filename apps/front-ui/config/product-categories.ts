import {
  Shirt,
  Laptop,
  Home,
  Car,
  Dumbbell,
  Utensils,
  Baby,
  Camera,
  Gamepad,
  Watch,
  Briefcase,
  Gift,
} from "lucide-react";

export const PRODUCT_CATEGORIES = [
  {
    label: 'Fashion & Clothing',
    value: 'FASHION' as const,
    icon: Shirt,
    products: [
      {
        name: 'Men’s Clothing',
        desc: 'Stylish outfits for every occasion',
        href: '/products/fashion/mens-clothing',
        imageSrc: 'https://images.unsplash.com/photo-1520975918317-5f0b0b8c4e0c',
      },
      {
        name: 'Women’s Clothing',
        desc: 'Trendy and comfortable apparel',
        href: '/products/fashion/womens-clothing',
        imageSrc: 'https://images.unsplash.com/photo-1542060748-10c28b62716b',
      },
      {
        name: 'Accessories',
        desc: 'Bags, belts, and fashion essentials',
        href: '/products/fashion/accessories',
        imageSrc: 'https://images.unsplash.com/photo-1588686821744-38bbd41c8799',
      },
    ],
  },
  {
    label: 'Electronics & Gadgets',
    value: 'ELECTRONICS' as const,
    icon: Laptop,
    products: [
      {
        name: 'Smartphones',
        desc: 'Latest models from top brands',
        href: '/products/electronics/smartphones',
        imageSrc: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
      },
      {
        name: 'Laptops',
        desc: 'Powerful and portable computing devices',
        href: '/products/electronics/laptops',
        imageSrc: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      },
      {
        name: 'Headphones',
        desc: 'Premium sound quality on the go',
        href: '/products/electronics/headphones',
        imageSrc: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
      },
    ],
  },
  {
    label: 'Home & Furniture',
    value: 'HOME' as const,
    icon: Home,
    products: [
      {
        name: 'Living Room Furniture',
        desc: 'Sofas, coffee tables, and more',
        href: '/products/home/living-room',
        imageSrc: 'https://images.unsplash.com/photo-1588854337117-32f2b139283b',
      },
      {
        name: 'Bedroom Sets',
        desc: 'Beds and wardrobes for cozy nights',
        href: '/products/home/bedroom',
        imageSrc: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      },
      {
        name: 'Kitchen Essentials',
        desc: 'Everything for your dream kitchen',
        href: '/products/home/kitchen',
        imageSrc: 'https://images.unsplash.com/photo-1556911220-e15b29be8c76',
      },
    ],
  },
  {
    label: 'Automotive',
    value: 'AUTOMOTIVE' as const,
    icon: Car,
    products: [
      {
        name: 'Car Accessories',
        desc: 'Covers, mats, and interior upgrades',
        href: '/products/automotive/accessories',
        imageSrc: 'https://images.unsplash.com/photo-1609692814850-65f3f8da2783',
      },
      {
        name: 'Engine Oils',
        desc: 'Performance-enhancing lubricants',
        href: '/products/automotive/oils',
        imageSrc: 'https://images.unsplash.com/photo-1597005517603-84e92cbf2fb3',
      },
      {
        name: 'Tires',
        desc: 'Durable and safe for all terrains',
        href: '/products/automotive/tires',
        imageSrc: 'https://images.unsplash.com/photo-1563720225549-70e408bb8f3d',
      },
    ],
  },
  {
    label: 'Sports & Fitness',
    value: 'SPORTS' as const,
    icon: Dumbbell,
    products: [
      {
        name: 'Workout Equipment',
        desc: 'Dumbbells, resistance bands, and more',
        href: '/products/sports/equipment',
        imageSrc: 'https://images.unsplash.com/photo-1583454110556-c1a59ba5b604',
      },
      {
        name: 'Activewear',
        desc: 'Comfortable clothes for your workout',
        href: '/products/sports/activewear',
        imageSrc: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0641',
      },
      {
        name: 'Supplements',
        desc: 'Boost your fitness journey',
        href: '/products/sports/supplements',
        imageSrc: 'https://images.unsplash.com/photo-1600180758890-6e1e59c6f9b6',
      },
    ],
  },
];
