// app/business/inventory/_components/InventorySummary.tsx
'use client';

import { useQuery } from '@apollo/client';
import { GET_INVENTORY } from '@/graphql/inventory.gql';
import Loader from '@/components/seraui/Loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, ArrowRightLeft, ShoppingCart } from 'lucide-react';

interface InventorySummaryProps {
  storeId: string;
}

export default function InventorySummary({ storeId }: InventorySummaryProps) {
  const {
    data,
    loading,
    error,
    refetch
  } = useQuery(GET_INVENTORY, {
    variables: {
      storeId,
      lowStockOnly: true
    },
    skip: !storeId
  });

  if (loading) return (
    <Card>
      <CardContent className="h-[80px] flex items-center justify-center">
        <Loader loading={true} />
      </CardContent>
    </Card>
  );

  if (error) return (
    <Card>
      <CardContent className="h-[80px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-2">Error loading inventory summary</div>
          <button
            className="text-primary hover:underline"
            onClick={() => refetch()}
          >
            Try Again
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const inventoryItems = data?.inventory?.items || [];
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter((item: any) => item.quantity < item.minQuantity).length;
  const outOfStockItems = inventoryItems.filter((item: any) => item.quantity === 0).length;
  const totalQuantity = inventoryItems.reduce((sum: any, item: any) => sum + item.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium">{lowStockItems}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium">{outOfStockItems}</p>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-medium">{totalQuantity}</p>
              <p className="text-xs text-muted-foreground">Total Quantity</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}