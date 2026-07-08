"use client";

import { useMutation } from "@apollo/client";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { REJECT_KYC, UPDATE_KYC, VERIFY_KYC } from "@/graphql/kyc.gql";
import {
  downloadKycCertificatePDF,
  uploadKycCertificateToBlob,
} from "@/lib/pdf/kyc-certificate-pdf";

interface KycVerificationModalProps {
  kyc: any;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  onRejected: () => void;
}

export default function KycVerificationModal({
  kyc,
  isOpen,
  onClose,
  onVerified,
  onRejected,
}: KycVerificationModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const { showToast } = useToast();

  const [verifyKyc] = useMutation(VERIFY_KYC);
  const [rejectKyc] = useMutation(REJECT_KYC);
  const [updateKyc] = useMutation(UPDATE_KYC);

  // Normalize docs list
  const docs: {
    id: string;
    documentType: string;
    documentUrl: string;
    status?: string;
    rejectionReason?: string;
  }[] =
    kyc?.business?.kycDocuments?.length > 0
      ? kyc.business.kycDocuments
      : kyc?.documentUrl
        ? [
            {
              id: "default",
              documentType: "KYC Document",
              documentUrl: kyc.documentUrl,
            },
          ]
        : [];

  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(
    docs[0]?.documentUrl ?? null,
  );
  const [activeDocType, setActiveDocType] = useState<string>(
    docs[0]?.documentType ?? "",
  );

  const handleVerify = async () => {
    setVerifying(true);
    try {
      downloadKycCertificatePDF({
        businessName: kyc.business.name,
        businessType: kyc.business.businessType,
        businessEmail: kyc.business.email,
        businessAddress: kyc.business.address || "",
        taxId: kyc.business.taxId || "",
        registrationNumber: kyc.business.registrationNumber || "",
        status: "VERIFIED",
        verifiedAt: new Date().toISOString(),
        documents:
          kyc.business.kycDocuments?.map((doc: any) => ({
            documentType: doc.documentType,
            status: "VERIFIED",
            submittedAt: doc.submittedAt,
            verifiedAt: new Date().toISOString(),
          })) || [],
        certificateId: kyc.id,
      });

      const blobUrl = await uploadKycCertificateToBlob({
        businessName: kyc.business.name,
        businessType: kyc.business.businessType,
        businessEmail: kyc.business.email,
        businessAddress: kyc.business.address || "",
        taxId: kyc.business.taxId || "",
        registrationNumber: kyc.business.registrationNumber || "",
        status: "VERIFIED",
        verifiedAt: new Date().toISOString(),
        documents:
          kyc.business.kycDocuments?.map((doc: any) => ({
            documentType: doc.documentType,
            status: "VERIFIED",
            submittedAt: doc.submittedAt,
            verifiedAt: new Date().toISOString(),
          })) || [],
        certificateId: kyc.id,
      });

      console.log("Certificate stored at:", blobUrl);
      await verifyKyc({
        variables: {
          input: {
            businessId: kyc.businessId,
            notes: "KYC verified by admin",
            documentUrl: blobUrl,
          },
        },
      });
      //   await updateKyc({
      //     variables: {
      //       input: {
      //         businessId: kyc.bussinessId,
      //         documentUrl: blobUrl,
      //       },
      //     },
      //   });

      showToast(
        "success",
        "Success",
        "KYC verified successfully. Certificate saved.",
      );
      onVerified();
    } catch (error: any) {
      showToast(
        "error",
        "Verification Failed",
        error.message || "Failed to verify KYC",
      );
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast(
        "error",
        "Rejection Reason Required",
        "Please provide a reason for rejection",
      );
      return;
    }

    setRejecting(true);
    try {
      downloadKycCertificatePDF({
        businessName: kyc.business.name,
        businessType: kyc.business.businessType,
        businessEmail: kyc.business.email,
        businessAddress: kyc.business.address || "",
        taxId: kyc.business.taxId || "",
        registrationNumber: kyc.business.registrationNumber || "",
        status: "REJECTED",
        verifiedAt: new Date().toISOString(),
        rejectionReason: rejectionReason,
        documents:
          kyc.business.kycDocuments?.map((doc: any) => ({
            documentType: doc.documentType,
            status: doc.status,
            submittedAt: doc.submittedAt,
            rejectionReason: doc.rejectionReason,
          })) || [],
        certificateId: kyc.id,
      });

      const blobUrl = await uploadKycCertificateToBlob({
        businessName: kyc.business.name,
        businessType: kyc.business.businessType,
        businessEmail: kyc.business.email,
        businessAddress: kyc.business.address || "",
        taxId: kyc.business.taxId || "",
        registrationNumber: kyc.business.registrationNumber || "",
        status: "REJECTED",
        verifiedAt: new Date().toISOString(),
        rejectionReason: rejectionReason,
        documents:
          kyc.business.kycDocuments?.map((doc: any) => ({
            documentType: doc.documentType,
            status: doc.status,
            submittedAt: doc.submittedAt,
            rejectionReason: doc.rejectionReason,
          })) || [],
        certificateId: kyc.id,
      });

      console.log("Certificate stored at:", blobUrl);

      await rejectKyc({
        variables: {
          input: {
            businessId: kyc.businessId,
            rejectionReason: rejectionReason,
            documentUrl: blobUrl,
          },
        },
      });

      showToast("success", "Success", "KYC rejected. Notice downloaded.");
      onRejected();
    } catch (error: any) {
      showToast(
        "error",
        "Rejection Failed",
        error.message || "Failed to reject KYC",
      );
      setRejecting(false);
    }
  };

  if (!isOpen || !kyc) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Near-fullscreen on mobile, large constrained on desktop */}
      <div className="bg-card border border-border rounded-lg w-full h-full sm:h-auto max-w-7xl sm:max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                KYC Verification
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review business documents and verify identity
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Information */}
            <div className="lg:col-span-1 space-y-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {kyc.business.avatar ? (
                    <Image
                      src={kyc.business.avatar}
                      alt={kyc.business.name}
                      className="w-12 h-12 rounded-full object-cover"
                      width={190}
                      height={200}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
                      {kyc.business.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{kyc.business.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {kyc.business.businessType.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{kyc.business.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{kyc.business.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{kyc.business.taxId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {kyc.business.registrationNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submitted Documents — clicking View swaps the iframe */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Submitted Documents</h3>
                <div className="space-y-3">
                  {docs.length > 0 ? (
                    docs.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between p-2 border rounded-lg transition-colors ${
                          activeDocUrl === doc.documentUrl
                            ? "border-primary/60 bg-primary/5"
                            : doc.status === "VERIFIED"
                              ? "border-success/40 bg-success/5"
                              : doc.status === "REJECTED"
                                ? "border-destructive/40 bg-destructive/5"
                                : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm block truncate">
                              {doc.documentType?.replace(/_/g, " ") ||
                                "Document"}
                            </span>
                            {doc.status === "REJECTED" &&
                              doc.rejectionReason && (
                                <span className="text-xs text-destructive block truncate">
                                  {doc.rejectionReason}
                                </span>
                              )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDocUrl(doc.documentUrl);
                            setActiveDocType(doc.documentType);
                          }}
                          className="text-sm text-primary hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
                        >
                          <FileText className="h-3 w-3" />
                          View
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No documents submitted.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="border border-border rounded-lg overflow-hidden flex flex-col">
                {/* Preview header — "Open in new tab" hidden on lg since iframe is large enough */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border">
                  <h3 className="font-semibold text-sm truncate">
                    {activeDocType
                      ? activeDocType.replace(/_/g, " ")
                      : "Document Preview"}
                  </h3>
                  {activeDocUrl && (
                    <a
                      href={activeDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0 ml-3 lg:hidden"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open in new tab
                    </a>
                  )}
                </div>

                {activeDocUrl ? (
                  <iframe
                    key={activeDocUrl}
                    src={activeDocUrl}
                    className="w-full border-0"
                    style={{ height: "clamp(480px, 65vh, 800px)" }}
                    title="KYC Document Preview"
                  />
                ) : (
                  <div
                    className="flex items-center justify-center bg-muted"
                    style={{ height: "clamp(480px, 65vh, 800px)" }}
                  >
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Document preview not available
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        The document may not be in a viewable format
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Actions */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Verification Actions</h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="bg-success hover:bg-success/90 text-success-foreground border border-emerald-500 flex-1"
                    onClick={handleVerify}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin text-emerald-500" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                        Approve KYC
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="text-destructive border-destructive flex-1"
                    onClick={() => setRejecting(true)}
                    disabled={verifying}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject KYC
                  </Button>
                </div>

                {rejecting && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium">Rejection Reason</h4>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          Please provide a specific reason for rejecting this
                          KYC submission
                        </p>

                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g., Document is blurry, tax ID doesn't match business name, etc."
                          rows={3}
                          className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="default"
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={handleReject}
                            disabled={!rejectionReason.trim()}
                          >
                            Confirm Rejection
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setRejecting(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
