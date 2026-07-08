// hooks/useProductSubscriptions.ts
"use client";

import { useSubscription } from "@apollo/client";
import { GET_PRODUCTS, ON_PRODUCT_CREATED, ON_PRODUCT_UPDATED } from "@/graphql/product.gql";

/**
 * Call once at the products list level.
 * Keeps the GET_PRODUCTS cache fresh via subscriptions
 * so ProductForm consumers don't need to manually refetch.
 */
export function useProductSubscriptions(businessId: string) {
  useSubscription(ON_PRODUCT_CREATED, {
    variables: { businessId },
    skip: !businessId,
    onData: ({ client, data }) => {
      const newProduct = data.data?.productCreated;
      if (!newProduct) return;

      client.cache.updateQuery({ query: GET_PRODUCTS }, (existing) => {
        if (!existing?.products) return existing;
        // Avoid duplicates (e.g. optimistic update already added it)
        const already = existing.products.some((p: any) => p.id === newProduct.id);
        if (already) return existing;
        return { products: [newProduct, ...existing.products] };
      });
    },
  });

  useSubscription(ON_PRODUCT_UPDATED, {
    variables: { businessId },
    skip: !businessId,
    onData: ({ client, data }) => {
      const updated = data.data?.productUpdated;
      if (!updated) return;

      // Apollo auto-normalises by id, so a cache.writeFragment is enough
      client.cache.modify({
        id: client.cache.identify(updated),
        fields: {
          title: () => updated.title,
          description: () => updated.description,
          price: () => updated.price,
          quantity: () => updated.quantity,
          medias: () => updated.medias,
          featured: () => updated.featured,
          updatedAt: () => updated.updatedAt,
        },
      });
    },
  });
}