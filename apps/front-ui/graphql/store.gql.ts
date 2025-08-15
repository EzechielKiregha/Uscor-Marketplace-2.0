import { gql } from "@apollo/client";

// 📦 Get All Stores
export const GET_STORES = gql`
  query GetStores {
    stores {
      id
      businessId
      name
      address
      createdAt
      updatedAt
      business {
        id
        name
      }
    }
  }
`;

// 📦 Get Store by ID
export const GET_STORE_BY_ID = gql`
  query GetStoreById($id: String!) {
    store(id: $id) {
      id
      businessId
      name
      address
      createdAt
      updatedAt
      business {
        id
        name
      }
    }
  }
`;

// 📦 Get Stores by Business
export const GET_STORES_BY_BUSINESS = gql`
  query GetStoresByBusiness($businessId: String!) {
    stores(businessId: $businessId) {
      id
      businessId
      name
      address
      createdAt
      updatedAt
      business {
        id
        name
      }
    }
  }
`;

// ➕ Create Store
export const CREATE_STORE = gql`
  mutation CreateStore($createStoreInput: CreateStoreInput!) {
    createStore(createStoreInput: $createStoreInput) {
      id
      businessId
      name
      address
      createdAt
      updatedAt
    }
  }
`;

// ✏ Update Store
export const UPDATE_STORE = gql`
  mutation UpdateStore($id: String!, $updateStoreInput: UpdateStoreInput!) {
    updateStore(id: $id, updateStoreInput: $updateStoreInput) {
      id
      businessId
      name
      address
      createdAt
      updatedAt
    }
  }
`;

// ❌ Delete Store
export const DELETE_STORE = gql`
  mutation DeleteStore($id: String!) {
    deleteStore(id: $id) {
      id
      name
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