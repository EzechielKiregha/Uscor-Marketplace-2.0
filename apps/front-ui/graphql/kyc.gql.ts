import { gql } from "@apollo/client";

// ======================
// KYC ENTITIES
// ======================

export const KYC_ENTITY = gql`
  fragment KnowYourCustomer on KnowYourCustomerEntity {
    id
    status
    documentUrl
    submittedAt
    verifiedAt
    rejectionReason
    businessId
    clientId
    workerId
    business {
      id
      name
      email
    }
    client {
      id
      fullName
      email
    }
    worker {
      id
      fullName
      email
      business {
        id
        name
      }
    }
  }
`;

export const KYC_DOCUMENT_ENTITY = gql`
  fragment KycDocumentEntity on KycDocument {
    id
    kycId
    documentType
    documentUrl
    status
    verifiedAt
    rejectionReason
    createdAt
    updatedAt
  }
`;

// ======================
// QUERIES
// ======================

export const GET_KYC = gql`
  query GetKyc($id: String!) {
    kyc(id: $id) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const GET_KYC_BY_USER = gql`
  query GetKycByUser($userId: String!, $userType: KycUserType!) {
    kycByUser(userId: $userId, userType: $userType) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const GET_BUSINESS_KYC = gql`
  query GetBusinessKyc($businessId: String!) {
    businessKyc(businessId: $businessId) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const GET_CLIENT_KYC = gql`
  query GetClientKyc($clientId: String!) {
    clientKyc(clientId: $clientId) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const GET_WORKER_KYC = gql`
  query GetWorkerKyc($workerId: String!) {
    workerKyc(workerId: $workerId) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const GET_PENDING_KYC = gql`
  query GetPendingKyc($page: Int = 1, $limit: Int = 20) {
    pendingKyc(page: $page, limit: $limit) {
      items {
        ...KnowYourCustomer
      }
      total
      page
      limit
    }
  }
  ${KYC_ENTITY}
`;

export const GET_KYC_DOCUMENTS = gql`
  query GetKycDocuments($businessId: String!) {
    kycDocuments(businessId: $businessId) {
      id
      businessId
      documentType
      documentUrl
      status
      submittedAt
      verifiedAt
      rejectionReason
      createdAt
      updatedAt
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const SUBMIT_KYC = gql`
  mutation SubmitKyc($businessId: String!) {
    submitKyc(businessId: $businessId) {
      id
      kycStatus
      kyc {
        id
        status
        submittedAt
        verifiedAt
      }
    }
  }
`;

export const UPLOAD_KYC_DOCUMENT = gql`
  mutation UploadKycDocument($input: UploadKycDocumentInput!) {
    uploadKycDocument(input: $input) {
      id
      businessId
      documentType
      documentUrl
      status
      submittedAt
      verifiedAt
      rejectionReason
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_KYC_DOCUMENT = gql`
  mutation UpdateKycDocument($input: UpdateKycDocumentInput!) {
    updateKycDocument(input: $input) {
      ...KycDocumentEntity
    }
  }
  ${KYC_DOCUMENT_ENTITY}
`;
export const UPDATE_KYC = gql`
  mutation UpdateKyc($input: UpdateKycInput!) {
    updateKyc(input: $input) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const VERIFY_KYC = gql`
  mutation VerifyKyc($input: VerifyKycInput!) {
    verifyKyc(input: $input) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const REJECT_KYC = gql`
  mutation RejectKyc($input: RejectKycInput!) {
    rejectKyc(input: $input) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const REQUEST_KYC_REVIEW = gql`
  mutation RequestKycReview($kycId: String!) {
    requestKycReview(kycId: $kycId) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_KYC_SUBMITTED = gql`
  subscription OnKycSubmitted($userId: String!, $userType: KycUserType!) {
    kycSubmitted(userId: $userId, userType: $userType) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const ON_KYC_UPDATED = gql`
  subscription OnKycUpdated($businessId: String!) {
    kycUpdated(businessId: $businessId) {
      id
      kycStatus
      kyc {
        id
        status
        documentUrl
        submittedAt
        verifiedAt
      }
    }
  }
`;

export const ON_KYC_VERIFIED = gql`
  subscription OnKycVerified($userId: String!, $userType: KycUserType!) {
    kycVerified(userId: $userId, userType: $userType) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const ON_KYC_REJECTED = gql`
  subscription OnKycRejected($userId: String!, $userType: KycUserType!) {
    kycRejected(userId: $userId, userType: $userType) {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;

export const ON_PENDING_KYC_UPDATED = gql`
  subscription OnPendingKycUpdated {
    pendingKycUpdated {
      ...KnowYourCustomer
    }
  }
  ${KYC_ENTITY}
`;
