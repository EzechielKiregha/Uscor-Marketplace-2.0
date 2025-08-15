import { gql } from "@apollo/client";

// 📦 Get All Referrals
export const GET_REFERRALS = gql`
  query GetReferrals {
    referrals {
      id
      affiliateBusinessId
      affiliateClientId
      referredBusinessId
      referredClientId
      verifiedPurchase
      createdAt
      affiliateBusiness {
        id
        name
      }
      affiliateClient {
        id
        username
      }
      referredBusiness {
        id
        name
      }
      referredClient {
        id
        username
      }
    }
  }
`;

// 📦 Get Referral by ID
export const GET_REFERRAL_BY_ID = gql`
  query GetReferralById($id: String!) {
    referral(id: $id) {
      id
      affiliateBusinessId
      affiliateClientId
      referredBusinessId
      referredClientId
      verifiedPurchase
      createdAt
      affiliateBusiness {
        id
        name
      }
      affiliateClient {
        id
        username
      }
      referredBusiness {
        id
        name
      }
      referredClient {
        id
        username
      }
    }
  }
`;

// 📦 Get Referrals by Affiliate
export const GET_REFERRALS_BY_AFFILIATE = gql`
  query GetReferralsByAffiliate($affiliateId: String!) {
    referrals(affiliateId: $affiliateId) {
      id
      affiliateBusinessId
      affiliateClientId
      referredBusinessId
      referredClientId
      verifiedPurchase
      createdAt
      affiliateBusiness {
        id
        name
      }
      affiliateClient {
        id
        username
      }
      referredBusiness {
        id
        name
      }
      referredClient {
        id
        username
      }
    }
  }
`;

// ➕ Create Referral
export const CREATE_REFERRAL = gql`
  mutation CreateReferral($createReferralInput: CreateReferralInput!) {
    createReferral(createReferralInput: $createReferralInput) {
      id
      affiliateBusinessId
      affiliateClientId
      referredBusinessId
      referredClientId
      verifiedPurchase
      createdAt
    }
  }
`;

// ✏ Update Referral
export const UPDATE_REFERRAL = gql`
  mutation UpdateReferral($id: String!, $updateReferralInput: UpdateReferralInput!) {
    updateReferral(id: $id, updateReferralInput: $updateReferralInput) {
      id
      affiliateBusinessId
      affiliateClientId
      referredBusinessId
      referredClientId
      verifiedPurchase
      createdAt
    }
  }
`;

// ❌ Delete Referral
export const DELETE_REFERRAL = gql`
  mutation DeleteReferral($id: String!) {
    deleteReferral(id: $id) {
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