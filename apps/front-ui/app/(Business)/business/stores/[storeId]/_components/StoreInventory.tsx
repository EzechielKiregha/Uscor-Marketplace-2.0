"use client";

import { useQuery } from "@apollo/client";
import { AlertTriangle, ArrowDown, CheckCircle, Package } from "lucide-react";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { GET_STORE_INVENTORY } from "@/graphql/store.gql";

interface StoreInventoryProps {
  storeId: string;
}

export default function StoreInventory({ storeId }: StoreInventoryProps) {
  const { data, loading } = useQuery(GET_STORE_INVENTORY, {
    variables: { storeId },
    skip: !storeId,
  });

  if (loading) return <TableSkeleton />;
  if (!data?.storeInventory) return null;

  const { items, totalItems, lowStockCount, outOfStockCount } =
    data.storeInventory;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-xl font-bold">{totalItems || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <ArrowDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-xl font-bold">{lowStockCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-xl font-bold">{outOfStockCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <h2 className="font-semibold">Current Inventory Levels</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-left">Product</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Min. Threshold</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item: any) => {
                const isLow =
                  item.quantity <= item.minQuantity && item.quantity > 0;
                const isOut = item.quantity === 0;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.product?.medias?.length !== 0 ? (
                          <img
                            src={item.product?.medias[0]?.url}
                            alt={item.product.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">
                          {item.product.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.product?.category?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground">
                      {item.product.minQuantity || 10}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">
                          <ArrowDown className="h-3 w-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                          <CheckCircle className="h-3 w-3" /> In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
