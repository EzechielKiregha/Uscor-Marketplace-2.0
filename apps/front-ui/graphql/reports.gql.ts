import { gql } from "@apollo/client";

// ======================
// REPORT ENTITIES
// ======================

export const WORKER_REPORT_ENTITY = gql`
  fragment WorkerReportEntity on WorkerReport {
    id
    workerId
    storeId
    period
    totalSales
    totalTransactions
    totalRevenue
    averageTicket
    topSellingProducts {
      productId
      productName
      quantitySold
      revenueGenerated
    }
    customerSatisfaction
    attendanceRate
    createdAt
    updatedAt
    worker {
      id
      fullName
      role
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

export const GET_WORKER_REPORTS = gql`
  query GetWorkerReports(
    $workerId: String!
    $storeId: String
    $startDate: DateTime
    $endDate: DateTime
    $period: String = "MONTH"
    $page: Int = 1
    $limit: Int = 20
  ) {
    workerReports(
      workerId: $workerId
      storeId: $storeId
      startDate: $startDate
      endDate: $endDate
      period: $period
      page: $page
      limit: $limit
    ) {
      items {
        ...WorkerReportEntity
      }
      total
      page
      limit
    }
  }
  ${WORKER_REPORT_ENTITY}
`;

export const GET_WORKER_PERFORMANCE = gql`
  query GetWorkerPerformance(
    $workerId: String!
    $storeId: String
    $startDate: DateTime
    $endDate: DateTime
  ) {
    workerPerformance(
      workerId: $workerId
      storeId: $storeId
      startDate: $startDate
      endDate: $endDate
    ) {
      totalSales
      totalTransactions
      totalRevenue
      averageTicket
      customerSatisfaction
      attendanceRate
      shiftsWorked
      salesByHour {
        hour
        sales
      }
      salesByProductCategory {
        category
        sales
        quantity
      }
      topSellingProducts {
        id
        name
        quantitySold
        revenue
      }
    }
  }
`;

export const GET_WORKER_SALES_HISTORY = gql`
  query GetWorkerSalesHistory(
    $workerId: String!
    $storeId: String
    $startDate: DateTime
    $endDate: DateTime
    $status: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    workerSalesHistory(
      workerId: $workerId
      storeId: $storeId
      startDate: $startDate
      endDate: $endDate
      status: $status
      page: $page
      limit: $limit
    ) {
      items {
        id
        orderNumber
        totalAmount
        status
        createdAt
        client {
          id
          fullName
          avatar
        }
        products {
          id
          name
          quantity
          price
        }
        paymentMethod
        deliveryAddress
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


export const UPDATE_WORKER_PERFORMANCE = gql`
  mutation UpdateWorkerPerformance($input: UpdateWorkerPerformanceInput!) {
    updateWorkerPerformance(input: $input) {
      success
      message
    }
  }
`;
