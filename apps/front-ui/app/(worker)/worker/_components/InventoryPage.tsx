"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Minus,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "@/components/seraui/Loader";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CREATE_INVENTORY_ADJUSTMENT,
  GET_WORKER_INVENTORY,
} from "@/graphql/worker.gql";
import { useIndexedDB } from "@/hooks/use-indexed-db";
import { useMe } from "@/lib/useMe";

interface InventoryPageProps {
  selectedStoreId: string | null;
}

export default function InventoryPage({ selectedStoreId }: InventoryPageProps) {
  const { user } = useMe();
  const {
    isOnline,
    saveLocalInventory,
    getLocalInventory,
    saveOfflineOperation,
    handleSync,
  } = useIndexedDB();

  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<"ADD" | "REMOVE">("ADD");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(1);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const { showToast } = useToast();

  const {
    data: inventoryData,
    loading: inventoryLoading,
    refetch: refetchInventory,
  } = useQuery(GET_WORKER_INVENTORY, {
    variables: {
      storeId: selectedStoreId, // In real app, this would be selected
    },
    skip: !user?.id,
  });

  const [createInventoryAdjustment] = useMutation(CREATE_INVENTORY_ADJUSTMENT);

  const inventory = inventoryData?.workerInventory?.items || [];

  const filteredInventory = inventory.filter((item: any) => {
    const matchesSearch =
      !searchQuery ||
      item.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesLowStock = !lowStockOnly || item.quantity < item.minQuantity;

    return matchesSearch && matchesLowStock;
  });

  const handleAdjustStock = async () => {
    if (!selectedProduct || adjustmentQuantity <= 0) return;

    if (!isOnline) {
      // Handle offline adjustment
      const adjustment = {
        id: `offline_${Date.now()}`,
        productId: selectedProduct.productId,
        storeId: selectedProduct.storeId,
        adjustmentType: adjustmentType,
        quantity:
          adjustmentType === "ADD" ? adjustmentQuantity : -adjustmentQuantity,
        reason: adjustmentReason || "Offline adjustment",
        timestamp: new Date().toISOString(),
        status: "PENDING_SYNC",
      };

      await saveOfflineOperation({
        type: "INVENTORY_ADJUSTMENT",
        adjustment: adjustment,
      });

      // Update local inventory temporarily
      const updatedLocalInventory = inventory.map((item: any) =>
        item.productId === selectedProduct.productId
          ? {
              ...item,
              quantity:
                adjustmentType === "ADD"
                  ? item.quantity + adjustmentQuantity
                  : item.quantity - adjustmentQuantity,
            }
          : item,
      );

      await saveLocalInventory(updatedLocalInventory);

      showToast(
        "info",
        "Offline Mode",
        "Stock adjustment queued. Will sync when online.",
      );
      setShowAdjustModal(false);
      setSelectedProduct(null);
      setAdjustmentQuantity(1);
      setAdjustmentReason("");
    } else {
      try {
        await createInventoryAdjustment({
          variables: {
            input: {
              productId: selectedProduct.productId,
              storeId: selectedProduct.storeId,
              adjustmentType: adjustmentType,
              quantity:
                adjustmentType === "ADD"
                  ? adjustmentQuantity
                  : -adjustmentQuantity,
              reason: adjustmentReason || "Manual adjustment",
            },
          },
        });

        showToast("success", "Success", "Inventory adjusted successfully");
        setShowAdjustModal(false);
        setSelectedProduct(null);
        setAdjustmentQuantity(1);
        setAdjustmentReason("");
        refetchInventory();
      } catch (error: any) {
        showToast(
          "error",
          "Error",
          error.message || "Failed to adjust inventory",
        );
      }
    }
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline) {
      handleSync();
    }
  }, [isOnline, handleSync]);

  if (inventoryLoading) return <Loader loading={true} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage stock levels and track inventory across your store
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Button
            variant={lowStockOnly ? "default" : "outline"}
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Low Stock Only
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchInventory()}>
            Refresh
          </Button>
          <Button
            variant="default"
            onClick={() => {
              setSelectedProduct(null);
              setAdjustmentType("ADD");
              setAdjustmentQuantity(1);
              setAdjustmentReason("");
              setShowAdjustModal(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredInventory.map((item: any) => {
          const isLowStock = item.quantity < item.minQuantity;
          const isOutOfStock = item.quantity === 0;

          return (
            <div
              key={item.id}
              className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                isOutOfStock
                  ? "border-destructive/50 bg-destructive/5"
                  : isLowStock
                    ? "border-warning/50 bg-warning/5"
                    : "border-border"
              }`}
            >
              <div className="relative">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive font-bold text-lg">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium line-clamp-1">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">{item.quantity}</p>
                    <p className="text-xs text-muted-foreground">in stock</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">Min: {item.minQuantity}</span>
                  </div>

                  {isLowStock && (
                    <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock
                    </span>
                  )}

                  {isOutOfStock && (
                    <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(item);
                      setAdjustmentType("REMOVE");
                      setAdjustmentQuantity(1);
                      setShowAdjustModal(true);
                    }}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(item);
                      setAdjustmentType("ADD");
                      setAdjustmentQuantity(1);
                      setShowAdjustModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">
            {searchQuery || lowStockOnly
              ? "No matching items found"
              : "No inventory items"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || lowStockOnly
              ? "Try adjusting your search or filter criteria"
              : "Your store inventory will appear here once you start adding products"}
          </p>

          {(searchQuery || lowStockOnly) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setLowStockOnly(false);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Inventory Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    Adjust Inventory: {selectedProduct.product.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current stock: {selectedProduct.quantity} units
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedProduct(null);
                    setAdjustmentQuantity(1);
                    setAdjustmentReason("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <Button
                    variant={adjustmentType === "ADD" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setAdjustmentType("ADD")}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Add Stock
                  </Button>
                  <Button
                    variant={
                      adjustmentType === "REMOVE" ? "default" : "outline"
                    }
                    className="flex-1"
                    onClick={() => setAdjustmentType("REMOVE")}
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Remove Stock
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setAdjustmentQuantity(Math.max(1, adjustmentQuantity - 1))
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) =>
                      setAdjustmentQuantity(
                        Math.max(1, parseInt(e.target.value, 10) || 1),
                      )
                    }
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setAdjustmentQuantity(adjustmentQuantity + 1)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium mb-1"
                  >
                    Reason for Adjustment
                  </label>
                  <Input
                    id="reason"
                    type="text"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="e.g., Delivery received, Damaged items, Theft, Transfer to another store"
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Projected Stock:</span>{" "}
                    {adjustmentType === "ADD"
                      ? selectedProduct.quantity + adjustmentQuantity
                      : Math.max(
                          0,
                          selectedProduct.quantity - adjustmentQuantity,
                        )}{" "}
                    units
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedProduct(null);
                    setAdjustmentQuantity(1);
                    setAdjustmentReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdjustStock}
                  disabled={adjustmentQuantity <= 0}
                >
                  Confirm Adjustment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
