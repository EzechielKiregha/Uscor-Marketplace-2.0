// graphql/loyalty.gql.ts
import { gql } from '@apollo/client';

// ======================
// LOYALTY ENTITIES
// ======================

export const LOYALTY_PROGRAM_ENTITY = gql`
  fragment LoyaltyProgramEntity on LoyaltyProgram {
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
    }
    pointsTransactions {
      id
      clientId
      points
      createdAt
      client {
        id
        fullName
        email
      }
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
    createdAt
  }
`;

// ======================
// QUERIES
// ======================

export const GET_LOYALTY_PROGRAMS = gql`
  query GetLoyaltyPrograms($businessId: String!) {
    loyaltyPrograms(businessId: $businessId) {
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
    }
    pointsTransactions {
      id
      clientId
      points
      createdAt
      client {
        id
        fullName
        email
      }
    }
  }
  }
`;

export const GET_LOYALTY_PROGRAM_BY_ID = gql`
  query GetLoyaltyProgramById($id: String!) {
    loyaltyProgram(id: $id) {
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
    }
    pointsTransactions {
      id
      clientId
      points
      createdAt
      client {
        id
        fullName
        email
      }
    }
  }
  }
`;

export const GET_CUSTOMER_POINTS = gql`
  query GetCustomerPoints($businessId: String!, $clientId: String!) {
    customerPoints(businessId: $businessId, clientId: $clientId) {
      totalPoints
      program {
        id
        name
        pointsPerPurchase
        minimumPointsToRedeem
      }
      transactions {
        id
        points
        createdAt
        type
      }
    }
  }
`;

export const GET_LOYALTY_ANALYTICS = gql`
  query GetLoyaltyAnalytics($businessId: String!, $period: String = "month") {
    loyaltyAnalytics(businessId: $businessId, period: $period) {
      totalMembers
      activeMembers
      pointsEarned
      pointsRedeemed
      redemptionRate
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
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_LOYALTY_PROGRAM = gql`
  mutation CreateLoyaltyProgram($input: CreateLoyaltyProgramInput!) {
    createLoyaltyProgram(input: $input) {
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
    }
    pointsTransactions {
      id
      clientId
      points
      createdAt
      client {
        id
        fullName
        email
      }
    }
  }
  }
`;

export const UPDATE_LOYALTY_PROGRAM = gql`
  mutation UpdateLoyaltyProgram($id: String!, $input: UpdateLoyaltyProgramInput!) {
    updateLoyaltyProgram(id: $id, input: $input) {
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
    }
    pointsTransactions {
      id
      clientId
      points
      createdAt
      client {
        id
        fullName
        email
      }
    }
  }
  }
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
    createdAt
  }
  }
`;

export const REDEEM_POINTS = gql`
  mutation RedeemPoints($input: RedeemPointsInput!) {
    redeemPoints(input: $input) {
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
    createdAt
  }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_LOYALTY_PROGRAM_CREATED = gql`
  subscription OnLoyaltyProgramCreated($businessId: String!) {
    loyaltyProgramCreated(businessId: $businessId) {
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
    }
    pointsTransactions {
      id
      clientId
      points
      createdAt
      client {
        id
        fullName
        email
      }
    }
  }
  }
`;

export const ON_LOYALTY_PROGRAM_UPDATED = gql`
  subscription OnLoyaltyProgramUpdated($businessId: String!) {
    loyaltyProgramUpdated(businessId: $businessId) {
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
    }
    pointsTransactions {
      id
      clientId
      points
      createdAt
      client {
        id
        fullName
        email
      }
    }
  }
  }
`;

export const ON_POINTS_EARNED = gql`
  subscription OnPointsEarned($businessId: String!) {
    pointsEarned(businessId: $businessId) {
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
    createdAt
  }
  }
`;

export const ON_POINTS_REDEEMED = gql`
  subscription OnPointsRedeemed($businessId: String!) {
    pointsRedeemed(businessId: $businessId) {
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
    createdAt
  }
  }
`;