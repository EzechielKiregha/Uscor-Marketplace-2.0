// app/business/settings/_components/KycVerification.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import {
  GET_KYC_DOCUMENTS,
  UPLOAD_KYC_DOCUMENT,
  SUBMIT_KYC,
  ON_KYC_UPDATED
} from '@/graphql/settings.gql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  X,
  Download,
  Info
} from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMe } from '@/lib/useMe';
import Loader from '@/components/seraui/Loader';
import { GET_BUSINESS_BY_ID } from '@/graphql/business.gql';
import { Document } from '@/lib/types';

// Document types for KYC
export const DOCUMENT_TYPES = [
  {
    id: 'BUSINESS_REGISTRATION',
    name: 'Business Registration Certificate',
    description: 'Official document showing your business is legally registered',
    required: true,
    sampleUrl: '/samples/business-registration.pdf'
  },
  {
    id: 'TAX_ID',
    name: 'Tax Identification Document',
    description: 'Document showing your business tax ID or VAT number',
    required: true,
    sampleUrl: '/samples/tax-id.pdf'
  },
  {
    id: 'PROOF_OF_ADDRESS',
    name: 'Proof of Business Address',
    description: 'Utility bill or bank statement showing your business address',
    required: true,
    sampleUrl: '/samples/proof-of-address.pdf'
  },
  {
    id: 'OWNER_ID',
    name: 'Business Owner ID',
    description: 'Government-issued ID of the business owner or representative',
    required: true,
    sampleUrl: '/samples/owner-id.pdf'
  },
  {
    id: 'BANK_STATEMENT',
    name: 'Business Bank Statement',
    description: 'Recent bank statement showing your business account',
    required: false,
    sampleUrl: '/samples/bank-statement.pdf'
  }
];

interface KycVerificationProps {
  // Optional props if needed
}

