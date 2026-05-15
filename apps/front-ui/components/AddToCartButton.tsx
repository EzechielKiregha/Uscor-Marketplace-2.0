"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/context/use-cart";
import type { ProductEntity } from "@/lib/types";
import { Button, buttonVariants } from "./ui/button";

const AddToCartButton = ({ product }: { product: ProductEntity }) => {
  const { addItem } = useCart();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSuccess(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Button
      onClick={() => {
        addItem(product);
        setIsSuccess(true);
      }}
      className={buttonVariants({
        className:
          "bg-primary hover:bg-primary/90  text-white w-full cursor-pointer",
      })}
      size="lg"
    >
      {isSuccess ? "Done" : "Add to Cart"}
    </Button>
  );
};

export default AddToCartButton;
