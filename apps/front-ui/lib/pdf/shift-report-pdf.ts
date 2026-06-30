// lib/pdf/shift-report-pdf.ts
// Client-side shift report PDF generation using jsPDF

import jsPDF from "jspdf";

interface ShiftData {
  id: string;
  startTime: string;
  endTime?: string;
  sales: number;
  transactionCount: number;
  refundTotal?: number;
  status: string;
  worker: {
    fullName?: string;
    role?: string;
  };
}

interface ShiftReportOptions {
  storeName: string;
  date?: string;
  shifts: ShiftData[];
}

const ORANGE = [249, 115, 22] as const;
const DARK = [31, 41, 55] as const;
const GRAY = [107, 114, 128] as const;
const LIGHT_BG = [249, 250, 251] as const;

export function generateShiftReportPDF(options: ShiftReportOptions): jsPDF {
  const { storeName, date, shifts } = options;
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
  doc.text("SHIFT REPORT", margin, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(storeName, margin, 23);
  doc.text(
    date || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pageWidth - margin,
    16,
    { align: "right" },
  );

  y = 40;

  // ──── SUMMARY CARDS ────
  const totalRevenue = shifts.reduce((sum, s) => sum + (s.sales || 0), 0);
  const totalTransactions = shifts.reduce(
    (sum, s) => sum + (s.transactionCount || 0),
    0,
  );
  const totalRefunds = shifts.reduce(
    (sum, s) => sum + (s.refundTotal || 0),
    0,
  );
  const completedShifts = shifts.filter(
    (s) => s.status === "COMPLETED" || s.endTime,
  ).length;
  const activeShifts = shifts.length - completedShifts;

  const totalHours = shifts.reduce((sum, s) => {
    if (!s.startTime) return sum;
    const end = s.endTime ? new Date(s.endTime) : new Date();
    const start = new Date(s.startTime);
    return sum + (end.getTime() - start.getTime()) / 3600000;
  }, 0);

  // Summary boxes
  const boxWidth = contentWidth / 4 - 3;
  const summaryItems = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
    { label: "Transactions", value: `${totalTransactions}` },
    { label: "Total Hours", value: `${totalHours.toFixed(1)}h` },
    { label: "Shifts", value: `${completedShifts} done, ${activeShifts} active` },
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

  // ──── SHIFTS TABLE ────
  doc.setFillColor(...LIGHT_BG);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");

  const cols = [
    { label: "WORKER", x: margin + 2 },
    { label: "ROLE", x: margin + 45 },
    { label: "CLOCK IN", x: margin + 70 },
    { label: "CLOCK OUT", x: margin + 100 },
    { label: "DURATION", x: margin + 130 },
    { label: "REVENUE", x: margin + contentWidth - 2 },
  ];

  cols.forEach((col) => {
    doc.text(
      col.label,
      col.x,
      y + 5,
      col.label === "REVENUE" ? { align: "right" } : undefined,
    );
  });

  y += 10;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);

  shifts.forEach((shift, idx) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }

    // Alternating row bg
    if (idx % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(252, 252, 253);
    }
    doc.rect(margin, y - 3, contentWidth, 8, "F");

    const start = new Date(shift.startTime);
    const end = shift.endTime ? new Date(shift.endTime) : null;
    const durationHrs = end
      ? ((end.getTime() - start.getTime()) / 3600000).toFixed(1)
      : "Active";

    doc.setTextColor(...DARK);
    doc.text(
      (shift.worker?.fullName || "Worker").substring(0, 20),
      margin + 2,
      y,
    );
    doc.setTextColor(...GRAY);
    doc.text(shift.worker?.role || "STAFF", margin + 45, y);
    doc.text(
      start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      margin + 70,
      y,
    );
    doc.text(
      end
        ? end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "—",
      margin + 100,
      y,
    );
    doc.text(typeof durationHrs === "string" ? durationHrs : `${durationHrs}h`, margin + 130, y);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(`$${(shift.sales || 0).toFixed(2)}`, margin + contentWidth - 2, y, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");

    // Separator
    doc.setDrawColor(229, 231, 235);
    y += 3;
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
  });

  if (shifts.length === 0) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(10);
    doc.text("No shift data available", pageWidth / 2, y + 10, {
      align: "center",
    });
  }

  // ──── FOOTER ────
  const footerY = 285;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.text(
    `Generated by USCOR Marketplace — ${new Date().toLocaleString()}`,
    pageWidth / 2,
    footerY,
    { align: "center" },
  );

  return doc;
}

export function downloadShiftReportPDF(options: ShiftReportOptions) {
  const doc = generateShiftReportPDF(options);
  doc.save(
    `shift-report_${options.storeName.replace(/\s+/g, "-").toLowerCase()}_${options.date || new Date().toISOString().split("T")[0]}.pdf`,
  );
}
