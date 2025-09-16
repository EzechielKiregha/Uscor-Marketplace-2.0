import { gql } from '@apollo/client';

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
    $page: Float = 1
    $limit: Float = 20
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
      total
      page
      limit
    }
  }
`;

export const GET_PAYMENT_TRANSACTION_BY_ID = gql`
  query GetPaymentTransactionById($id: String!) {
    paymentTransaction(id: $id) {
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
  }
`;

export const GET_RECHARGES = gql`
  query GetRecharges(
    $businessId: String
    $clientId: String
    $method: String
    $status: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Float = 1
    $limit: Float = 20
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
      total
      page
      limit
    }
  }
`;

export const GET_TOKEN_TRANSACTIONS = gql`
  query GetTokenTransactions(
    $businessId: String
    $type: String
    $isRedeemed: Boolean
    $isReleased: Boolean
    $page: Float = 1
    $limit: Float = 20
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
      total
      page
      limit
    }
  }
`;

export const GET_LOYALTY_PROGRAMS = gql`
  query GetLoyaltyPrograms($businessId: String) {
    loyaltyPrograms(businessId: $businessId) {
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
  }
`;

export const GET_POINTS_TRANSACTIONS = gql`
  query GetPointsTransactions(
    $clientId: String!
    $page: Float = 1
    $limit: Float = 20
  ) {
    pointsTransactions(
      clientId: $clientId
      page: $page
      limit: $limit
    ) {
      items {
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
      total
      page
      limit
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_PAYMENT_TRANSACTION = gql`
  mutation CreatePaymentTransaction($input: CreatePaymentTransactionInput!) {
    createPaymentTransaction(input: $input) {
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
  }
`;

export const UPDATE_PAYMENT_TRANSACTION = gql`
  mutation UpdatePaymentTransaction($id: String!, $input: UpdatePaymentTransactionInput!) {
    updatePaymentTransaction(id: $id, input: $input) {
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
  }
`;

export const CREATE_RECHARGE = gql`
  mutation CreateRecharge($input: CreateRechargeInput!) {
    createRecharge(input: $input) {
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
  }
`;

export const PROCESS_RECHARGE = gql`
  mutation ProcessRecharge($id: String!) {
    processRecharge(id: $id) {
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
  }
`;

export const CREATE_TOKEN_TRANSACTION = gql`
  mutation CreateTokenTransaction($input: CreateTokenTransactionInput!) {
    createTokenTransaction(input: $input) {
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
  }
`;

export const CREATE_LOYALTY_PROGRAM = gql`
  mutation CreateLoyaltyProgram($input: CreateLoyaltyProgramInput!) {
    createLoyaltyProgram(input: $input) {
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
  }
`;

export const UPDATE_LOYALTY_PROGRAM = gql`
  mutation UpdateLoyaltyProgram($id: String!, $input: UpdateLoyaltyProgramInput!) {
    updateLoyaltyProgram(id: $id, input: $input) {
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
  }
`;

export const REDEEM_POINTS = gql`
  mutation RedeemPoints($input: RedeemPointsInput!) {
    redeemPoints(input: $input) {
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
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_PAYMENT_TRANSACTION_CREATED = gql`
  subscription OnPaymentTransactionCreated($businessId: String!) {
    paymentTransactionCreated(businessId: $businessId) {
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
  }
`;

export const ON_PAYMENT_TRANSACTION_UPDATED = gql`
  subscription OnPaymentTransactionUpdated($businessId: String!) {
    paymentTransactionUpdated(businessId: $businessId) {
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
  }
`;

export const ON_RECHARGE_CREATED = gql`
  subscription OnRechargeCreated($businessId: String!, $clientId: String!) {
    rechargeCreated(businessId: $businessId, clientId: $clientId) {
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
  }
`;

export const ON_RECHARGE_UPDATED = gql`
  subscription OnRechargeUpdated($businessId: String!, $clientId: String!) {
    rechargeUpdated(businessId: $businessId, clientId: $clientId) {
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
  }
`;

export const ON_TOKEN_TRANSACTION_CREATED = gql`
  subscription OnTokenTransactionCreated($businessId: String!) {
    tokenTransactionCreated(businessId: $businessId) {
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
  }
`;

export const ON_POINTS_TRANSACTION_CREATED = gql`
  subscription OnPointsTransactionCreated($clientId: String!) {
    pointsTransactionCreated(clientId: $clientId) {
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
  }
`;