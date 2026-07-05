import { gql } from "@apollo/client";

// ======================
// REPORT ENTITIES
// ======================

export const WORKER_REPORT_ENTITY = gql`
  fragment WorkerReport on WorkerReportEntity {
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
    $timeRange: String
    $reportType: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    workerReports(
      workerId: $workerId
      storeId: $storeId
      timeRange: $timeRange
      reportType: $reportType
      page: $page
      limit: $limit
    ) {
      items {
        id
        totalSales
        totalOrders
        totalRevenue
        averageOrderValue
        activeCustomers
        topSellingProducts {
          id
          title
          imageUrl
          quantitySold
          revenue
          profitMargin
          averageRating
        }
        period
        reportType
      }
      total
      page
      limit
    }
  }
`;

export const GET_WORKER_PERFORMANCE = gql`
  query GetWorkerPerformance(
    $workerId: String!
    $storeId: String
    $timeRange: String
  ) {
    workerPerformance(
      workerId: $workerId
      storeId: $storeId
      timeRange: $timeRange
    ) {
      totalSales
      totalTransactions
      totalRevenue
      averageTicket
      customerSatisfaction
      attendanceRate
      shiftsCompleted
      personalSales
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
        title
        quantitySold
        revenue
        profitMargin
        averageRating
      }
    }
  }
`;

export const GET_WORKER_SALES_HISTORY = gql`
  query GetWorkerSalesHistory(
    $workerId: String!
    $storeId: String
    $timeRange: String
    $status: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    workerSalesHistory(
      workerId: $workerId
      storeId: $storeId
      timeRange: $timeRange
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
