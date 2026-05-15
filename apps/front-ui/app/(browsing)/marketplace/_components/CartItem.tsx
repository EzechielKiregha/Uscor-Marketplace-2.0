"use client";
import { CartItem as CI } from "@/app/context/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CI;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const handleIncrement = () => {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    }
  };

  return (
    <li className="py-6 flex">
      <div className="h-24 w-24 shrink-0 rounded-md overflow-hidden border border-border">
        {item.product.medias?.[0]?.url ? (
          <img
            src={item.product.medias[0].url}
            alt={item.product.title || item.product.name}
            className="w-full h-full object-cover"
          />
        ) : item.product.media?.[0]?.url ? (
          <img
            src={item.product.media[0].url}
            alt={item.product.title || item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium">
            <h3>{item.product.title || item.product.name}</h3>
            <p className="ml-4">${item.product.price.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-end justify-between flex-1 pt-2">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleDecrement}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleIncrement}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item.product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
