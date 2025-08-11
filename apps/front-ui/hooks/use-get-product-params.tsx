import { useParams } from "next/navigation";

export const useGetProductIdParam = (): string => {
  const { productId } = useParams();
  return productId as string;
};