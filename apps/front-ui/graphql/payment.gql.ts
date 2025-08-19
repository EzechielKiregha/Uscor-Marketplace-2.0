import { gql } from '@apollo/client';

// ======================
// PAYMENT ENTITIES
// ======================

export const PAYMENT_TRANSACTION_ENTITY = gql`
  fragment PaymentTransactionEntity on PaymentTransaction {
    id
    amount
    method
    status
    transactionDate
    qrCode
    createdAt
    order {
      id
      deliveryFee
      status
    }
    postTransaction {
      id
      amount
      status
      createdAt
    }
  }
`;

export const RECHARGE_ENTITY = gql`
  fragment RechargeEntity on Recharge {
    id
    amount
    method
    status
    transactionDate
    qrCode
    createdAt
    businessId
    clientId
    business {
      id
      name
    }
    client {
      id
      fullName
    }
  }
`;

export const TOKEN_TRANSACTION_ENTITY = gql`
  fragment TokenTransactionEntity on TokenTransaction {
    id
    businessId
    business {
      id
      name
    }
    reOwnedProductId
    reOwnedProduct {
      id
      newPrice
    }
    repostedProductId
    repostedProduct {
      id
      newPrice
    }
    amount
    type
    isRedeemed
    isReleased
    createdAt
  }
`;

export const LOYALTY_PROGRAM_ENTITY = gql`
  fragment LoyaltyProgramEntity on LoyaltyProgram {
    id
    name
    description
    pointsPerDollar
    minimumPointsToRedeem
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
    points
    description
    createdAt
    client {
      id
      fullName
    }
    loyaltyProgram {
      id
      name
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_PAYMENT_TRANSACTIONS = gql`
  query GetPaymentTransactions(
    $orderId: String
    $clientId: String
    $businessId: String
    $startDate: DateTime
    $endDate: DateTime
    $status: PaymentStatus
    $page: Int = 1
    $limit: Int = 20
  ) {
    paymentTransactions(
      orderId: $orderId
      clientId: $clientId
      businessId: $businessId
      startDate: $startDate
      endDate: $endDate
      status: $status
      page: $page
      limit: $limit
    ) {
      items {
        ...PaymentTransactionEntity
      }
      total
      page
      limit
    }
  }
  ${PAYMENT_TRANSACTION_ENTITY}
`;

export const GET_PAYMENT_TRANSACTION_BY_ID = gql`
  query GetPaymentTransactionById($id: String!) {
    paymentTransaction(id: $id) {
      ...PaymentTransactionEntity
    }
  }
  ${PAYMENT_TRANSACTION_ENTITY}
`;

export const GET_RECHARGES = gql`
  query GetRecharges(
    $businessId: String
    $clientId: String
    $method: String
    $status: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
  ) {
    recharges(
      businessId: $businessId
      clientId: $clientId
      method: $method
      status: $status
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        ...RechargeEntity
      }
      total
      page
      limit
    }
  }
  ${RECHARGE_ENTITY}
`;

export const GET_TOKEN_TRANSACTIONS = gql`
  query GetTokenTransactions(
    $businessId: String
    $type: TokenTransactionType
    $isRedeemed: Boolean
    $isReleased: Boolean
    $page: Int = 1
    $limit: Int = 20
  ) {
    tokenTransactions(
      businessId: $businessId
      type: $type
      isRedeemed: $isRedeemed
      isReleased: $isReleased
      page: $page
      limit: $limit
    ) {
      items {
        ...TokenTransactionEntity
      }
      total
      page
      limit
    }
  }
  ${TOKEN_TRANSACTION_ENTITY}
`;

export const GET_LOYALTY_PROGRAMS = gql`
  query GetLoyaltyPrograms($businessId: String) {
    loyaltyPrograms(businessId: $businessId) {
      ...LoyaltyProgramEntity
    }
  }
  ${LOYALTY_PROGRAM_ENTITY}
`;

export const GET_POINTS_TRANSACTIONS = gql`
  query GetPointsTransactions(
    $clientId: String!
    $page: Int = 1
    $limit: Int = 20
  ) {
    pointsTransactions(
      clientId: $clientId
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

export const CREATE_PAYMENT_TRANSACTION = gql`
  mutation CreatePaymentTransaction($input: CreatePaymentTransactionInput!) {
    createPaymentTransaction(input: $input) {
      ...PaymentTransactionEntity
    }
  }
  ${PAYMENT_TRANSACTION_ENTITY}
`;

export const UPDATE_PAYMENT_TRANSACTION = gql`
  mutation UpdatePaymentTransaction($id: String!, $input: UpdatePaymentTransactionInput!) {
    updatePaymentTransaction(id: $id, input: $input) {
      ...PaymentTransactionEntity
    }
  }
  ${PAYMENT_TRANSACTION_ENTITY}
`;

export const CREATE_RECHARGE = gql`
  mutation CreateRecharge($input: CreateRechargeInput!) {
    createRecharge(input: $input) {
      ...RechargeEntity
    }
  }
  ${RECHARGE_ENTITY}
`;

export const PROCESS_RECHARGE = gql`
  mutation ProcessRecharge($id: String!) {
    processRecharge(id: $id) {
      ...RechargeEntity
    }
  }
  ${RECHARGE_ENTITY}
`;

export const CREATE_TOKEN_TRANSACTION = gql`
  mutation CreateTokenTransaction($input: CreateTokenTransactionInput!) {
    createTokenTransaction(input: $input) {
      ...TokenTransactionEntity
    }
  }
  ${TOKEN_TRANSACTION_ENTITY}
`;

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

export const REDEEM_POINTS = gql`
  mutation RedeemPoints($input: RedeemPointsInput!) {
    redeemPoints(input: $input) {
      ...PointsTransactionEntity
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_PAYMENT_TRANSACTION_CREATED = gql`
  subscription OnPaymentTransactionCreated($businessId: String!) {
    paymentTransactionCreated(businessId: $businessId) {
      ...PaymentTransactionEntity
    }
  }
  ${PAYMENT_TRANSACTION_ENTITY}
`;

export const ON_PAYMENT_TRANSACTION_UPDATED = gql`
  subscription OnPaymentTransactionUpdated($businessId: String!) {
    paymentTransactionUpdated(businessId: $businessId) {
      ...PaymentTransactionEntity
    }
  }
  ${PAYMENT_TRANSACTION_ENTITY}
`;

export const ON_RECHARGE_CREATED = gql`
  subscription OnRechargeCreated($businessId: String!, $clientId: String!) {
    rechargeCreated(businessId: $businessId, clientId: $clientId) {
      ...RechargeEntity
    }
  }
  ${RECHARGE_ENTITY}
`;

export const ON_RECHARGE_UPDATED = gql`
  subscription OnRechargeUpdated($businessId: String!, $clientId: String!) {
    rechargeUpdated(businessId: $businessId, clientId: $clientId) {
      ...RechargeEntity
    }
  }
  ${RECHARGE_ENTITY}
`;

export const ON_TOKEN_TRANSACTION_CREATED = gql`
  subscription OnTokenTransactionCreated($businessId: String!) {
    tokenTransactionCreated(businessId: $businessId) {
      ...TokenTransactionEntity
    }
  }
  ${TOKEN_TRANSACTION_ENTITY}
`;

export const ON_POINTS_TRANSACTION_CREATED = gql`
  subscription OnPointsTransactionCreated($clientId: String!) {
    pointsTransactionCreated(clientId: $clientId) {
      ...PointsTransactionEntity
    }
  }
  ${POINTS_TRANSACTION_ENTITY}
`;