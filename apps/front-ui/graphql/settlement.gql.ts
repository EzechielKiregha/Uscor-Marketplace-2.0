import { gql } from "@apollo/client";

export const GET_SETTLEMENTS = gql`
  query GetSettlements(
    $page: Int
    $limit: Int
    $status: String
    $businessId: String
  ) {
    settlements(
      page: $page
      limit: $limit
      status: $status
      businessId: $businessId
    ) {
      items {
        id
        orderId
        businessGroupId
        businessId
        business {
          id
          name
          avatar
        }
        grossAmount
        platformFee
        deliveryFee
        netAmount
        status
        distributedAt
        distributedBy
        createdAt
      }
      total
      page
      limit
    }
  }
`;

export const GET_SETTLEMENT_STATS = gql`
  query GetSettlementStats($businessId: String) {
    settlementStats(businessId: $businessId) {
      totalPending
      totalDistributed
      totalPlatformFees
      totalDeliveryFees
      pendingCount
      distributedCount
    }
  }
`;

export const GET_BUSINESS_SETTLEMENTS = gql`
  query GetBusinessSettlements(
    $businessId: String!
    $page: Int
    $limit: Int
    $status: String
  ) {
    businessSettlements(
      businessId: $businessId
      page: $page
      limit: $limit
      status: $status
    ) {
      items {
        id
        orderId
        businessGroupId
        businessId
        grossAmount
        platformFee
        deliveryFee
        netAmount
        status
        distributedAt
        distributedBy
        createdAt
      }
      total
      page
      limit
    }
  }
`;

export const GET_BUSINESS_SETTLEMENT_STATS = gql`
  query GetBusinessSettlementStats($businessId: String!) {
    businessSettlementStats(businessId: $businessId) {
      totalPending
      totalDistributed
      totalPlatformFees
      totalDeliveryFees
      pendingCount
      distributedCount
    }
  }
`;

export const DISTRIBUTE_SETTLEMENT = gql`
  mutation DistributeSettlement($id: String!) {
    distributeSettlement(id: $id) {
      id
      status
      distributedAt
      distributedBy
    }
  }
`;

export const BATCH_DISTRIBUTE_SETTLEMENTS = gql`
  mutation BatchDistributeSettlements($ids: [String!]!) {
    batchDistributeSettlements(ids: $ids) {
      id
      status
      distributedAt
      distributedBy
    }
  }
`;
