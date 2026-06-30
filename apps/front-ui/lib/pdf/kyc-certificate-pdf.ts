// lib/pdf/kyc-certificate-pdf.ts
// Client-side KYC verification certificate PDF generation using jsPDF

import jsPDF from "jspdf";

interface KycDocumentItem {
  documentType: string;
  status: string;
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

interface KycCertificateData {
  businessName: string;
  businessType: string;
  businessEmail: string;
  businessAddress: string;
  taxId: string;
  registrationNumber: string;
  status: "VERIFIED" | "REJECTED";
  verifiedAt: string;
  rejectionReason?: string;
  documents: KycDocumentItem[];
  certificateId: string;
}

const ORANGE = [249, 115, 22] as const;
const DARK = [31, 41, 55] as const;
const GRAY = [107, 114, 128] as const;
const LIGHT_BG = [249, 250, 251] as const;
const GREEN = [22, 163, 74] as const;
const RED = [220, 38, 38] as const;

function formatDocumentType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateKycCertificatePDF(data: KycCertificateData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const isVerified = data.status === "VERIFIED";

  // ──── HEADER ────
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(
    isVerified ? "KYC VERIFICATION CERTIFICATE" : "KYC VERIFICATION NOTICE",
    margin,
    18,
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("USCOR Marketplace", margin, 26);
  doc.text(
    new Date(data.verifiedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pageWidth - margin,
    18,
    { align: "right" },
  );
  doc.setFontSize(8);
  doc.text(`Certificate ID: ${data.certificateId}`, pageWidth - margin, 26, {
    align: "right",
  });

  y = 45;

  // ──── STATUS BADGE ────
  const badgeColor = isVerified ? GREEN : RED;
  const badgeText = isVerified ? "APPROVED" : "REJECTED";
  const badgeWidth = 40;
  const badgeX = (pageWidth - badgeWidth) / 2;

  doc.setFillColor(...badgeColor);
  doc.roundedRect(badgeX, y, badgeWidth, 10, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(badgeText, pageWidth / 2, y + 7, { align: "center" });

  y += 18;

  // ──── BUSINESS INFORMATION ────
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentWidth, 50, 2, 2, "F");

  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Business Information", margin + 5, y + 8);

  doc.setDrawColor(229, 231, 235);
  doc.line(margin + 5, y + 11, margin + contentWidth - 5, y + 11);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const infoItems = [
    { label: "Business Name", value: data.businessName },
    { label: "Business Type", value: formatDocumentType(data.businessType) },
    { label: "Email", value: data.businessEmail },
    { label: "Address", value: data.businessAddress || "Not provided" },
    { label: "Tax ID", value: data.taxId || "Not provided" },
    {
      label: "Registration Number",
      value: data.registrationNumber || "Not provided",
    },
  ];

  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2 + 5;
  let infoY = y + 17;

  infoItems.forEach((item, idx) => {
    const x = idx % 2 === 0 ? col1X : col2X;
    if (idx % 2 === 0 && idx > 0) infoY += 12;

    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, x, infoY);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(item.value.substring(0, 35), x, infoY + 5);
  });

  y += 58;

  // ──── DOCUMENTS CHECKLIST ────
  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Submitted Documents", margin, y);

  y += 6;

  // Table header
  doc.setFillColor(...LIGHT_BG);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("DOCUMENT TYPE", margin + 3, y + 5);
  doc.text("STATUS", margin + 90, y + 5);
  doc.text("SUBMITTED", margin + 120, y + 5);
  doc.text("NOTES", margin + 148, y + 5);

  y += 10;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  if (data.documents.length === 0) {
    doc.setTextColor(...GRAY);
    doc.text("No documents on record", margin + 3, y + 3);
    y += 10;
  } else {
    data.documents.forEach((docItem, idx) => {
      if (y > 260) {
        doc.addPage();
        y = margin;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y - 3, contentWidth, 8, "F");
      }

      doc.setTextColor(...DARK);
      doc.text(
        formatDocumentType(docItem.documentType).substring(0, 40),
        margin + 3,
        y,
      );

      // Status with color
      const statusColor =
        docItem.status === "VERIFIED"
          ? GREEN
          : docItem.status === "REJECTED"
            ? RED
            : ORANGE;
      doc.setTextColor(...statusColor);
      doc.setFont("helvetica", "bold");
      doc.text(docItem.status, margin + 90, y);
      doc.setFont("helvetica", "normal");

      doc.setTextColor(...GRAY);
      doc.text(
        new Date(docItem.submittedAt).toLocaleDateString(),
        margin + 120,
        y,
      );

      if (docItem.rejectionReason) {
        doc.setTextColor(...RED);
        doc.text(docItem.rejectionReason.substring(0, 20), margin + 148, y);
      } else if (docItem.verifiedAt) {
        doc.setTextColor(...GREEN);
        doc.text("OK", margin + 148, y);
      }

      doc.setDrawColor(229, 231, 235);
      y += 3;
      doc.line(margin, y, margin + contentWidth, y);
      y += 5;
    });
  }

  y += 5;

  // ──── VERDICT ────
  const verdictColor = isVerified ? GREEN : RED;
  const verdictBg: [number, number, number] = isVerified
    ? [240, 253, 244]
    : [254, 242, 242];

  doc.setFillColor(...verdictBg);
  const verdictHeight = data.rejectionReason ? 30 : 20;
  doc.roundedRect(margin, y, contentWidth, verdictHeight, 2, 2, "F");

  doc.setTextColor(...verdictColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    isVerified
      ? "This business has been successfully verified by USCOR."
      : "This KYC submission has been rejected.",
    margin + 5,
    y + 8,
  );

  if (isVerified) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Verified on: ${new Date(data.verifiedAt).toLocaleString()}`,
      margin + 5,
      y + 14,
    );
  }

  if (data.rejectionReason) {
    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Reason: ${data.rejectionReason}`, margin + 5, y + 16);

    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.text(
      "Please address the issues above and resubmit your documents for review.",
      margin + 5,
      y + 24,
    );
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
  doc.setFontSize(6);
  doc.text(
    "This document is an official USCOR KYC verification record.",
    pageWidth / 2,
    footerY + 4,
    { align: "center" },
  );

  return doc;
}

export async function uploadKycCertificateToBlob(
  data: KycCertificateData,
): Promise<string> {
  const doc = generateKycCertificatePDF(data);

  // jsPDF → ArrayBuffer
  const pdfBytes = doc.output("arraybuffer");

  const prefix = data.status === "VERIFIED" ? "kyc-certificate" : "kyc-notice";
  const filename = `${prefix}_${data.businessName.replace(/\s+/g, "-").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`;

  const res = await fetch(
    `/api/kyc-certificate/upload?filename=${encodeURIComponent(filename)}`,
    {
      method: "POST",
      body: pdfBytes,
      headers: { "Content-Type": "application/pdf" },
    },
  );

  if (!res.ok) throw new Error("Failed to upload certificate to Blob");

  const { url } = await res.json();
  return url;
}

// Keep the original if you still want local downloads in some flows
export function downloadKycCertificatePDF(data: KycCertificateData) {
  const doc = generateKycCertificatePDF(data);
  const prefix = data.status === "VERIFIED" ? "kyc-certificate" : "kyc-notice";
  doc.save(
    `${prefix}_${data.businessName.replace(/\s+/g, "-").toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`,
  );
}
