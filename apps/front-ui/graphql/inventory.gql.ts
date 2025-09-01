// graphql/inventory.gql.ts
import { gql } from '@apollo/client';

// ======================
// INVENTORY ENTITIES
// ======================

export const INVENTORY_ENTITY = gql`
  fragment InventoryEntity on Inventory {
    id
    productId
    storeId
    quantity
    minQuantity
    createdAt
    updatedAt
    product {
      id
      title
      price
      imageUrl
      quantity
    }
    store {
      id
      name
      address
    }
  }
`;

export const PURCHASE_ORDER_ENTITY = gql`
  fragment PurchaseOrderEntity on PurchaseOrder {
    id
    businessId
    storeId
    supplierId
    status
    expectedDelivery
    createdAt
    updatedAt
    business {
      id
      name
    }
    store {
      id
      name
    }
    products {
      id
      productId
      quantity
      product {
        id
        title
        price
        medias {
          url
        }
      }
    }
  }
`;

export const TRANSFER_ORDER_ENTITY = gql`
  fragment TransferOrderEntity on TransferOrder {
    id
    fromStoreId
    toStoreId
    status
    createdAt
    updatedAt
    fromStore {
      id
      name
    }
    toStore {
      id
      name
    }
    products {
      id
      productId
      quantity
      product {
        id
        title
        price
        medias {
          url
        }
      }
    }
  }
`;

export const INVENTORY_ADJUSTMENT_ENTITY = gql`
  fragment InventoryAdjustmentEntity on InventoryAdjustment {
    id
    productId
    storeId
    adjustmentType
    quantity
    reason
    createdAt
    product {
      id
      title
    }
    store {
      id
      name
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_INVENTORY = gql`
  query GetInventory(
    $storeId: String
    $productId: String
    $lowStockOnly: Boolean
    $page: Float = 1
    $limit: Float = 20
  ) {
    inventory(
      storeId: $storeId
      productId: $productId
      lowStockOnly: $lowStockOnly
      page: $page
      limit: $limit
    ) {
      items {
        id
        productId
        storeId
        quantity
        minQuantity
        createdAt
        updatedAt
        product {
          id
          title
          price
          medias {
            url
          }
          quantity
        }
        store {
          id
          name
          address
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders(
    $businessId: String!
    $storeId: String
    $status: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Float = 1
    $limit: Float = 20
  ) {
    purchaseOrders(
      businessId: $businessId
      storeId: $storeId
      status: $status
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        id
        businessId
        storeId
        supplierId
        status
        expectedDelivery
        createdAt
        updatedAt
        business {
          id
          name
        }
        store {
          id
          name
        }
        products {
          id
          productId
          quantity
          product {
            id
            title
            price
            medias {
              url
            }
          }
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_TRANSFER_ORDERS = gql`
  query GetTransferOrders(
    $fromStoreId: String
    $toStoreId: String
    $status: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Float = 1
    $limit: Float = 20
  ) {
    transferOrders(
      fromStoreId: $fromStoreId
      toStoreId: $toStoreId
      status: $status
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        id
        fromStoreId
        toStoreId
        status
        createdAt
        updatedAt
        fromStore {
          id
          name
        }
        toStore {
          id
          name
        }
        products {
          id
          productId
          quantity
          product {
            id
            title
            price
            medias {
              url
            }
          }
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_INVENTORY_ADJUSTMENTS = gql`
  query GetInventoryAdjustments(
    $storeId: String
    $productId: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Float = 1
    $limit: Float = 20
  ) {
    inventoryAdjustments(
      storeId: $storeId
      productId: $productId
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        id
        productId
        storeId
        adjustmentType
        quantity
        reason
        createdAt
        product {
          id
          title
        }
        store {
          id
          name
        }
      }
      total
      page
      limit
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      businessId
      storeId
      supplierId
      status
      expectedDelivery
      createdAt
      updatedAt
      business {
        id
        name
      }
      store {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const UPDATE_PURCHASE_ORDER = gql`
  mutation UpdatePurchaseOrder($id: String!, $input: UpdatePurchaseOrderInput!) {
    updatePurchaseOrder(id: $id, input: $input) {
      id
      businessId
      storeId
      supplierId
      status
      expectedDelivery
      createdAt
      updatedAt
      business {
        id
        name
      }
      store {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const MARK_PURCHASE_ORDER_RECEIVED = gql`
  mutation MarkPurchaseOrderReceived($id: String!, $receivedItems: [ReceivedItemInput!]!) {
    markPurchaseOrderReceived(id: $id, receivedItems: $receivedItems){
      id
      businessId
      storeId
      supplierId
      status
      expectedDelivery
      createdAt
      updatedAt
      business {
        id
        name
      }
      store {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const CREATE_TRANSFER_ORDER = gql`
  mutation CreateTransferOrder($input: CreateTransferOrderInput!) {
    createTransferOrder(input: $input) {
      id
      fromStoreId
      toStoreId
      status
      createdAt
      updatedAt
      fromStore {
        id
        name
      }
      toStore {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const UPDATE_TRANSFER_ORDER = gql`
  mutation UpdateTransferOrder($id: String!, $input: UpdateTransferOrderInput!) {
    updateTransferOrder(id: $id, input: $input) {
      id
      fromStoreId
      toStoreId
      status
      createdAt
      updatedAt
      fromStore {
        id
        name
      }
      toStore {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const MARK_TRANSFER_ORDER_RECEIVED = gql`
  mutation MarkTransferOrderReceived($id: String!) {
    markTransferOrderReceived(id: $id) {
      id
      fromStoreId
      toStoreId
      status
      createdAt
      updatedAt
      fromStore {
        id
        name
      }
      toStore {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const CREATE_INVENTORY_ADJUSTMENT = gql`
  mutation CreateInventoryAdjustment($input: CreateInventoryAdjustmentInput!) {
    createInventoryAdjustment(input: $input) {
      id
      productId
      storeId
      adjustmentType
      quantity
      reason
      createdAt
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

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_PURCHASE_ORDER_CREATED = gql`
  subscription OnPurchaseOrderCreated($businessId: String!, $storeId: String!) {
    purchaseOrderCreated(businessId: $businessId, storeId: $storeId) {
      id
      businessId
      storeId
      supplierId
      status
      expectedDelivery
      createdAt
      updatedAt
      business {
        id
        name
      }
      store {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const ON_PURCHASE_ORDER_UPDATED = gql`
  subscription OnPurchaseOrderUpdated($businessId: String!, $storeId: String!) {
    purchaseOrderUpdated(businessId: $businessId, storeId: $storeId) {
      id
      businessId
      storeId
      supplierId
      status
      expectedDelivery
      createdAt
      updatedAt
      business {
        id
        name
      }
      store {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const ON_TRANSFER_ORDER_CREATED = gql`
  subscription OnTransferOrderCreated($fromStoreId: String!, $toStoreId: String!) {
    transferOrderCreated(fromStoreId: $fromStoreId, toStoreId: $toStoreId) {
      id
      fromStoreId
      toStoreId
      status
      createdAt
      updatedAt
      fromStore {
        id
        name
      }
      toStore {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;

export const ON_TRANSFER_ORDER_UPDATED = gql`
  subscription OnTransferOrderUpdated($fromStoreId: String!) {
    transferOrderUpdated(fromStoreId: $fromStoreId) {
      id
      fromStoreId
      toStoreId
      status
      createdAt
      updatedAt
      fromStore {
        id
        name
      }
      toStore {
        id
        name
      }
      products {
        id
        productId
        quantity
        product {
          id
          title
          price
          medias {
            url
          }
        }
      }
    }
  }
`;