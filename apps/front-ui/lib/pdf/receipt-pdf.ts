// lib/pdf/receipt-pdf.ts
// Client-side thermal receipt PDF generation using jsPDF
// Replaces broken Puppeteer-based backend generation

import jsPDF from "jspdf";

interface ReceiptSaleProduct {
  quantity: number;
  price: number;
  modifiers?: string;
  product: {
    title: string;
    price: number;
  };
}

interface ReceiptSale {
  id: string;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  store: {
    name: string;
    address?: string;
    business?: {
      name: string;
      businessType?: string;
      phone?: string;
    };
  };
  worker?: {
    fullName?: string;
  };
  client?: {
    fullName?: string;
    email?: string;
  };
  saleProducts: ReceiptSaleProduct[];
}

interface ReceiptOptions {
  pointsEarned?: number;
  showTax?: boolean;
  taxRate?: number;
}

const RECEIPT_WIDTH = 80; // mm (thermal printer width)
const MARGIN = 5;
const CONTENT_WIDTH = RECEIPT_WIDTH - MARGIN * 2;

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  ARTISAN: "Artisan & Handcrafted Goods",
  BOOKSTORE: "Bookstore & Stationery",
  ELECTRONICS: "Electronics & Gadgets",
  HARDWARE: "Hardware & Tools",
  GROCERY: "Grocery & Convenience",
  CAFE: "Café & Coffee Shops",
  RESTAURANT: "Restaurant & Dining",
  RETAIL: "Retail & General Stores",
  BAR: "Bar & Pub",
  CLOTHING: "Clothing & Accessories",
};

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile Money",
  CARD: "Card",
  TOKEN: "USCOR Token",
  BANK_TRANSFER: "Bank Transfer",
};

function formatPaymentMethod(method: string): string {
  return PAYMENT_LABELS[method] || method;
}

function drawDashedLine(doc: jsPDF, y: number) {
  const dashLen = 1.5;
  const gapLen = 1;
  let x = MARGIN;
  while (x < RECEIPT_WIDTH - MARGIN) {
    doc.line(x, y, Math.min(x + dashLen, RECEIPT_WIDTH - MARGIN), y);
    x += dashLen + gapLen;
  }
}

