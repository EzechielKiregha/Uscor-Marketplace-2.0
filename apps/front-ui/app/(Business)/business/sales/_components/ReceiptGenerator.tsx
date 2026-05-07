"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Download,
  Mail,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { GENERATE_RECEIPT } from "@/graphql/sales.gql";

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
  const [generateReceipt, { loading }] = useMutation(GENERATE_RECEIPT);
  const [isDownloading, setIsDownloading] = useState(false);
  const { showToast } = useToast();

  const handleReceiptGeneration = async () => {
    if (!saleId) return;

    setIsDownloading(true);

    try {
      const { data } = await generateReceipt({
        variables: {
          generateReceiptInput: {
            saleId,
            email: clientEmail, // This might be handled differently based on your mutation input
          },
        },
      });

      const receipt = data.generateReceipt; // This will now have receiptUrl

      if (onReceiptGenerated) {
        onReceiptGenerated(receipt);
      }

      // Use the public URL for download
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = receipt.receiptUrl; // Use the URL from the response
      link.download = `receipt_${saleId.substring(0, 8)}.pdf`; // Suggest a filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("success", "Receipt Generated", "Receipt is downloading");
    } catch (error: any) {
      console.error("Receipt generation error:", error); // Add detailed logging
      showToast(
        "error",
        "Generation Failed",
        error.message || "Failed to generate receipt",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-muted">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Receipt Options
      </h3>

      <div className="space-y-2">
        <Button
          variant="default"
          className="w-full flex items-center gap-2"
          onClick={handleReceiptGeneration}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Receipt
            </>
          )}
        </Button>

        {clientEmail && (
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleReceiptGeneration}
            disabled={isDownloading}
          >
            <Mail className="h-4 w-4" />
            Email Receipt to {clientEmail}
          </Button>
        )}
      </div>

      <div className="mt-4 p-3 bg-background rounded-lg border border-border text-sm">
        <p className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <span>Receipt includes business name and type</span>
        </p>
        <p className="flex items-center gap-2 mt-1">
          <CheckCircle className="h-4 w-4 text-success" />
          <span>Shows loyalty points earned</span>
        </p>
        <p className="flex items-center gap-2 mt-1">
          <XCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Email feature requires SMTP configuration
          </span>
        </p>
      </div>
    </div>
  );
}
