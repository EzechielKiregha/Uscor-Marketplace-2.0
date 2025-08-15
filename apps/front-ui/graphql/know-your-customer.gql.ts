import { gql } from "@apollo/client";

// 📦 Get All KYC Records
export const GET_KYC_RECORDS = gql`
  query GetKycRecords {
    kycRecords {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
      businessId
      clientId
      workerId
      business {
        id
        name
      }
      client {
        id
        username
      }
      worker {
        id
        fullName
      }
    }
  }
`;

// 📦 Get KYC Record by ID
export const GET_KYC_RECORD_BY_ID = gql`
  query GetKycRecordById($id: String!) {
    kycRecord(id: $id) {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
      businessId
      clientId
      workerId
      business {
        id
        name
      }
      client {
        id
        username
      }
      worker {
        id
        fullName
      }
    }
  }
`;

// 📦 Get KYC Records by Business
export const GET_KYC_RECORDS_BY_BUSINESS = gql`
  query GetKycRecordsByBusiness($businessId: String!) {
    kycRecords(businessId: $businessId) {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
      businessId
      clientId
      workerId
      business {
        id
        name
      }
      client {
        id
        username
      }
      worker {
        id
        fullName
      }
    }
  }
`;

// ➕ Create KYC Record
export const CREATE_KYC_RECORD = gql`
  mutation CreateKycRecord($createKycRecordInput: CreateKycRecordInput!) {
    createKycRecord(createKycRecordInput: $createKycRecordInput) {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
      businessId
      clientId
      workerId
    }
  }
`;

// ✏ Update KYC Record
export const UPDATE_KYC_RECORD = gql`
  mutation UpdateKycRecord($id: String!, $updateKycRecordInput: UpdateKycRecordInput!) {
    updateKycRecord(id: $id, updateKycRecordInput: $updateKycRecordInput) {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
      businessId
      clientId
      workerId
    }
  }
`;

// ❌ Delete KYC Record
export const DELETE_KYC_RECORD = gql`
  mutation DeleteKycRecord($id: String!) {
    deleteKycRecord(id: $id) {
      id
    }
  }
`;

/**
 * Utility function to remove __typename from objects.
 */
export const removeTypename: any = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  } else if (obj && typeof obj === 'object') {
    const { __typename, ...rest } = obj;
    return Object.keys(rest).reduce((acc, key) => {
      acc[key] = removeTypename(rest[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};