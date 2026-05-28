import { gql } from '@apollo/client';

// ======================
// STORE ENTITIES
// ======================
export const STORE_ENTITY = gql`
  fragment Store on StoreEntity {
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
      status
      createdAt
    }
    products {
      id
      title
      price
      quantity
      createdAt
    }
    workers {
      id
      fullName
      email
      phone
      avatar
      role
      isVerified
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

export const WORKER_ENTITY = gql`
  fragment Worker on WorkerEntity {
    id
    email
    fullName
    phone
    avatar
    role
    isVerified
    createdAt
    updatedAt
    business {
      id
      name
    }
    stores {
      id
      name
    }
    kyc {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
    }
    shifts {
      id
      startTime
      endTime
      sales
    }
    sales {
      id
      totalAmount
      createdAt
    }
  }
`;

export const STORE_DASHBOARD_STATS_ENTITY = gql`
  fragment StoreDashboardStats on StoreDashboardStatsEntity {
    activeWorkers
    todaySales
    todayTransactions
    lowStockItems
    outOfStockItems
    activeShifts
    totalProducts
    totalSales
    totalRevenue
    averageTicket
    topSellingProducts {
      id
      title
      quantitySold
      revenue
    }
    recentSales {
      id
      totalAmount
      status
      createdAt
      worker {
        id
        fullName
      }
    }
    inventoryStatus {
      totalItems
      lowStockCount
      outOfStockCount
      inStockCount
    }
    shiftStats {
      totalShifts
      completedShifts
      activeShifts
      averageSalesPerShift
    }
  }
`;
// ======================
// QUERIES
// ======================
export const GET_STORES = gql`
  query GetStores {
    stores {
      ...Store
    }
  }
  ${STORE_ENTITY}
`;

export const GET_STORE_DASHBOARD_STATS = gql`
  query GetStoreDashboardStats($storeId: String!) {
    storeDashboardStats(storeId: $storeId) {
      ...StoreDashboardStats
    }
  }
  ${STORE_DASHBOARD_STATS_ENTITY}
`;

export const GET_STORE_BY_ID = gql`
  query GetStoreById($id: String!) {
    store(id: $id) {
      ...Store
      dailyStats {
        todaySales
        todayTransactions
        lowStockItems
      }
      inventoryStats {
        lowStockItems
        outOfStockItems
        totalItems
      }
    }
  }
  ${STORE_ENTITY}
`;

export const GET_STORE_WORKERS = gql`
  query GetStoreWorkers($storeId: String!) {
    storeWorkers(storeId: $storeId) {
      ...Worker
    }
  }
  ${WORKER_ENTITY}
`;

export const GET_STORE_REPORTS = gql`
  query GetStoreReports($storeId: String!, $period: String = "week") {
    storeReports(storeId: $storeId, period: $period) {
      totalSales
      totalOrders
      averageTicket
      topProducts {
        id
        title
        quantitySold
        revenue
      }
      workerPerformance {
        workerId
        workerName
        sales
        hoursWorked
        completionRate
      }
      dailySales {
        date
        sales
        orders
      }
    }
  }
`;

export const GET_STORE_SHIFTS = gql`
  query GetStoreShifts($storeId: String!, $status: ShiftStatus) {
    storeShifts(storeId: $storeId, status: $status) {
      id
      worker {
        id
        fullName
        avatar
        role
      }
      startTime
      endTime
      sales
      transactionCount
      status
      createdAt
    }
  }
`;

export const GET_STORE_INVENTORY = gql`
  query GetStoreInventory($storeId: String!) {
    storeInventory(storeId: $storeId) {
      items {
        id
        productId
        product {
          id
          title
          price
          medias {
            url
          }
          minQuantity
          category {
            name
          }
        }
        quantity
        minQuantity
        status
      }
      totalItems
      lowStockCount
      outOfStockCount
    }
  }
`;

export const REPORT_HISTORY_FRAGMENT = gql`
  fragment ReportHistoryItem on ReportHistoryEntity {
    id
    reportType
    period
    generatedAt
    url
    fileName
    storeId
  }
`;

export const GENERATE_STORE_REPORT = gql`
  mutation GenerateStoreReport($input: GenerateStoreReportInput!) {
    generateStoreReport(input: $input) {
      reportUrl
      fileName
      mediaId
    }
  }
`;

export const GET_REPORT_HISTORY = gql`
  query GetReportHistory($storeId: String!) {
    reportHistory(storeId: $storeId) {
      ...ReportHistoryItem
    }
  }
  ${REPORT_HISTORY_FRAGMENT}
`;

// ======================
// MUTATIONS
// ======================
export const CREATE_STORE = gql`
  mutation CreateStore($input: CreateStoreInput!) {
    createStore(input: $input) {
      ...Store
    }
  }
  ${STORE_ENTITY}
`;

export const UPDATE_STORE = gql`
  mutation UpdateStore($id: String!, $input: UpdateStoreInput!) {
    updateStore(id: $id, input: $input) {
      ...Store
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

export const ADD_WORKER_TO_STORE = gql`
  mutation AddWorkerToStore($input: AddWorkerToStoreInput!, $inputWorker: CreateWorkerInput) {
    addWorkerToStore(input: $input, inputWorker: $inputWorker) {
      ...Worker
    }
  }
  ${WORKER_ENTITY}
`;

export const REMOVE_WORKER_FROM_STORE = gql`
  mutation RemoveWorkerFromStore($storeId: String!, $workerId: String!) {
    removeWorkerFromStore(storeId: $storeId, workerId: $workerId) {
      success
      message
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================
export const ON_WORKER_ADDED_TO_STORE = gql`
  subscription OnWorkerAddedToStore($storeId: String!) {
    workerAddedToStore(storeId: $storeId) {
      ...Worker
    }
  }
  ${WORKER_ENTITY}
`;

export const ON_WORKER_REMOVED_FROM_STORE = gql`
  subscription OnWorkerRemovedFromStore($storeId: String!) {
    workerRemovedFromStore(storeId: $storeId) {
      success
      message
    }
  }
`;