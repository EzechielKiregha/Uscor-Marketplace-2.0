// lib/pdf/inventory-report-pdf.ts
// Client-side inventory report PDF generation using jsPDF

import jsPDF from "jspdf";

interface InventoryItem {
  quantity: number;
  minQuantity?: number;
  status?: string;
  product: {
    title: string;
    price: number;
    category?: { name: string };
  };
}

interface InventoryReportOptions {
  storeName: string;
  date?: string;
  items: InventoryItem[];
  stats?: {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

const ORANGE = [249, 115, 22] as const;
const DARK = [31, 41, 55] as const;
const GRAY = [107, 114, 128] as const;
const RED = [239, 68, 68] as const;
const GREEN = [34, 197, 94] as const;
const YELLOW = [234, 179, 8] as const;
const LIGHT_BG = [249, 250, 251] as const;

function getStockStatus(item: InventoryItem): {
  label: string;
  color: readonly [number, number, number];
} {
  if (!item.quantity || item.quantity <= 0) {
    return { label: "Out of Stock", color: RED };
  }
  if (item.quantity <= (item.minQuantity || 5)) {
    return { label: "Low Stock", color: YELLOW };
  }
  return { label: "In Stock", color: GREEN };
}

export function generateInventoryReportPDF(
  options: InventoryReportOptions,
): jsPDF {
  const { storeName, date, items, stats } = options;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ──── HEADER ────
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INVENTORY REPORT", margin, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(storeName, margin, 23);
  doc.text(
    date ||
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    pageWidth - margin,
    16,
    { align: "right" },
  );

  y = 40;

  // ──── SUMMARY ────
  const totalItems = stats?.totalItems || items.length;
  const lowStock =
    stats?.lowStockCount ||
    items.filter((i) => i.quantity > 0 && i.quantity <= (i.minQuantity || 5))
      .length;
  const outOfStock =
    stats?.outOfStockCount ||
    items.filter((i) => !i.quantity || i.quantity <= 0).length;
  const inStock = totalItems - lowStock - outOfStock;
  const totalValue = items.reduce(
    (sum, i) => sum + (i.product?.price || 0) * (i.quantity || 0),
    0,
  );

  const boxWidth = contentWidth / 4 - 3;
  const summaryItems = [
    { label: "Total Products", value: `${totalItems}` },
    { label: "In Stock", value: `${inStock}` },
    { label: "Low Stock", value: `${lowStock}` },
    { label: "Stock Value", value: `$${totalValue.toFixed(2)}` },
  ];

  summaryItems.forEach((item, idx) => {
    const x = margin + idx * (boxWidth + 4);
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(x, y, boxWidth, 18, 2, 2, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, x + 3, y + 6);
    doc.setTextColor(...DARK);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, x + 3, y + 13);
  });

  y += 26;

  // Out of stock warning
  if (outOfStock > 0) {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
    doc.setTextColor(...RED);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(
      `⚠ ${outOfStock} product${outOfStock !== 1 ? "s" : ""} out of stock`,
      margin + 4,
      y + 6,
    );
    y += 14;
  }

  // ──── TABLE ────
  doc.setFillColor(...LIGHT_BG);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");

  doc.text("PRODUCT", margin + 2, y + 5);
  doc.text("CATEGORY", margin + 70, y + 5);
  doc.text("PRICE", margin + 108, y + 5);
  doc.text("QTY", margin + 128, y + 5);
  doc.text("MIN", margin + 142, y + 5);
  doc.text("STATUS", margin + contentWidth - 2, y + 5, { align: "right" });

  y += 10;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  // Sort: out of stock first, then low stock, then in stock
  const sorted = [...items].sort((a, b) => {
    const aStatus = getStockStatus(a);
    const bStatus = getStockStatus(b);
    const order: Record<string, number> = {
      "Out of Stock": 0,
      "Low Stock": 1,
      "In Stock": 2,
    };
    return (order[aStatus.label] || 2) - (order[bStatus.label] || 2);
  });

  sorted.forEach((item, idx) => {
    if (y > 270) {
      doc.addPage();
      y = margin;

      // Reprint header on new page
      doc.setFillColor(...LIGHT_BG);
      doc.rect(margin, y, contentWidth, 8, "F");
      doc.setTextColor(...GRAY);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("PRODUCT", margin + 2, y + 5);
      doc.text("CATEGORY", margin + 70, y + 5);
      doc.text("PRICE", margin + 108, y + 5);
      doc.text("QTY", margin + 128, y + 5);
      doc.text("MIN", margin + 142, y + 5);
      doc.text("STATUS", margin + contentWidth - 2, y + 5, { align: "right" });
      y += 10;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
    }

    const status = getStockStatus(item);
    const title =
      item.product.title.length > 32
        ? item.product.title.substring(0, 32) + "..."
        : item.product.title;

    doc.setTextColor(...DARK);
    doc.text(title, margin + 2, y);
    doc.setTextColor(...GRAY);
    doc.text(
      (item.product.category?.name || "—").substring(0, 15),
      margin + 70,
      y,
    );
    doc.text(`$${item.product.price.toFixed(2)}`, margin + 108, y);
    doc.setTextColor(
      item.quantity <= 0 ? RED[0] : DARK[0],
      item.quantity <= 0 ? RED[1] : DARK[1],
      item.quantity <= 0 ? RED[2] : DARK[2],
    );
    doc.setFont("helvetica", "bold");
    doc.text(`${item.quantity}`, margin + 128, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(`${item.minQuantity || 5}`, margin + 142, y);
    doc.setTextColor(...status.color);
    doc.setFont("helvetica", "bold");
    doc.text(status.label, margin + contentWidth - 2, y, { align: "right" });
    doc.setFont("helvetica", "normal");

    // Separator
    doc.setDrawColor(229, 231, 235);
    y += 2.5;
    doc.line(margin, y, margin + contentWidth, y);
    y += 4.5;
  });

  if (items.length === 0) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(10);
    doc.text("No inventory data available", pageWidth / 2, y + 10, {
      align: "center",
    });
  }

  // ──── FOOTER ────
  const footerY = 285;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated by USCOR Marketplace — ${new Date().toLocaleString()}`,
    pageWidth / 2,
    footerY,
    { align: "center" },
  );

  return doc;
}

export function downloadInventoryReportPDF(options: InventoryReportOptions) {
  const doc = generateInventoryReportPDF(options);
  doc.save(
    `inventory_${options.storeName.replace(/\s+/g, "-").toLowerCase()}_${options.date || new Date().toISOString().split("T")[0]}.pdf`,
  );
}
