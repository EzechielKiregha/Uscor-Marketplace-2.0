import { gql } from '@apollo/client';

// ======================
// SALE ENTITIES
// ======================

export const SALE_ENTITY = gql`
  fragment SaleEntity on Sale {
    id
    storeId
    store {
      id
      name
      address
    }
    workerId
    worker {
      id
      fullName
      role
    }
    clientId
    client {
      id
      fullName
      email
    }
    totalAmount
    discount
    paymentMethod
    status
    createdAt
    updatedAt
    saleProducts {
      id
      quantity
      price
      modifiers
      product {
        id
        title
        price
      }
    }
    returns {
      id
      reason
      status
      createdAt
    }
  }
`;

export const SALE_PRODUCT_ENTITY = gql`
  fragment SaleProductEntity on SaleProduct {
    id
    saleId
    productId
    quantity
    price
    modifiers
    createdAt
    product {
      id
      title
      description
      price
    }
  }
`;

export const RETURN_ENTITY = gql`
  fragment ReturnEntity on Return {
    id
    saleId
    reason
    status
    createdAt
    sale {
      id
      totalAmount
    }
  }
`;

export const RECEIPT_ENTITY = gql`
  fragment ReceiptEntity on Receipt {
    filePath
    emailSent
  }
`;

// ======================
// QUERIES
// ======================

export const GET_SALES = gql`
  query GetSales(
    $storeId: String
    $workerId: String
    $clientId: String
    $startDate: DateTime
    $endDate: DateTime
    $status: SaleStatus
    $page: Int = 1
    $limit: Int = 20
  ) {
    sales(
      storeId: $storeId
      workerId: $workerId
      clientId: $clientId
      startDate: $startDate
      endDate: $endDate
      status: $status
      page: $page
      limit: $limit
    ) {
      items {
        ...SaleEntity
      }
      total
      page
      limit
    }
  }
  ${SALE_ENTITY}
`;

export const GET_SALE_BY_ID = gql`
  query GetSaleById($id: String!) {
    sale(id: $id) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const GET_SALES_TODAY = gql`
  query GetSalesToday($storeId: String!) {
    salesToday(storeId: $storeId) {
      totalSales
      totalAmount
      averageTicket
      paymentMethods {
        method
        count
        amount
      }
    }
  }
`;

export const GET_SALES_ANALYTICS = gql`
  query GetSalesAnalytics(
    $storeId: String!
    $period: String = "day"
    $startDate: DateTime
    $endDate: DateTime
  ) {
    salesAnalytics(
      storeId: $storeId
      period: $period
      startDate: $startDate
      endDate: $endDate
    ) {
      labels
      datasets {
        label
        data
      }
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_SALE = gql`
  mutation CreateSale($input: CreateSaleInput!) {
    createSale(input: $input) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const ADD_SALE_PRODUCT = gql`
  mutation AddSaleProduct($saleId: String!, $input: AddSaleProductInput!) {
    addSaleProduct(saleId: $saleId, input: $input) {
      ...SaleProductEntity
    }
  }
  ${SALE_PRODUCT_ENTITY}
`;

export const UPDATE_SALE_PRODUCT = gql`
  mutation UpdateSaleProduct($id: String!, $input: UpdateSaleProductInput!) {
    updateSaleProduct(id: $id, input: $input) {
      ...SaleProductEntity
    }
  }
  ${SALE_PRODUCT_ENTITY}
`;

export const REMOVE_SALE_PRODUCT = gql`
  mutation RemoveSaleProduct($id: String!) {
    removeSaleProduct(id: $id) {
      id
    }
  }
`;

export const CREATE_RETURN = gql`
  mutation CreateReturn($input: CreateReturnInput!) {
    createReturn(input: $input) {
      ...ReturnEntity
    }
  }
  ${RETURN_ENTITY}
`;

export const PROCESS_RETURN = gql`
  mutation ProcessReturn($id: String!) {
    processReturn(id: $id) {
      ...ReturnEntity
    }
  }
  ${RETURN_ENTITY}
`;

export const GENERATE_RECEIPT = gql`
  mutation GenerateReceipt($saleId: String!) {
    generateReceipt(saleId: $saleId) {
      filePath
      emailSent
    }
  }
`;

export const COMPLETE_SALE = gql`
  mutation CompleteSale($id: String!, $paymentMethod: PaymentMethod!) {
    completeSale(id: $id, paymentMethod: $paymentMethod) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_SALE_CREATED = gql`
  subscription OnSaleCreated($storeId: String!) {
    saleCreated(storeId: $storeId) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const ON_SALE_UPDATED = gql`
  subscription OnSaleUpdated($storeId: String!) {
    saleUpdated(storeId: $storeId) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const ON_RETURN_CREATED = gql`
  subscription OnReturnCreated($storeId: String!) {
    returnCreated(storeId: $storeId) {
      ...ReturnEntity
    }
  }
  ${RETURN_ENTITY}
`;