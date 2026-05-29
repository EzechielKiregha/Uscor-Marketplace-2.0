import {
  BookOpen,
  Coffee,
  Hammer,
  Palette,
  Plug,
  Shirt,
  ShoppingCart,
  Store,
  UtensilsCrossed,
  Wine,
} from "lucide-react";

interface BusinessTypeIconProps {
  businessType: string;
  className?: string;
}

export default function BusinessTypeIcon({
  businessType,
  className,
}: BusinessTypeIconProps) {
  switch (businessType) {
    case "ARTISAN":
      return <Palette className={className} />;
    case "BOOKSTORE":
      return <BookOpen className={className} />;
    case "ELECTRONICS":
      return <Plug className={className} />;
    case "HARDWARE":
      return <Hammer className={className} />;
    case "GROCERY":
      return <ShoppingCart className={className} />;
    case "CAFE":
      return <Coffee className={className} />;
    case "RESTAURANT":
      return <UtensilsCrossed className={className} />;
    case "RETAIL":
      return <Store className={className} />;
    case "BAR":
      return <Wine className={className} />;
    case "CLOTHING":
      return <Shirt className={className} />;
    default:
      return <Store className={className} />;
  }
}
