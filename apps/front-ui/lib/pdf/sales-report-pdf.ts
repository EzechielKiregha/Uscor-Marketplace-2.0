// lib/pdf/sales-report-pdf.ts
// Client-side sales report PDF generation using jsPDF

import jsPDF from "jspdf";

interface SaleRecord {
  id: string;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  worker?: { fullName?: string };
  client?: { fullName?: string };
  saleProducts?: { quantity: number; price: number; product: { title: string } }[];
}

interface PaymentBreakdown {
  method: string;
  count: number;
  amount: number;
}

interface TopProduct {
  title: string;
  quantitySold: number;
  revenue?: number;
}

interface SalesReportOptions {
  storeName: string;
  period: string;
  sales: SaleRecord[];
  paymentBreakdown?: PaymentBreakdown[];
  topProducts?: TopProduct[];
}

const ORANGE = [249, 115, 22] as const;
const DARK = [31, 41, 55] as const;
const GRAY = [107, 114, 128] as const;
const GREEN = [34, 197, 94] as const;
const LIGHT_BG = [249, 250, 251] as const;

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile Money",
  CARD: "Card",
  TOKEN: "USCOR Token",
  BANK_TRANSFER: "Bank Transfer",
};

export function generateSalesReportPDF(options: SalesReportOptions): jsPDF {
  const { storeName, period, sales, paymentBreakdown, topProducts } = options;

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
  doc.text("SALES REPORT", margin, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(storeName, margin, 23);
  doc.text(`Period: ${period}`, pageWidth - margin, 16, { align: "right" });
  doc.text(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pageWidth - margin,
    23,
    { align: "right" },
  );

  y = 40;

  // ──── SUMMARY ────
  const completedSales = sales.filter((s) => s.status === "COMPLETED");
  const totalRevenue = completedSales.reduce(
    (sum, s) => sum + s.totalAmount,
    0,
  );
  const totalDiscount = completedSales.reduce(
    (sum, s) => sum + (s.discount || 0),
    0,
  );
  const refundedSales = sales.filter((s) => s.status === "REFUNDED");
  const refundTotal = refundedSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const avgTicket =
    completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  const boxWidth = contentWidth / 4 - 3;
  const summaryItems = [
    { label: "Gross Revenue", value: `$${totalRevenue.toFixed(2)}` },
    { label: "Net Revenue", value: `$${(totalRevenue - refundTotal).toFixed(2)}` },
    { label: "Transactions", value: `${completedSales.length}` },
    { label: "Avg. Ticket", value: `$${avgTicket.toFixed(2)}` },
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

  // ──── PAYMENT BREAKDOWN ────
  const pmData: PaymentBreakdown[] =
    paymentBreakdown ||
    (() => {
      const map: Record<string, PaymentBreakdown> = {};
      completedSales.forEach((s) => {
        const m = s.paymentMethod || "UNKNOWN";
        if (!map[m]) map[m] = { method: m, count: 0, amount: 0 };
        map[m].count += 1;
        map[m].amount += s.totalAmount;
      });
      return Object.values(map).sort((a, b) => b.amount - a.amount);
    })();

  if (pmData.length > 0) {
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Method Breakdown", margin, y);
    y += 6;

    doc.setFillColor(...LIGHT_BG);
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("METHOD", margin + 2, y + 5);
    doc.text("TRANSACTIONS", margin + 70, y + 5);
    doc.text("AMOUNT", margin + 110, y + 5);
    doc.text("% SHARE", margin + contentWidth - 2, y + 5, { align: "right" });
    y += 9;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    pmData.forEach((pm) => {
      const pct = totalRevenue > 0 ? ((pm.amount / totalRevenue) * 100).toFixed(1) : "0";
      doc.setTextColor(...DARK);
      doc.text(PAYMENT_LABELS[pm.method] || pm.method, margin + 2, y);
      doc.setTextColor(...GRAY);
      doc.text(`${pm.count}`, margin + 70, y);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "bold");
      doc.text(`$${pm.amount.toFixed(2)}`, margin + 110, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${pct}%`, margin + contentWidth - 2, y, { align: "right" });
      y += 5;
    });
    y += 5;
  }

  // ──── TOP PRODUCTS ────
  const tpData: TopProduct[] =
    topProducts ||
    (() => {
      const map: Record<string, TopProduct & { revenue: number }> = {};
      completedSales.forEach((s) => {
        s.saleProducts?.forEach((sp) => {
          const t = sp.product.title;
          if (!map[t])
            map[t] = { title: t, quantitySold: 0, revenue: 0 };
          map[t].quantitySold += sp.quantity;
          map[t].revenue += sp.price * sp.quantity;
        });
      });
      return Object.values(map)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    })();

  if (tpData.length > 0) {
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Top Products", margin, y);
    y += 6;

    doc.setFillColor(...LIGHT_BG);
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("#", margin + 2, y + 5);
    doc.text("PRODUCT", margin + 10, y + 5);
    doc.text("QTY SOLD", margin + contentWidth - 2, y + 5, { align: "right" });
    y += 9;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    tpData.forEach((tp, idx) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.setTextColor(...ORANGE);
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}`, margin + 2, y);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.text(
        tp.title.length > 50 ? tp.title.substring(0, 50) + "..." : tp.title,
        margin + 10,
        y,
      );
      doc.text(`${tp.quantitySold}`, margin + contentWidth - 2, y, {
        align: "right",
      });
      y += 5;
    });
    y += 5;
  }

  // ──── SALES LIST ────
  if (y > 230) {
    doc.addPage();
    y = margin;
  }

  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`All Transactions (${completedSales.length})`, margin, y);
  y += 6;

  doc.setFillColor(...LIGHT_BG);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("ID", margin + 2, y + 5);
  doc.text("DATE", margin + 25, y + 5);
  doc.text("CASHIER", margin + 60, y + 5);
  doc.text("PAYMENT", margin + 100, y + 5);
  doc.text("AMOUNT", margin + contentWidth - 2, y + 5, { align: "right" });
  y += 9;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  completedSales.slice(0, 50).forEach((sale, idx) => {
    if (y > 275) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(...GRAY);
    doc.text(sale.id.substring(0, 8), margin + 2, y);
    doc.text(
      new Date(sale.createdAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      margin + 25,
      y,
    );
    doc.setTextColor(...DARK);
    doc.text(
      (sale.worker?.fullName || "—").substring(0, 18),
      margin + 60,
      y,
    );
    doc.setTextColor(...GRAY);
    doc.text(
      PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod,
      margin + 100,
      y,
    );
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(`$${sale.totalAmount.toFixed(2)}`, margin + contentWidth - 2, y, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    y += 4.5;
  });

  if (completedSales.length > 50) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.text(
      `... and ${completedSales.length - 50} more transactions`,
      pageWidth / 2,
      y + 3,
      { align: "center" },
    );
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

export function downloadSalesReportPDF(options: SalesReportOptions) {
  const doc = generateSalesReportPDF(options);
  doc.save(
    `sales-report_${options.storeName.replace(/\s+/g, "-").toLowerCase()}_${options.period}.pdf`,
  );
}
