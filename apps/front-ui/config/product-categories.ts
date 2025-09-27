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
        imageSrc: '/category/prod/men_clothing.jpg',
      },
      {
        name: 'Women’s Clothing',
        desc: 'Trendy and comfortable apparel',
        href: '/products/fashion/womens-clothing',
        imageSrc: '/category/prod/women_clothing.jpg',
      },
      {
        name: 'Accessories',
        desc: 'Bags, belts, and fashion essentials',
        href: '/products/fashion/accessories',
        imageSrc: '/category/prod/belts_accessory.jpg',
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
        imageSrc: '/category/prod/smartphones.jpg',
      },
      {
        name: 'Laptops',
        desc: 'Powerful and portable computing devices',
        href: '/products/electronics/laptops',
        imageSrc: '/category/prod/laptops_1.jpg',
      },
      {
        name: 'Headphones',
        desc: 'Premium sound quality on the go',
        href: '/products/electronics/headphones',
        imageSrc: '/category/prod/headphones.jpg',
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
        imageSrc: '/category/prod/Living Room Furniture.jpg',
      },
      {
        name: 'Bedroom Sets',
        desc: 'Beds and wardrobes for cozy nights',
        href: '/products/home/bedroom',
        imageSrc: '/category/prod/UI/UX Design.jpg',
      },
      {
        name: 'Kitchen Essentials',
        desc: 'Everything for your dream kitchen',
        href: '/products/home/kitchen',
        imageSrc: '/category/prod/Kitchen Essentials.jpg',
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
        imageSrc: '/category/prod/Car Accessories.jpg',
      },
      {
        name: 'Engine Oils',
        desc: 'Performance-enhancing lubricants',
        href: '/products/automotive/oils',
        imageSrc: '/category/prod/Engine Oils.jpg',
      },
      {
        name: 'Tires',
        desc: 'Durable and safe for all terrains',
        href: '/products/automotive/tires',
        imageSrc: '/category/prod/Tire Shop.jpg',
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
        imageSrc: '/category/prod/Workout Equipment_1.jpg',
      },
      {
        name: 'Activewear',
        desc: 'Comfortable clothes for your workout',
        href: '/products/sports/activewear',
        imageSrc: '/category/prod/Activewear.jpg',
      },
      {
        name: 'Supplements',
        desc: 'Boost your fitness journey',
        href: '/products/sports/supplements',
        imageSrc: '/category/prod/Supplements.jpg',
      },
    ],
  },
];
