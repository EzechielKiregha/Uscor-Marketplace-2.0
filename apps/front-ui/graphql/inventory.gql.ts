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
        imageUrl
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
        imageUrl
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
    $page: Int = 1
    $limit: Int = 20
  ) {
    inventory(
      storeId: $storeId
      productId: $productId
      lowStockOnly: $lowStockOnly
      page: $page
      limit: $limit
    ) {
      items {
        ...InventoryEntity
      }
      total
      page
      limit
    }
  }
  ${INVENTORY_ENTITY}
`;

export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders(
    $businessId: String!
    $storeId: String
    $status: PurchaseOrderStatus
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
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
        ...PurchaseOrderEntity
      }
      total
      page
      limit
    }
  }
  ${PURCHASE_ORDER_ENTITY}
`;

export const GET_TRANSFER_ORDERS = gql`
  query GetTransferOrders(
    $fromStoreId: String
    $toStoreId: String
    $status: TransferOrderStatus
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
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
        ...TransferOrderEntity
      }
      total
      page
      limit
    }
  }
  ${TRANSFER_ORDER_ENTITY}
`;

export const GET_INVENTORY_ADJUSTMENTS = gql`
  query GetInventoryAdjustments(
    $storeId: String
    $productId: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
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
        ...InventoryAdjustmentEntity
      }
      total
      page
      limit
    }
  }
  ${INVENTORY_ADJUSTMENT_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      ...PurchaseOrderEntity
    }
  }
  ${PURCHASE_ORDER_ENTITY}
`;

export const UPDATE_PURCHASE_ORDER = gql`
  mutation UpdatePurchaseOrder($id: String!, $input: UpdatePurchaseOrderInput!) {
    updatePurchaseOrder(id: $id, input: $input) {
      ...PurchaseOrderEntity
    }
  }
  ${PURCHASE_ORDER_ENTITY}
`;

export const MARK_PURCHASE_ORDER_RECEIVED = gql`
  mutation MarkPurchaseOrderReceived($id: String!, $receivedItems: [ReceivedItemInput!]!) {
    markPurchaseOrderReceived(id: $id, receivedItems: $receivedItems) {
      ...PurchaseOrderEntity
    }
  }
  ${PURCHASE_ORDER_ENTITY}
`;

export const CREATE_TRANSFER_ORDER = gql`
  mutation CreateTransferOrder($input: CreateTransferOrderInput!) {
    createTransferOrder(input: $input) {
      ...TransferOrderEntity
    }
  }
  ${TRANSFER_ORDER_ENTITY}
`;

export const UPDATE_TRANSFER_ORDER = gql`
  mutation UpdateTransferOrder($id: String!, $input: UpdateTransferOrderInput!) {
    updateTransferOrder(id: $id, input: $input) {
      ...TransferOrderEntity
    }
  }
  ${TRANSFER_ORDER_ENTITY}
`;

export const MARK_TRANSFER_ORDER_RECEIVED = gql`
  mutation MarkTransferOrderReceived($id: String!) {
    markTransferOrderReceived(id: $id) {
      ...TransferOrderEntity
    }
  }
  ${TRANSFER_ORDER_ENTITY}
`;

export const CREATE_INVENTORY_ADJUSTMENT = gql`
  mutation CreateInventoryAdjustment($input: CreateInventoryAdjustmentInput!) {
    createInventoryAdjustment(input: $input) {
      ...InventoryAdjustmentEntity
    }
  }
  ${INVENTORY_ADJUSTMENT_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_PURCHASE_ORDER_CREATED = gql`
  subscription OnPurchaseOrderCreated($businessId: String!) {
    purchaseOrderCreated(businessId: $businessId) {
      ...PurchaseOrderEntity
    }
  }
  ${PURCHASE_ORDER_ENTITY}
`;

export const ON_PURCHASE_ORDER_UPDATED = gql`
  subscription OnPurchaseOrderUpdated($businessId: String!) {
    purchaseOrderUpdated(businessId: $businessId) {
      ...PurchaseOrderEntity
    }
  }
  ${PURCHASE_ORDER_ENTITY}
`;

export const ON_TRANSFER_ORDER_CREATED = gql`
  subscription OnTransferOrderCreated($fromStoreId: String!) {
    transferOrderCreated(fromStoreId: $fromStoreId) {
      ...TransferOrderEntity
    }
  }
  ${TRANSFER_ORDER_ENTITY}
`;

export const ON_TRANSFER_ORDER_UPDATED = gql`
  subscription OnTransferOrderUpdated($fromStoreId: String!) {
    transferOrderUpdated(fromStoreId: $fromStoreId) {
      ...TransferOrderEntity
    }
  }
  ${TRANSFER_ORDER_ENTITY}
`;