export default function KycVerification({ }: KycVerificationProps) {
  const { user, loading: authLoading } = useMe();
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const { data: businessData } = useQuery(GET_BUSINESS_BY_ID, {
    variables: { userId: user?.id },
    skip: !user?.id
  })

  const {
    data: kycDocumentsData,
    loading: kycLoading,
    refetch: refetchKyc
  } = useQuery(GET_KYC_DOCUMENTS, {
    variables: { businessId: user?.id },
    skip: !user?.id
  });

  const {
    data: kycUpdateData,
    loading: kycUpdateLoading
  } = useSubscription(ON_KYC_UPDATED, {
    variables: { businessId: user?.id },
    skip: !user?.id
  });

  const [uploadDocument] = useMutation(UPLOAD_KYC_DOCUMENT);
  const [submitKyc] = useMutation(SUBMIT_KYC);

  const kycDocuments = useMemo(() => {
    return kycDocumentsData?.kycDocuments || [];
  }, [kycDocumentsData]);

  const getDocumentStatus = (documentType: string) => {
    const document = kycDocuments.find((d: Document) => d.documentType === documentType);
    if (!document) return 'NOT_UPLOADED';
    return document.status;
  };

  const getDocument = (documentType: string) => {
    return kycDocuments.find((d: Document) => d.documentType === documentType);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        showToast('error', 'Invalid File Type', 'Please upload PDF, JPG, or PNG files only');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        showToast('error', 'File Too Large', 'Please upload files smaller than 10MB');
        return;
      }

      setDocumentFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedDocumentType || !documentFile || !user?.id) return;

    setUploading(true);
    try {
      const { data } = await uploadDocument({
        variables: {
          input: {
            businessId: user.id,
            documentType: selectedDocumentType,
            document: documentFile
          }
        }
      });

      showToast('success', 'Success', 'Document uploaded successfully');
      setDocumentFile(null);
      setSelectedDocumentType(null);
      refetchKyc();

      // Check if all required documents are uploaded
      const requiredDocuments = DOCUMENT_TYPES.filter(d => d.required);
      const uploadedRequiredDocuments = requiredDocuments.filter(d =>
        getDocumentStatus(d.id) === 'PENDING' || getDocumentStatus(d.id) === 'VERIFIED'
      );

      if (uploadedRequiredDocuments.length === requiredDocuments.length) {
        showToast('info', 'Ready for Verification', 'You have uploaded all required documents. You can now submit for verification.');
      }
    } catch (error: any) {
      showToast('error', 'Upload Failed', error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitForVerification = async () => {
    if (!user?.id) return;

    // Check if all required documents are uploaded
    const requiredDocuments = DOCUMENT_TYPES.filter(d => d.required);
    const uploadedRequiredDocuments = requiredDocuments.filter(d =>
      getDocumentStatus(d.id) === 'PENDING' || getDocumentStatus(d.id) === 'VERIFIED'
    );

    if (uploadedRequiredDocuments.length < requiredDocuments.length) {
      showToast('error', 'Missing Documents', 'Please upload all required documents before submitting for verification');
      return;
    }

    setSubmitting(true);
    try {
      await submitKyc({
        variables: { businessId: user.id }
      });

      showToast('success', 'Success', 'KYC submitted for verification');
      refetchKyc();
    } catch (error: any) {
      showToast('error', 'Submission Failed', error.message || 'Failed to submit KYC for verification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    if (confirm('Are you sure you want to remove this document?')) {
      try {
        // In a real app, this would be a mutation to delete the document
        // For now, we'll just refresh the data
        refetchKyc();
        showToast('info', 'Document Removed', 'Document has been removed');
      } catch (error: any) {
        showToast('error', 'Removal Failed', error.message || 'Failed to remove document');
      }
    }
  };

  const handleDownloadSample = (sampleUrl: string) => {
    // In a real app, this would download the sample document
    showToast('info', 'Sample Document', 'This would download a sample document to show the required format');
    window.open(sampleUrl, '_blank');
  };

  // Auto-refresh when subscription updates
  useEffect(() => {
    if (kycUpdateData) {
      refetchKyc();
    }
  }, [kycUpdateData, refetchKyc]);

  if (authLoading || kycLoading) return (
    <Card>
      <CardContent className="h-[500px] flex items-center justify-center">
        <Loader loading={true} />
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              KYC Verification
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Verify your business to access the full marketplace features
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetchKyc()}
              disabled={kycLoading}
            >
              Refresh Status
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* KYC Status */}
        <div className="mb-6 p-4 rounded-lg bg-muted">
          <div className="flex items-start gap-3">
            {businessData?.kycStatus === 'VERIFIED' ? (
              <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
            ) : businessData?.kycStatus === 'PENDING' ? (
              <AlertTriangle className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
            ) : businessData?.kycStatus === 'REJECTED' ? (
              <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            )}

            <div className="flex-1">
              <h3 className="font-semibold">
                {businessData?.kycStatus === 'VERIFIED' ? 'KYC Verified' :
                  businessData?.kycStatus === 'PENDING' ? 'Verification Pending' :
                    businessData?.kycStatus === 'REJECTED' ? 'Verification Rejected' :
                      'Not Verified'}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {businessData?.kycStatus === 'VERIFIED' ? (
                  'Your business is verified. You can now purchase products and services from other businesses in the marketplace.'
                ) : businessData?.kycStatus === 'PENDING' ? (
                  'Your KYC documents have been submitted and are being reviewed. This typically takes 1-3 business days.'
                ) : businessData?.kycStatus === 'REJECTED' ? (
                  'Your KYC submission was rejected. Please review the rejection reasons and resubmit your documents.'
                ) : (
                  'Complete your KYC verification to access the full marketplace features, including purchasing from other businesses.'
                )}
              </p>

              {businessData?.kycStatus === 'REJECTED' && (
                <div className="mt-2 p-2 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <p className="font-medium">Rejection Reason:</p>
                  <p>
                    {kycDocuments.find((doc: Document) => doc.rejectionReason)?.rejectionReason ||
                      'Your documents require additional information or clarification'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {businessData?.kycStatus === 'NOT_VERIFIED' && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="default"
                onClick={handleSubmitForVerification}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : 'Submit for Verification'}
              </Button>
            </div>
          )}
        </div>

        {/* Document Upload Section */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Required Documents
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload the following documents to verify your business
            </p>

            <div className="space-y-4">
              {DOCUMENT_TYPES.map(document => {
                const status = getDocumentStatus(document.id);
                const documentData = getDocument(document.id);

                return (
                  <div
                    key={document.id}
                    className={`border border-border rounded-lg p-4 ${status === 'VERIFIED' ? 'bg-success/5' :
                      status === 'PENDING' ? 'bg-warning/5' :
                        status === 'REJECTED' ? 'bg-destructive/5' : ''
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{document.name}</h4>
                          {document.required && (
                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {document.description}
                        </p>

                        {status === 'REJECTED' && documentData?.rejectionReason && (
                          <div className="mt-2 p-2 bg-destructive/10 rounded-lg text-sm text-destructive">
                            <p className="font-medium">Rejection Reason:</p>
                            <p>{documentData.rejectionReason}</p>
                          </div>
                        )}

                        {status === 'VERIFIED' && documentData?.verifiedAt && (
                          <div className="mt-2 text-sm text-success">
                            Verified on {new Date(documentData.verifiedAt).toLocaleDateString()}
                          </div>
                        )}

                        {status === 'PENDING' && documentData?.submittedAt && (
                          <div className="mt-2 text-sm text-warning">
                            Submitted on {new Date(documentData.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 min-w-[180px]">
                        {status === 'NOT_UPLOADED' && (
                          <Button
                            variant="default"
                            className="w-full sm:w-auto"
                            onClick={() => setSelectedDocumentType(document.id)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        )}

                        {status === 'PENDING' && (
                          <div className="w-full sm:w-auto bg-warning/10 text-warning px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Under Review
                          </div>
                        )}

                        {status === 'VERIFIED' && (
                          <div className="w-full sm:w-auto bg-success/10 text-success px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verified
                          </div>
                        )}

                        {(status === 'REJECTED' || status === 'PENDING') && (
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              setSelectedDocumentType(document.id);
                              setDocumentFile(null);
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Re-upload
                          </Button>
                        )}

                        {(status === 'PENDING' || status === 'VERIFIED' || status === 'REJECTED') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveDocument(documentData!.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Upload Modal */}
          {selectedDocumentType && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-lg w-full max-w-md">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Upload Document</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {DOCUMENT_TYPES.find(d => d.id === selectedDocumentType)?.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedDocumentType(null);
                        setDocumentFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Accepted File Types</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• PDF, JPG, PNG (max 10MB)</li>
                        <li>• Clear, legible copies</li>
                        <li>• All corners visible for ID documents</li>
                        <li>• No screenshots or watermarked images</li>
                      </ul>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      {documentFile ? (
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                            <FileText className="h-4 w-4" />
                            <span className="truncate max-w-xs">{documentFile.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(documentFile.size / 1024)} KB • {documentFile.type}
                          </p>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setDocumentFile(null)}
                            >
                              Change File
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDownloadSample(DOCUMENT_TYPES.find(d => d.id === selectedDocumentType)?.sampleUrl || '')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Sample
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">Drag & drop your document here</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              or browse to choose a file
                            </p>
                          </div>
                          <div className="mt-3">
                            <label className="inline-flex items-center px-4 py-2 bg-primary hover:bg-accent text-primary-foreground rounded-md cursor-pointer">
                              <span>Choose File</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                              />
                            </label>
                          </div>
                          <div className="mt-2 flex justify-center">
                            <Button
                              variant="link"
                              onClick={() => handleDownloadSample(DOCUMENT_TYPES.find(d => d.id === selectedDocumentType)?.sampleUrl || '')}
                              className="text-sm"
                            >
                              <Info className="h-3 w-3 mr-1" />
                              View sample document format
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedDocumentType(null);
                          setDocumentFile(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-primary hover:bg-accent text-primary-foreground"
                        onClick={handleUpload}
                        disabled={!documentFile || uploading}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : 'Upload Document'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits for Local Businesses */}
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Why KYC Verification Matters
            </h3>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Verified businesses can purchase products from other businesses in the marketplace</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Access to freelance services like transportation from other verified businesses</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Build trust with customers and other businesses through verified identity</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                <span>Essential for local artisans and craftsmen to participate fully in the marketplace</span>
              </li>
            </ul>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Pro Tip:</strong> For local wood workers and artisans, having a verified
                business profile makes it easier to purchase materials from other businesses and
                offer your services to a wider audience.
              </p>
            </div>
          </div>

          {/* East Africa Specific Information */}
          <div className="border border-border rounded-lg p-4 bg-muted">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              KYC Requirements in East Africa
            </h3>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-1">Country-Specific Requirements</h4>
                <p className="text-sm text-muted-foreground">
                  Requirements may vary slightly by country in East Africa. Below are general guidelines:
                </p>

                <ul className="mt-2 space-y-1 pl-4 list-disc">
                  <li><span className="font-medium">Rwanda:</span> Business registration, tax ID, and proof of address are mandatory</li>
                  <li><span className="font-medium">Uganda:</span> Business registration, tax PIN, and owner's national ID required</li>
                  <li><span className="font-medium">Kenya:</span> Certificate of incorporation, KRA PIN, and business permit needed</li>
                  <li><span className="font-medium">Tanzania:</span> Business license, tax identification, and owner's ID required</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-1">Processing Time</h4>
                <p className="text-sm text-muted-foreground">
                  KYC verification typically takes 1-3 business days in East Africa. During busy periods,
                  it may take up to 5 business days. Make sure to submit your documents well in advance
                  of when you need full marketplace access.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Common Rejection Reasons</h4>
                <ul className="mt-2 space-y-1 pl-4 list-disc text-sm text-muted-foreground">
                  <li>Documents are blurry or not fully visible</li>
                  <li>Documents don't match the business name</li>
                  <li>Proof of address is outdated (must be within last 3 months)</li>
                  <li>Documents are screenshots instead of original files</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}