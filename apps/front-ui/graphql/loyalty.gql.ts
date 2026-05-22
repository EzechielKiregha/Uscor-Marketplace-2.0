// graphql/loyalty.gql.ts (Updated)
import { gql } from '@apollo/client';

// ======================
// LOYALTY ENTITIES
// ======================

export const LOYALTY_PROGRAM_ENTITY = gql`
  fragment LoyaltyProgram on LoyaltyProgramEntity {
    id
    name
    description
    pointsPerPurchase
    minimumPointsToRedeem
    createdAt
    updatedAt
    business {
      id
      name
      businessType
    }
    tiers {
      id
      name
      minPoints
      benefits {
        id
        description
      }
    }
    pointsTransactions {
      id
      clientId
      points
      type
      createdAt
      client {
        id
        fullName
        email
      }
    }
  }
`;

export const LOYALTY_TIER_ENTITY = gql`
  fragment LoyaltyTier on LoyaltyTierEntity {
    id
    name
    minPoints
    benefits {
      id
      description
    }
  }
`;

export const POINTS_TRANSACTION_ENTITY = gql`
  fragment PointsTransaction on PointsTransactionEntity {
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
    createdAt
  }
`;

export const LOYALTY_ANALYTICS_ENTITY = gql`
  fragment LoyaltyAnalytics on LoyaltyAnalyticsEntity {
    totalMembers
    activeMembers
    pointsEarned
    pointsRedeemed
    redemptionRate
    bronzeMembers
    silverMembers
    goldMembers
    platinumMembers
    topCustomers {
      clientId
      clientName
      totalPoints
      totalSpent
    }
    pointsByDay {
      date
      earned
      redeemed
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_LOYALTY_PROGRAMS = gql`
  query GetLoyaltyPrograms($businessId: String!) {
    loyaltyPrograms(businessId: $businessId) {
      ...LoyaltyProgram
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const GET_LOYALTY_PROGRAM_BY_ID = gql`
  query GetLoyaltyProgramById($id: String!) {
    loyaltyProgram(id: $id) {
      ...LoyaltyProgram
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const GET_LOYALTY_TIERS = gql`
  query GetLoyaltyTiers($loyaltyProgramId: String!) {
    loyaltyTiers(loyaltyProgramId: $loyaltyProgramId) {
      ...LoyaltyTier
    }
  }
  ${LOYALTY_TIER_ENTITY}
`;

export const GET_POINTS_TRANSACTIONS = gql`
  query GetPointsTransactions(
    $loyaltyProgramId: String!
    $clientId: String
    $type: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
  ) {
    pointsTransactions(
      loyaltyProgramId: $loyaltyProgramId
      clientId: $clientId
      type: $type
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        ...PointsTransaction
      }
      total
      page
      limit
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

export const GET_LOYALTY_ANALYTICS = gql`
  query GetLoyaltyAnalytics($businessId: String!, $period: String = "month") {
    loyaltyAnalytics(businessId: $businessId, period: $period) {
      ...LoyaltyAnalytics
    }
  }
  ${LOYALTY_ANALYTICS_ENTITY}
`;

export const GET_CUSTOMER_POINTS = gql`
  query GetCustomerPoints($businessId: String!, $clientId: String!) {
    customerPoints(businessId: $businessId, clientId: $clientId) {
      totalPoints
      pointsUsed
      pointsAvailable
      tier
      program {
        id
        name
        pointsPerPurchase
        minimumPointsToRedeem
      }
      transactions {
        id
        points
        type
        createdAt
      }
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_LOYALTY_PROGRAM = gql`
  mutation CreateLoyaltyProgram($input: CreateLoyaltyProgramInput!) {
    createLoyaltyProgram(input: $input) {
      ...LoyaltyProgram
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const UPDATE_LOYALTY_PROGRAM = gql`
  mutation UpdateLoyaltyProgram($id: String!, $input: UpdateLoyaltyProgramInput!) {
    updateLoyaltyProgram(id: $id, input: $input) {
      ...LoyaltyProgram
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
      ...PointsTransaction
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

export const REDEEM_POINTS = gql`
  mutation RedeemPoints($input: RedeemPointsInput!) {
    redeemPoints(input: $input) {
      ...PointsTransaction
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

export const CREATE_LOYALTY_TIER = gql`
  mutation CreateLoyaltyTier($input: CreateLoyaltyTierInput!) {
    createLoyaltyTier(input: $input) {
      ...LoyaltyTier
    }
  }
  ${LOYALTY_TIER_ENTITY}
`;

export const UPDATE_LOYALTY_TIER = gql`
  mutation UpdateLoyaltyTier($id: String!, $input: UpdateLoyaltyTierInput!) {
    updateLoyaltyTier(id: $id, input: $input) {
      ...LoyaltyTier
    }
  }
  ${LOYALTY_TIER_ENTITY}
`;

export const DELETE_LOYALTY_TIER = gql`
  mutation DeleteLoyaltyTier($id: String!) {
    deleteLoyaltyTier(id: $id) {
      id
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_LOYALTY_PROGRAM_CREATED = gql`
  subscription OnLoyaltyProgramCreated($businessId: String!) {
    loyaltyProgramCreated(businessId: $businessId) {
      ...LoyaltyProgram
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const ON_LOYALTY_PROGRAM_UPDATED = gql`
  subscription OnLoyaltyProgramUpdated($businessId: String!) {
    loyaltyProgramUpdated(businessId: $businessId) {
      ...LoyaltyProgram
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const ON_POINTS_EARNED = gql`
  subscription OnPointsEarned($businessId: String!) {
    pointsEarned(businessId: $businessId) {
      ...PointsTransaction
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

export const ON_POINTS_REDEEMED = gql`
  subscription OnPointsRedeemed($businessId: String!) {
    pointsRedeemed(businessId: $businessId) {
      ...PointsTransaction
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;