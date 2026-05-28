"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { VERIFY_KYC, REJECT_KYC } from "@/graphql/admin.gql";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  X,
  CheckCircle,
  AlertTriangle,
  Download,
  MapPin,
  Building2,
  User,
  CreditCard,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/toast-provider";

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

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyKyc({
        variables: { businessId: kyc.businessId },
      });
      showToast("success", "Success", "KYC verified successfully");
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
      await rejectKyc({
        variables: {
          businessId: kyc.businessId,
          rejectionReason: rejectionReason,
        },
      });
      showToast("success", "Success", "KYC rejected successfully");
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
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
                    <img
                      src={kyc.business.avatar}
                      alt={kyc.business.name}
                      className="w-12 h-12 rounded-full object-cover"
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

              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Submitted Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">Registration Certificate</span>
                    </div>
                    <a
                      href={kyc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      View
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2 border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">Tax ID Document</span>
                    </div>
                    <a
                      href={kyc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      View
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2 border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">Proof of Address</span>
                    </div>
                    <a
                      href={kyc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      View
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="lg:col-span-2">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted border-b border-border">
                  <h3 className="font-semibold">Document Preview</h3>
                </div>

                <div className="p-4">
                  <div className="bg-muted rounded-lg p-8 flex items-center justify-center h-[400px]">
                    {kyc.documentUrl ? (
                      <iframe
                        src={kyc.documentUrl}
                        className="w-full h-full border-0 rounded"
                        title="KYC Document Preview"
                      />
                    ) : (
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Document preview not available
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          The document may not be in a viewable format
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Actions */}
              <div className="mt-6 border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Verification Actions</h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="default"
                    className="bg-success hover:bg-success/90 text-success-foreground flex-1"
                    onClick={handleVerify}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
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
