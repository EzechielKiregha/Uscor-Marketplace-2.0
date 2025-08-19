import { gql } from '@apollo/client';

// ======================
// AD ENTITIES
// ======================

export const AD_ENTITY = gql`
  fragment AdEntity on Ad {
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
      avatar
    }
    product {
      id
      title
      price
      imageUrl
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_ADS = gql`
  query GetAds(
    $businessId: String
    $productId: String
    $minPrice: Float
    $maxPrice: Float
    $activeOnly: Boolean
    $page: Int = 1
    $limit: Int = 20
  ) {
    ads(
      businessId: $businessId
      productId: $productId
      minPrice: $minPrice
      maxPrice: $maxPrice
      activeOnly: $activeOnly
      page: $page
      limit: $limit
    ) {
      items {
        ...AdEntity
      }
      total
      page
      limit
    }
  }
  ${AD_ENTITY}
`;

export const GET_AD_BY_ID = gql`
  query GetAdById($id: String!) {
    ad(id: $id) {
      ...AdEntity
    }
  }
  ${AD_ENTITY}
`;

export const GET_ACTIVE_ADS = gql`
  query GetActiveAds {
    activeAds {
      ...AdEntity
    }
  }
  ${AD_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_AD = gql`
  mutation CreateAd($input: CreateAdInput!) {
    createAd(input: $input) {
      ...AdEntity
    }
  }
  ${AD_ENTITY}
`;

export const UPDATE_AD = gql`
  mutation UpdateAd($id: String!, $input: UpdateAdInput!) {
    updateAd(id: $id, input: $input) {
      ...AdEntity
    }
  }
  ${AD_ENTITY}
`;

export const CANCEL_AD = gql`
  mutation CancelAd($id: String!) {
    cancelAd(id: $id) {
      ...AdEntity
    }
  }
  ${AD_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_AD_CREATED = gql`
  subscription OnAdCreated($businessId: String!) {
    adCreated(businessId: $businessId) {
      ...AdEntity
    }
  }
  ${AD_ENTITY}
`;

export const ON_AD_UPDATED = gql`
  subscription OnAdUpdated($businessId: String!) {
    adUpdated(businessId: $businessId) {
      ...AdEntity
    }
  }
  ${AD_ENTITY}
`;

export const ON_AD_ENDED = gql`
  subscription OnAdEnded($businessId: String!) {
    adEnded(businessId: $businessId) {
      id
      endedAt
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