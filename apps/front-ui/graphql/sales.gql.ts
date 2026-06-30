// graphql/sales.gql.ts
import { gql } from "@apollo/client";

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
      medias {
        url  
      }
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_ACTIVE_SALES = gql`
  query GetActiveSales($storeId: String!) {
    activeSales(storeId: $storeId) {
      id
      storeId
      store {
        id
        name
        address
        createdAt
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
        createdAt
        product {
          id
          title
          price
          medias {
            url  
          }
        }
      }
      returns {
        id
        reason
        status
        createdAt
      }
    }
  }
`;

export const GET_SALE_BY_ID = gql`
  query GetSaleById($id: String!) {
    sale(id: $id) {
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
          medias {
            url  
          }
        }
      }
      returns {
        id
        reason
        status
        createdAt
      }
    }
  }
`;

export const GET_SALES_HISTORY = gql`
  query GetSalesHistory(
    $storeId: String
    $workerId: String
    $startDate: DateTime
    $endDate: DateTime
    $status: String
    $page: Float = 1
    $limit: Float = 20
  ) {
    salesHistory(
      storeId: $storeId
      workerId: $workerId
      startDate: $startDate
      endDate: $endDate
      status: $status
      page: $page
      limit: $limit
    ) {
      items {
        id
        storeId
        receiptUrl
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
            medias {
              url  
            }
          }
        }
        returns {
          id
          reason
          status
          createdAt
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_SALES_DASHBOARD = gql`
  query GetSalesDashboard($storeId: String!, $period: String = "day") {
    salesDashboard(storeId: $storeId, period: $period) {
      totalSales
      totalRevenue
      averageTicket
      topProducts {
        id
        title
        quantitySold
      }
      paymentMethods {
        method
        count
        amount
      }
      chartData {
        name
        sales
        transactions
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
          medias {
            url  
          }
        }
      }
      returns {
        id
        reason
        status
        createdAt
      }
    }
  }
`;

export const ADD_SALE_PRODUCT = gql`
  mutation AddSaleProduct($input: AddSaleProductInput!) {
    addSaleProduct(input: $input) {
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
        medias {
          url  
        }
      }
    }
  }
`;

export const UPDATE_SALE_PRODUCT = gql`
  mutation UpdateSaleProduct($id: String!, $input: UpdateSaleProductInput!) {
    updateSaleProduct(id: $id, input: $input) {
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
      medias {
        url  
      }
    }
  }
  }
`;

export const REMOVE_SALE_PRODUCT = gql`
  mutation RemoveSaleProduct($id: String!) {
    removeSaleProduct(id: $id) {
      id
    }
  }
`;

export const COMPLETE_SALE = gql`
  mutation CompleteSale($id: String!, $clientId: String!, $paymentMethod: String!, $paymentDetails: PaymentDetailsInput) {
    completeSale(id: $id, clientId: $clientId, paymentMethod: $paymentMethod, paymentDetails: $paymentDetails) {
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
          medias {
            url  
          }
        }
      }
      returns {
        id
        reason
        status
        createdAt
      }
    }
  }
`;

export const CREATE_RETURN = gql`
  mutation CreateReturn($input: CreateReturnInput!) {
    createReturn(input: $input) {
      id
      saleId
      reason
      status
      createdAt
    }
  }
`;

export const SYNC_OFFLINE_SALES = gql`
  mutation SyncOfflineSales($input: SyncOfflineSalesInput!) {
    syncOfflineSales(input: $input) {
      synced
      failed
      conflicts
      duplicates
      results {
        localId
        serverId
        status
        error
        conflictDetails
      }
    }
  }
`;

export const GENERATE_RECEIPT = gql`
  mutation GenerateReceipt($generateReceiptInput: GenerateReceiptInput!) {
    generateReceipt(generateReceiptInput: $generateReceiptInput) {
      receiptUrl # Return the URL
      emailSent
      fileName
      mediaId
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_SALE_CREATED = gql`
  subscription OnSaleCreated($storeId: String!) {
    saleCreated(storeId: $storeId) {
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
          medias {
            url  
          }
        }
      }
      returns {
        id
        reason
        status
        createdAt
      }
    }
  }
`;

export const ON_SALE_UPDATED = gql`
  subscription OnSaleUpdated($storeId: String!) {
    saleUpdated(storeId: $storeId) {
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
        medias {
          url  
        }
      }
    }
    returns {
      id
      reason
      status
      createdAt
    }
  }
  }
`;
