// lib/pdf/invoice-pdf.ts
// Client-side A4 invoice PDF generation using jsPDF

import jsPDF from "jspdf";

interface InvoiceProduct {
  quantity: number;
  price: number;
  product: {
    title: string;
    price: number;
  };
}

interface InvoiceOrder {
  id: string;
  createdAt: string;
  totalAmount?: number;
  status?: string;
  products?: InvoiceProduct[];
  client?: {
    fullName?: string;
    email?: string;
    address?: string;
    phone?: string;
  };
  business?: {
    name: string;
    email?: string;
    address?: string;
    phone?: string;
    businessType?: string;
  };
  payment?: {
    amount: number;
    method?: string;
    status?: string;
  };
}

interface InvoiceOptions {
  showTax?: boolean;
  taxRate?: number;
  notes?: string;
  dueDate?: string;
}

const ORANGE = [249, 115, 22] as const; // #f97316
const DARK = [31, 41, 55] as const;
const GRAY = [107, 114, 128] as const;
const LIGHT_GRAY = [229, 231, 235] as const;

export function generateInvoicePDF(
  order: InvoiceOrder,
  options: InvoiceOptions = {},
): jsPDF {
  const { showTax = true, taxRate = 0.18, notes, dueDate } = options;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ──── ORANGE HEADER BAR ────
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`#${order.id.substring(0, 8).toUpperCase()}`, margin, 26);

  doc.setFontSize(10);
  doc.text(
    new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pageWidth - margin,
    18,
    { align: "right" },
  );

  if (dueDate) {
    doc.text(`Due: ${dueDate}`, pageWidth - margin, 26, { align: "right" });
  }

  y = 48;

  // ──── BUSINESS & CUSTOMER INFO ────
  const colWidth = contentWidth / 2;

  // Business (From)
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FROM", margin, y);
  y += 5;

  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(order.business?.name || "USCOR Business", margin, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (order.business?.address) {
    doc.text(order.business.address, margin, y);
    y += 4;
  }
  if (order.business?.email) {
    doc.text(order.business.email, margin, y);
    y += 4;
  }
  if (order.business?.phone) {
    doc.text(order.business.phone, margin, y);
    y += 4;
  }

  // Customer (Bill To) — right column
  let yRight = 48;
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", margin + colWidth, yRight);
  yRight += 5;

  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    order.client?.fullName || "Customer",
    margin + colWidth,
    yRight,
  );
  yRight += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (order.client?.email) {
    doc.text(order.client.email, margin + colWidth, yRight);
    yRight += 4;
  }
  if (order.client?.address) {
    doc.text(order.client.address, margin + colWidth, yRight);
    yRight += 4;
  }
  if (order.client?.phone) {
    doc.text(order.client.phone, margin + colWidth, yRight);
    yRight += 4;
  }

  y = Math.max(y, yRight) + 10;

  // ──── ITEMS TABLE ────
  // Table header
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, y - 1, contentWidth, 8, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text("ITEM", margin + 2, y + 4);
  doc.text("QTY", margin + contentWidth * 0.55, y + 4);
  doc.text("PRICE", margin + contentWidth * 0.7, y + 4);
  doc.text("TOTAL", margin + contentWidth - 2, y + 4, { align: "right" });
  y += 10;

  // Table rows
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const products = order.products || [];
  let subtotal = 0;

  products.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;

    const title =
      item.product.title.length > 40
        ? item.product.title.substring(0, 40) + "..."
        : item.product.title;

    doc.text(title, margin + 2, y);
    doc.text(`${item.quantity}`, margin + contentWidth * 0.55, y);
    doc.text(`$${item.price.toFixed(2)}`, margin + contentWidth * 0.7, y);
    doc.text(`$${lineTotal.toFixed(2)}`, margin + contentWidth - 2, y, {
      align: "right",
    });

    // Row separator
    y += 2;
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
  });

  // If no products but we have a total amount
  if (products.length === 0 && order.totalAmount) {
    subtotal = order.totalAmount;
  }

  y += 5;

  // ──── TOTALS (right-aligned) ────
  const totalsX = margin + contentWidth * 0.6;
  const totalsEndX = margin + contentWidth - 2;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text("Subtotal", totalsX, y);
  doc.setTextColor(...DARK);
  doc.text(`$${subtotal.toFixed(2)}`, totalsEndX, y, { align: "right" });
  y += 5;

  if (showTax) {
    const tax = subtotal * taxRate;
    doc.setTextColor(...GRAY);
    doc.text(`Tax (${(taxRate * 100).toFixed(0)}%)`, totalsX, y);
    doc.setTextColor(...DARK);
    doc.text(`$${tax.toFixed(2)}`, totalsEndX, y, { align: "right" });
    y += 5;

    // Grand total
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.5);
    doc.line(totalsX, y, totalsEndX + 2, y);
    y += 6;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ORANGE);
    doc.text("TOTAL", totalsX, y);
    doc.text(`$${(subtotal + tax).toFixed(2)}`, totalsEndX, y, {
      align: "right",
    });
  } else {
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.5);
    doc.line(totalsX, y, totalsEndX + 2, y);
    y += 6;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ORANGE);
    doc.text("TOTAL", totalsX, y);
    doc.text(`$${subtotal.toFixed(2)}`, totalsEndX, y, { align: "right" });
  }

  y += 10;

  // ──── PAYMENT STATUS ────
  if (order.payment) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Status:", margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      order.payment.status === "COMPLETED" ? 22 : 234,
      order.payment.status === "COMPLETED" ? 163 : 179,
      order.payment.status === "COMPLETED" ? 74 : 8,
    );
    doc.text(order.payment.status || "PENDING", margin + 30, y);
    y += 5;

    if (order.payment.method) {
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "normal");
      doc.text("Payment Method:", margin, y);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "bold");
      doc.text(order.payment.method, margin + 30, y);
    }
    y += 10;
  }

  // ──── NOTES ────
  if (notes) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("NOTES", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    const splitNotes = doc.splitTextToSize(notes, contentWidth);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 4 + 5;
  }

  // ──── FOOTER ────
  const footerY = 280;
  doc.setDrawColor(...LIGHT_GRAY);
  doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Generated by USCOR Marketplace", RECEIPT_WIDTH / 2, footerY, {
    align: "center",
  });
  doc.text("www.uscor.rw", pageWidth / 2, footerY + 4, { align: "center" });

  return doc;
}

export function downloadInvoicePDF(
  order: InvoiceOrder,
  options?: InvoiceOptions,
) {
  const doc = generateInvoicePDF(order, options);
  doc.save(`invoice_${order.id.substring(0, 8)}.pdf`);
}
