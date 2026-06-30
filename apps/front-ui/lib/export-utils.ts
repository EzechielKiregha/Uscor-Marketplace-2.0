// lib/export-utils.ts
// Reusable CSV export utilities for sales, inventory, customers, etc.

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any, row: any) => string;
}

function escapeCSVField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["﻿" + content], { type: `${mimeType};charset=utf-8` }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV and trigger download
 */
export function exportToCSV(
  data: any[],
  filename: string,
  columns: ExportColumn[],
) {
  const header = columns.map((c) => escapeCSVField(c.label)).join(",");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const raw = col.format
          ? col.format(getNestedValue(row, col.key), row)
          : getNestedValue(row, col.key);
        return escapeCSVField(String(raw ?? ""));
      })
      .join(","),
  );
  const csv = [header, ...rows].join("\n");
  downloadBlob(csv, `${filename}.csv`, "text/csv");
}

/**
 * Access nested object values with dot notation (e.g. "store.name")
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

// ──── PRESET COLUMN DEFINITIONS ────

export const SALES_COLUMNS: ExportColumn[] = [
  { key: "id", label: "Sale ID", format: (v) => v?.substring(0, 8) || "" },
  { key: "createdAt", label: "Date", format: (v) => v ? new Date(v).toLocaleString() : "" },
  { key: "store.name", label: "Store" },
  { key: "worker.fullName", label: "Cashier" },
  { key: "client.fullName", label: "Customer" },
  { key: "totalAmount", label: "Amount", format: (v) => v?.toFixed(2) || "0.00" },
  { key: "discount", label: "Discount", format: (v) => v?.toFixed(2) || "0.00" },
  { key: "paymentMethod", label: "Payment Method" },
  { key: "status", label: "Status" },
  {
    key: "saleProducts",
    label: "Items",
    format: (v) => (Array.isArray(v) ? v.length.toString() : "0"),
  },
];

export const INVENTORY_COLUMNS: ExportColumn[] = [
  { key: "product.title", label: "Product" },
  { key: "product.price", label: "Price", format: (v) => `$${v?.toFixed(2) || "0.00"}` },
  { key: "quantity", label: "Stock Qty" },
  { key: "minQuantity", label: "Min Qty" },
  {
    key: "status",
    label: "Status",
    format: (_, row) => {
      if (!row.quantity || row.quantity <= 0) return "Out of Stock";
      if (row.quantity <= (row.minQuantity || 5)) return "Low Stock";
      return "In Stock";
    },
  },
  { key: "product.category.name", label: "Category" },
];

export const CUSTOMER_COLUMNS: ExportColumn[] = [
  { key: "fullName", label: "Customer Name" },
  { key: "email", label: "Email" },
  { key: "totalSpent", label: "Total Spent", format: (v) => `$${v?.toFixed(2) || "0.00"}` },
  { key: "orderCount", label: "Orders" },
  { key: "avgOrderValue", label: "Avg Order", format: (v) => `$${v?.toFixed(2) || "0.00"}` },
  { key: "lastPurchase", label: "Last Purchase", format: (v) => v ? new Date(v).toLocaleDateString() : "" },
  {
    key: "paymentMethods",
    label: "Payment Methods",
    format: (v) => (Array.isArray(v) ? v.join(", ") : ""),
  },
];

export const SHIFT_COLUMNS: ExportColumn[] = [
  { key: "worker.fullName", label: "Worker" },
  { key: "startTime", label: "Clock In", format: (v) => v ? new Date(v).toLocaleString() : "" },
  { key: "endTime", label: "Clock Out", format: (v) => v ? new Date(v).toLocaleString() : "Active" },
  { key: "sales", label: "Revenue", format: (v) => `$${v?.toFixed(2) || "0.00"}` },
  { key: "transactionCount", label: "Transactions" },
  { key: "status", label: "Status" },
];

// ──── CONVENIENCE EXPORTS ────

export function exportSalesCSV(sales: any[], filename = "sales-report") {
  exportToCSV(sales, filename, SALES_COLUMNS);
}

export function exportInventoryCSV(
  inventory: any[],
  filename = "inventory-report",
) {
  exportToCSV(inventory, filename, INVENTORY_COLUMNS);
}

export function exportCustomersCSV(
  customers: any[],
  filename = "customers-report",
) {
  exportToCSV(customers, filename, CUSTOMER_COLUMNS);
}

export function exportShiftsCSV(shifts: any[], filename = "shifts-report") {
  exportToCSV(shifts, filename, SHIFT_COLUMNS);
}
