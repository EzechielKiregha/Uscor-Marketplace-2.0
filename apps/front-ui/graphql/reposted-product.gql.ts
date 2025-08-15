import { gql } from "@apollo/client";

// 📦 Get All Reposted Products
export const GET_REPOSTED_PRODUCTS = gql`
  query GetRepostedProducts {
    repostedProducts {
      id
      productId
      businessId
      markupPercentage
      createdAt
      product {
        id
        title
      }
      business {
        id
        name
      }
    }
  }
`;

// 📦 Get Reposted Product by ID
export const GET_REPOSTED_PRODUCT_BY_ID = gql`
  query GetRepostedProductById($id: String!) {
    repostedProduct(id: $id) {
      id
      productId
      businessId
      markupPercentage
      createdAt
      product {
        id
        title
      }
      business {
        id
        name
      }
    }
  }
`;

// 📦 Get Reposted Products by Business
export const GET_REPOSTED_PRODUCTS_BY_BUSINESS = gql`
  query GetRepostedProductsByBusiness($businessId: String!) {
    repostedProducts(businessId: $businessId) {
      id
      productId
      businessId
      markupPercentage
      createdAt
      product {
        id
        title
      }
      business {
        id
        name
      }
    }
  }
`;

// ➕ Create Reposted Product
export const CREATE_REPOSTED_PRODUCT = gql`
  mutation CreateRepostedProduct($createRepostedProductInput: CreateRepostedProductInput!) {
    createRepostedProduct(createRepostedProductInput: $createRepostedProductInput) {
      id
      productId
      businessId
      markupPercentage
      createdAt
    }
  }
`;

// ✏ Update Reposted Product
export const UPDATE_REPOSTED_PRODUCT = gql`
  mutation UpdateRepostedProduct($id: String!, $updateRepostedProductInput: UpdateRepostedProductInput!) {
    updateRepostedProduct(id: $id, updateRepostedProductInput: $updateRepostedProductInput) {
      id
      productId
      businessId
      markupPercentage
      createdAt
    }
  }
`;

// ❌ Delete Reposted Product
export const DELETE_REPOSTED_PRODUCT = gql`
  mutation DeleteRepostedProduct($id: String!) {
    deleteRepostedProduct(id: $id) {
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