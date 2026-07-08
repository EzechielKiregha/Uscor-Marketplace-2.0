"use client";

import { useMutation, useQuery } from "@apollo/client";
import {
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Mail,
  Printer,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { GENERATE_RECEIPT, GET_SALE_BY_ID } from "@/graphql/sales.gql";
import { downloadReceiptPDF } from "@/lib/pdf/receipt-pdf";

interface ReceiptGeneratorProps {
  saleId: string;
  clientEmail?: string;
  onReceiptGenerated?: (receipt: any) => void;
}

export default function ReceiptGenerator({
  saleId,
  clientEmail,
  onReceiptGenerated,
}: ReceiptGeneratorProps) {
  const [generateReceipt, { loading: serverLoading }] =
    useMutation(GENERATE_RECEIPT);
  const [isDownloading, setIsDownloading] = useState(false);
  const { showToast } = useToast();

  // Fetch full sale data for client-side PDF
  const { data: saleData } = useQuery(GET_SALE_BY_ID, {
    variables: { id: saleId },
    skip: !saleId,
  });

  /**
   * Client-side PDF generation (preferred — works on all deployments)
   */
  const handleClientSidePDF = () => {
    const sale = saleData?.sale;
    if (!sale) {
      showToast("error", "Error", "Sale data not loaded yet. Please try again.");
      return;
    }

    try {
      downloadReceiptPDF(sale, { showTax: true, taxRate: 0.18 });
      showToast("success", "Receipt Downloaded", "PDF generated locally");
    } catch (error: any) {
      console.error("Client-side PDF error:", error);
      showToast(
        "error",
        "Generation Failed",
        "Could not generate PDF. Try server-side generation.",
      );
    }
  };

  /**
   * Print receipt directly via browser print dialog
   */
  const handlePrint = () => {
    const sale = saleData?.sale;
    if (!sale) {
      showToast("error", "Error", "Sale data not loaded yet.");
      return;
    }

    try {
      // Import dynamically to get the jsPDF doc
      import("@/lib/pdf/receipt-pdf").then(({ generateReceiptPDF }) => {
        const doc = generateReceiptPDF(sale, { showTax: true, taxRate: 0.18 });
        const pdfBlob = doc.output("bloburl");
        const printWindow = window.open(pdfBlob as unknown as string);
        if (printWindow) {
          printWindow.addEventListener("load", () => {
            printWindow.print();
          });
        }
      });
    } catch (error: any) {
      console.error("Print error:", error);
      showToast("error", "Print Failed", "Could not open print dialog.");
    }
  };

  /**
   * Server-side generation (fallback — uses backend Puppeteer + Vercel Blob)
   */
  const handleServerSideReceipt = async () => {
    if (!saleId) return;

    setIsDownloading(true);

    try {
      const { data } = await generateReceipt({
        variables: {
          generateReceiptInput: {
            saleId,
            email: clientEmail,
          },
        },
      });

      const receipt = data.generateReceipt;

      if (onReceiptGenerated) {
        onReceiptGenerated(receipt);
      }

      const link = document.createElement("a");
      link.href = receipt.receiptUrl;
      link.download = `receipt_${saleId.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("success", "Receipt Generated", "Receipt is downloading");
    } catch (error: any) {
      console.error("Receipt generation error:", error);
      showToast(
        "error",
        "Server Error",
        "Server-side generation failed. Use the local PDF option instead.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const saleLoaded = !!saleData?.sale;

  return (
    <div className="border border-border rounded-lg p-4 bg-muted">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Receipt Options
      </h3>

      <div className="space-y-2">
        {/* Primary: Client-side PDF (fast, works everywhere) */}
        <Button
          variant="default"
          className="w-full flex items-center gap-2"
          onClick={handleClientSidePDF}
          disabled={!saleLoaded}
        >
          <Download className="h-4 w-4" />
          Download Receipt (PDF)
        </Button>

        {/* Print directly */}
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handlePrint}
          disabled={!saleLoaded}
        >
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>

        {/* Fallback: Server-side (for email + cloud storage) */}
        {clientEmail && (
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleServerSideReceipt}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Email Receipt to {clientEmail}
              </>
            )}
          </Button>
        )}
      </div>

      <div className="mt-4 p-3 bg-background rounded-lg border border-border text-sm">
        <p className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <span>Client-side PDF — works offline, no server needed</span>
        </p>
        <p className="flex items-center gap-2 mt-1">
          <CheckCircle className="h-4 w-4 text-success" />
          <span>Includes business name, type, and loyalty points</span>
        </p>
        <p className="flex items-center gap-2 mt-1">
          <CheckCircle className="h-4 w-4 text-success" />
          <span>Thermal receipt format (80mm) + print support</span>
        </p>
        <p className="flex items-center gap-2 mt-1">
          <XCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Email feature requires server-side SMTP
          </span>
        </p>
      </div>
    </div>
  );
}
