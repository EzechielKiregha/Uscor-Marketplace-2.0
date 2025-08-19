import { gql } from '@apollo/client';

// ======================
// KYC ENTITIES
// ======================

export const KYC_ENTITY = gql`
  fragment KycEntity on KnowYourCustomer {
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
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const GET_KYC_BY_USER = gql`
  query GetKycByUser($userId: String!, $userType: KycUserType!) {
    kycByUser(userId: $userId, userType: $userType) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const GET_KYC_DOCUMENTS = gql`
  query GetKycDocuments($kycId: String!) {
    kycDocuments(kycId: $kycId) {
      ...KycDocumentEntity
    }
  }
  ${KYC_DOCUMENT_ENTITY}
`;

export const GET_BUSINESS_KYC = gql`
  query GetBusinessKyc($businessId: String!) {
    businessKyc(businessId: $businessId) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const GET_CLIENT_KYC = gql`
  query GetClientKyc($clientId: String!) {
    clientKyc(clientId: $clientId) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const GET_WORKER_KYC = gql`
  query GetWorkerKyc($workerId: String!) {
    workerKyc(workerId: $workerId) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const GET_PENDING_KYC = gql`
  query GetPendingKyc($page: Int = 1, $limit: Int = 20) {
    pendingKyc(page: $page, limit: $limit) {
      items {
        ...KycEntity
      }
      total
      page
      limit
    }
  }
  ${KYC_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const SUBMIT_KYC = gql`
  mutation SubmitKyc($input: SubmitKycInput!) {
    submitKyc(input: $input) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const UPDATE_KYC_DOCUMENT = gql`
  mutation UpdateKycDocument($input: UpdateKycDocumentInput!) {
    updateKycDocument(input: $input) {
      ...KycDocumentEntity
    }
  }
  ${KYC_DOCUMENT_ENTITY}
`;

export const VERIFY_KYC = gql`
  mutation VerifyKyc($input: VerifyKycInput!) {
    verifyKyc(input: $input) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const REJECT_KYC = gql`
  mutation RejectKyc($input: RejectKycInput!) {
    rejectKyc(input: $input) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const REQUEST_KYC_REVIEW = gql`
  mutation RequestKycReview($kycId: String!) {
    requestKycReview(kycId: $kycId) {
      ...KycEntity
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
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const ON_KYC_VERIFIED = gql`
  subscription OnKycVerified($userId: String!, $userType: KycUserType!) {
    kycVerified(userId: $userId, userType: $userType) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const ON_KYC_REJECTED = gql`
  subscription OnKycRejected($userId: String!, $userType: KycUserType!) {
    kycRejected(userId: $userId, userType: $userType) {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;

export const ON_PENDING_KYC_UPDATED = gql`
  subscription OnPendingKycUpdated {
    pendingKycUpdated {
      ...KycEntity
    }
  }
  ${KYC_ENTITY}
`;