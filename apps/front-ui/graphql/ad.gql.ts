import { gql } from "@apollo/client";

// 📦 Get All Ads
export const GET_ADS = gql`
  query GetAds {
    ads {
      id
      businessId
      productId
      price
      periodDays
      createdAt
      endedAt
      business {
        id
        name
      }
      product {
        id
        title
      }
    }
  }
`;

// 📦 Get Ad by ID
export const GET_AD_BY_ID = gql`
  query GetAdById($id: String!) {
    ad(id: $id) {
      id
      businessId
      productId
      price
      periodDays
      createdAt
      endedAt
      business {
        id
        name
      }
      product {
        id
        title
      }
    }
  }
`;

// 📦 Get Ads by Business
export const GET_ADS_BY_BUSINESS = gql`
  query GetAdsByBusiness($businessId: String!) {
    ads(businessId: $businessId) {
      id
      businessId
      productId
      price
      periodDays
      createdAt
      endedAt
      business {
        id
        name
      }
      product {
        id
        title
      }
    }
  }
`;

// ➕ Create Ad
export const CREATE_AD = gql`
  mutation CreateAd($createAdInput: CreateAdInput!) {
    createAd(createAdInput: $createAdInput) {
      id
      businessId
      productId
      price
      periodDays
      createdAt
      endedAt
    }
  }
`;

// ✏ Update Ad
export const UPDATE_AD = gql`
  mutation UpdateAd($id: String!, $updateAdInput: UpdateAdInput!) {
    updateAd(id: $id, updateAdInput: $updateAdInput) {
      id
      businessId
      productId
      price
      periodDays
      createdAt
      endedAt
    }
  }
`;

// ❌ Delete Ad
export const DELETE_AD = gql`
  mutation DeleteAd($id: String!) {
    deleteAd(id: $id) {
      id
      productId
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