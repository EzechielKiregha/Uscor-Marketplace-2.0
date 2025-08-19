import { gql } from '@apollo/client';

// ======================
// STORE ENTITIES
// ======================

export const STORE_ENTITY = gql`
  fragment StoreEntity on Store {
    id
    name
    address
    createdAt
    updatedAt
    business {
      id
      name
    }
    sales {
      id
      totalAmount
      createdAt
    }
    purchaseOrders {
      id
      status
      createdAt
    }
    transferOrdersFrom {
      id
      status
      createdAt
    }
    transferOrdersTo {
      id
      status
      createdAt
    }
    inventoryAdjustments {
      id
      quantity
      createdAt
    }
    shifts {
      id
      startTime
      endTime
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_STORES = gql`
  query GetStores($businessId: String!) {
    stores(businessId: $businessId) {
      ...StoreEntity
    }
  }
  ${STORE_ENTITY}
`;

export const GET_STORE_BY_ID = gql`
  query GetStoreById($id: String!) {
    store(id: $id) {
      ...StoreEntity
    }
  }
  ${STORE_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_STORE = gql`
  mutation CreateStore($input: CreateStoreInput!) {
    createStore(input: $input) {
      ...StoreEntity
    }
  }
  ${STORE_ENTITY}
`;

export const UPDATE_STORE = gql`
  mutation UpdateStore($id: String!, $input: UpdateStoreInput!) {
    updateStore(id: $id, input: $input) {
      ...StoreEntity
    }
  }
  ${STORE_ENTITY}
`;

export const DELETE_STORE = gql`
  mutation DeleteStore($id: String!) {
    deleteStore(id: $id) {
      id
    }
  }
`;