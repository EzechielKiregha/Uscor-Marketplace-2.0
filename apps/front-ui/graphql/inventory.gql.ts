import { gql } from "@apollo/client";

// 📦 Get All Inventory Items
export const GET_INVENTORY_ITEMS = gql`
  query GetInventoryItems {
    inventoryItems {
      id
      productId
      storeId
      quantity
      lastUpdated
      product {
        id
        title
      }
      store {
        id
        name
      }
    }
  }
`;

// 📦 Get Inventory Item by ID
export const GET_INVENTORY_ITEM_BY_ID = gql`
  query GetInventoryItemById($id: String!) {
    inventoryItem(id: $id) {
      id
      productId
      storeId
      quantity
      lastUpdated
      product {
        id
        title
      }
      store {
        id
        name
      }
    }
  }
`;

// 📦 Get Inventory by Store
export const GET_INVENTORY_BY_STORE = gql`
  query GetInventoryByStore($storeId: String!) {
    inventoryItems(storeId: $storeId) {
      id
      productId
      storeId
      quantity
      lastUpdated
      product {
        id
        title
      }
      store {
        id
        name
      }
    }
  }
`;

// ➕ Create Inventory Item
export const CREATE_INVENTORY_ITEM = gql`
  mutation CreateInventoryItem($createInventoryItemInput: CreateInventoryItemInput!) {
    createInventoryItem(createInventoryItemInput: $createInventoryItemInput) {
      id
      productId
      storeId
      quantity
      lastUpdated
    }
  }
`;

// ✏ Update Inventory Item
export const UPDATE_INVENTORY_ITEM = gql`
  mutation UpdateInventoryItem($id: String!, $updateInventoryItemInput: UpdateInventoryItemInput!) {
    updateInventoryItem(id: $id, updateInventoryItemInput: $updateInventoryItemInput) {
      id
      productId
      storeId
      quantity
      lastUpdated
    }
  }
`;

// ❌ Delete Inventory Item
export const DELETE_INVENTORY_ITEM = gql`
  mutation DeleteInventoryItem($id: String!) {
    deleteInventoryItem(id: $id) {
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