"use client";

import { Button } from "@/components/ui/button";
import { MoreVertical, Package, ShoppingCart, Users } from "lucide-react";

interface StoreCardProps {
  store: any;
  workers: any[];
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onManage: () => void;
}

export default function StoreCard({
  store,
  workers,
  isSelected,
  onSelect,
  onEdit,
  onManage,
}: StoreCardProps) {
  // Calculate store metrics
  const activeWorkers = workers?.filter((worker) => worker.currentShift).length;
  const lowStockItems = store.inventoryStats?.lowStockItems || 0;
  const todaySales = store.dailyStats?.todaySales || 0;
  const activeShifts = store.shiftsStats?.activeShifts || 0;

  return (
    <div
      className={`border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
        isSelected ? "ring-2 ring-primary" : "border-border"
      }`}
      onClick={onSelect}
    >
      <div className="p-4 bg-muted border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg truncate">{store.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {store.address}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-1">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">{workers?.length}</p>
            <p className="text-xs text-muted-foreground">Workers</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto mb-1">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">${todaySales.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Today's Sales</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning mx-auto mb-1">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">{lowStockItems}</p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Active Shifts</span>
            <span className="font-medium">{activeShifts}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Active Workers</span>
            <span className="font-medium">{activeWorkers}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">
              {new Date(store.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
              onManage();
            }}
          >
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
}
