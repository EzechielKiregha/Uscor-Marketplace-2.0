// graphql/reports.gql.ts
import { gql } from '@apollo/client';

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

export const LOYALTY_PROGRAM_ENTITY = gql`
  fragment LoyaltyProgramEntity on LoyaltyProgram {
    id
    name
    description
    pointsPerDollar
    minimumPointsToRedeem
    redemptionRate
    totalMembers
    activeMembers
    pointsEarned
    pointsRedeemed
    createdAt
    updatedAt
    business {
      id
      name
    }
  }
`;

export const POINTS_TRANSACTION_ENTITY = gql`
  fragment PointsTransactionEntity on PointsTransaction {
    id
    clientId
    client {
      id
      fullName
      email
    }
    loyaltyProgramId
    loyaltyProgram {
      id
      name
    }
    points
    type
    reason
    createdAt
    updatedAt
  }
`;

export const CUSTOMER_POINTS_ENTITY = gql`
  fragment CustomerPointsEntity on CustomerPoints {
    clientId
    client {
      id
      fullName
      email
    }
    loyaltyProgramId
    loyaltyProgram {
      id
      name
      pointsPerDollar
      minimumPointsToRedeem
    }
    totalPoints
    pointsUsed
    pointsAvailable
    tier
    lastActivityAt
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

export const GET_LOYALTY_PROGRAMS = gql`
  query GetLoyaltyPrograms($businessId: String!) {
    loyaltyPrograms(businessId: $businessId) {
      ...LoyaltyProgramEntity
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const GET_LOYALTY_PROGRAM_BY_ID = gql`
  query GetLoyaltyProgramById($id: String!) {
    loyaltyProgram(id: $id) {
      ...LoyaltyProgramEntity
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const GET_CUSTOMER_POINTS = gql`
  query GetCustomerPoints(
    $businessId: String!
    $clientId: String!
  ) {
    customerPoints(businessId: $businessId, clientId: $clientId) {
      ...CustomerPointsEntity
    }
  }
  ${CUSTOMER_POINTS_ENTITY}
`;

export const GET_LOYALTY_ANALYTICS = gql`
  query GetLoyaltyAnalytics(
    $businessId: String!
    $startDate: DateTime
    $endDate: DateTime
    $period: String = "MONTH"
  ) {
    loyaltyAnalytics(businessId: $businessId, startDate: $startDate, endDate: $endDate, period: $period) {
      totalMembers
      activeMembers
      pointsEarned
      pointsRedeemed
      redemptionRate
      averagePointsPerCustomer
      pointsByDay {
        date
        earned
        redeemed
      }
      topCustomers {
        clientId
        clientName
        totalPoints
        totalSpent
        joinDate
      }
      pointsByCategory {
        category
        pointsEarned
        pointsRedeemed
      }
    }
  }
`;

export const GET_POINTS_TRANSACTIONS = gql`
  query GetPointsTransactions(
    $businessId: String!
    $clientId: String
    $type: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
  ) {
    pointsTransactions(
      businessId: $businessId
      clientId: $clientId
      type: $type
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        ...PointsTransactionEntity
      }
      total
      page
      limit
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_LOYALTY_PROGRAM = gql`
  mutation CreateLoyaltyProgram($input: CreateLoyaltyProgramInput!) {
    createLoyaltyProgram(input: $input) {
      ...LoyaltyProgramEntity
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const UPDATE_LOYALTY_PROGRAM = gql`
  mutation UpdateLoyaltyProgram($id: String!, $input: UpdateLoyaltyProgramInput!) {
    updateLoyaltyProgram(id: $id, input: $input) {
      ...LoyaltyProgramEntity
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const DELETE_LOYALTY_PROGRAM = gql`
  mutation DeleteLoyaltyProgram($id: String!) {
    deleteLoyaltyProgram(id: $id) {
      id
    }
  }
`;

export const EARN_POINTS = gql`
  mutation EarnPoints($input: EarnPointsInput!) {
    earnPoints(input: $input) {
      ...PointsTransactionEntity
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

export const REDEEM_POINTS = gql`
  mutation RedeemPoints($input: RedeemPointsInput!) {
    redeemPoints(input: $input) {
      ...PointsTransactionEntity
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

export const UPDATE_WORKER_PERFORMANCE = gql`
  mutation UpdateWorkerPerformance($input: UpdateWorkerPerformanceInput!) {
    updateWorkerPerformance(input: $input) {
      success
      message
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_LOYALTY_PROGRAM_CREATED = gql`
  subscription OnLoyaltyProgramCreated($businessId: String!) {
    loyaltyProgramCreated(businessId: $businessId) {
      ...LoyaltyProgramEntity
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const ON_LOYALTY_PROGRAM_UPDATED = gql`
  subscription OnLoyaltyProgramUpdated($businessId: String!) {
    loyaltyProgramUpdated(businessId: $businessId) {
      ...LoyaltyProgramEntity
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const ON_POINTS_EARNED = gql`
  subscription OnPointsEarned($businessId: String!) {
    pointsEarned(businessId: $businessId) {
      ...PointsTransactionEntity
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

export const ON_POINTS_REDEEMED = gql`
  subscription OnPointsRedeemed($businessId: String!) {
    pointsRedeemed(businessId: $businessId) {
      ...PointsTransactionEntity
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;