export function generateReceiptPDF(
  sale: ReceiptSale,
  options: ReceiptOptions = {},
): jsPDF {
  const { pointsEarned = 0, showTax = true, taxRate = 0.18 } = options;
  const business = sale.store?.business;
  const businessType = business?.businessType || "";

  // Estimate height dynamically
  const itemCount = sale.saleProducts?.length || 0;
  const estimatedHeight = 140 + itemCount * 8 + (pointsEarned > 0 ? 20 : 0);
  const doc = new jsPDF({
    unit: "mm",
    format: [RECEIPT_WIDTH, Math.max(estimatedHeight, 150)],
  });

  let y = 8;

  // ──── HEADER ────
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(business?.name || "USCOR", RECEIPT_WIDTH / 2, y, { align: "center" });
  y += 5;

  if (businessType && BUSINESS_TYPE_LABELS[businessType]) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(BUSINESS_TYPE_LABELS[businessType], RECEIPT_WIDTH / 2, y, {
      align: "center",
    });
    y += 4;
  }

  doc.setFontSize(8);
  doc.text(sale.store?.name || "", RECEIPT_WIDTH / 2, y, { align: "center" });
  y += 3.5;

  if (sale.store?.address) {
    doc.text(sale.store.address, RECEIPT_WIDTH / 2, y, { align: "center" });
    y += 3.5;
  }

  if (business?.phone) {
    doc.text(business.phone, RECEIPT_WIDTH / 2, y, { align: "center" });
    y += 3.5;
  }

  y += 2;
  drawDashedLine(doc, y);
  y += 4;

  // ──── RECEIPT TITLE ────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`RECEIPT #${sale.id.substring(0, 8).toUpperCase()}`, RECEIPT_WIDTH / 2, y, {
    align: "center",
  });
  y += 5;
  drawDashedLine(doc, y);
  y += 4;

  // ──── META INFO ────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const metaLines: [string, string][] = [
    [
      "Date",
      new Date(sale.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ],
    ["Cashier", sale.worker?.fullName || "N/A"],
  ];

  if (sale.client?.fullName) {
    metaLines.push(["Customer", sale.client.fullName]);
  }

  metaLines.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, MARGIN, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, RECEIPT_WIDTH - MARGIN, y, { align: "right" });
    y += 4;
  });

  y += 1;
  drawDashedLine(doc, y);
  y += 4;

  // ──── ITEMS HEADER ────
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("ITEM", MARGIN, y);
  doc.text("QTY", RECEIPT_WIDTH / 2 + 5, y, { align: "center" });
  doc.text("TOTAL", RECEIPT_WIDTH - MARGIN, y, { align: "right" });
  y += 3.5;
  drawDashedLine(doc, y);
  y += 3;

  // ──── ITEMS ────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  (sale.saleProducts || []).forEach((sp) => {
    const title =
      sp.product.title.length > 22
        ? sp.product.title.substring(0, 22) + "..."
        : sp.product.title;
    const lineTotal = sp.price * sp.quantity;

    doc.text(title, MARGIN, y);
    doc.text(`x${sp.quantity}`, RECEIPT_WIDTH / 2 + 5, y, { align: "center" });
    doc.text(`$${lineTotal.toFixed(2)}`, RECEIPT_WIDTH - MARGIN, y, {
      align: "right",
    });
    y += 4;

    if (sp.modifiers) {
      doc.setFontSize(6);
      doc.setTextColor(120);
      doc.text(`  (${sp.modifiers})`, MARGIN + 2, y);
      doc.setTextColor(0);
      doc.setFontSize(8);
      y += 3;
    }
  });

  y += 1;
  drawDashedLine(doc, y);
  y += 4;

  // ──── TOTALS ────
  const subtotal = sale.totalAmount;
  const discount = sale.discount || 0;
  const tax = showTax ? subtotal * taxRate : 0;
  const grandTotal = subtotal - discount + tax;

  const totalLines: [string, string, boolean][] = [
    ["Subtotal", `$${subtotal.toFixed(2)}`, false],
  ];

  if (discount > 0) {
    totalLines.push(["Discount", `-$${discount.toFixed(2)}`, false]);
  }

  if (showTax) {
    totalLines.push([`Tax (${(taxRate * 100).toFixed(0)}%)`, `$${tax.toFixed(2)}`, false]);
  }

  totalLines.push(["TOTAL", `$${grandTotal.toFixed(2)}`, true]);

  totalLines.forEach(([label, value, isBold]) => {
    if (isBold) {
      y += 1;
      drawDashedLine(doc, y);
      y += 4;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
    }
    doc.text(label, MARGIN, y);
    doc.text(value, RECEIPT_WIDTH - MARGIN, y, { align: "right" });
    y += isBold ? 5 : 4;
  });

  // ──── PAYMENT METHOD ────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Payment", MARGIN, y);
  doc.setFont("helvetica", "bold");
  doc.text(formatPaymentMethod(sale.paymentMethod), RECEIPT_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 5;

  // ──── LOYALTY POINTS ────
  if (pointsEarned > 0) {
    drawDashedLine(doc, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("LOYALTY POINTS EARNED", RECEIPT_WIDTH / 2, y, { align: "center" });
    y += 4;
    doc.setFontSize(12);
    doc.text(`+${pointsEarned.toFixed(0)} pts`, RECEIPT_WIDTH / 2, y, {
      align: "center",
    });
    y += 5;
  }

  // ──── FOOTER ────
  drawDashedLine(doc, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for your business!", RECEIPT_WIDTH / 2, y, {
    align: "center",
  });
  y += 4;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("USCOR Marketplace", RECEIPT_WIDTH / 2, y, { align: "center" });
  y += 3;
  doc.text("www.uscor.rw", RECEIPT_WIDTH / 2, y, { align: "center" });

  return doc;
}

export function downloadReceiptPDF(sale: ReceiptSale, options?: ReceiptOptions) {
  const doc = generateReceiptPDF(sale, options);
  doc.save(`receipt_${sale.id.substring(0, 8)}.pdf`);
}

export function getReceiptPDFBlob(
  sale: ReceiptSale,
  options?: ReceiptOptions,
): Blob {
  const doc = generateReceiptPDF(sale, options);
  return doc.output("blob");
}
