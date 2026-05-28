import { gql } from '@apollo/client';

// ======================
// WALLET ENTITIES
// ======================

export const ACCOUNT_RECHARGE_ENTITY = gql`
  fragment AccountRecharge on AccountRechargeEntity {
    id
    amount
    method
    origin
    status
    transactionDate
    qrCode
    createdAt
    business {
      id
      name
      avatar
    }
    client {
      id
      fullName
      avatar
    }
    tokenTransaction {
      id
      amount
      type
      isRedeemed
      isReleased
      createdAt
    }
  }
`;

export const TOKEN_ENTITY = gql`
  fragment Token on TokenEntity {
    id
    name
    value
    createdAt
  }
`;

export const TOKEN_TRANSACTION_ENTITY = gql`
  fragment TokenTransaction on TokenTransactionEntity {
    id
    businessId
    business {
      id
      name
    }
    reOwnedProductId
    reOwnedProduct {
      id
      title
    }
    repostedProductId
    repostedProduct {
      id
      title
    }
    amount
    type
    isRedeemed
    isReleased
    createdAt
    accountRecharges {
      id
      amount
      method
      status
      createdAt
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_ACCOUNT_BALANCE = gql`
  query GetAccountBalance($userId: String!, $userType: String!) {
    accountBalance(userId: $userId, userType: $userType) {
      totalAmount
      availableAmount
      pendingAmount
      reservedAmount
      transactions {
        id
        amount
        method
        status
        origin
        createdAt
      }
      tokenBalance {
        totalTokens
        availableTokens
        pendingTokens
      }
    }
  }
`;

export const GET_ACCOUNT_RECHARGES = gql`
  query GetAccountRecharges(
    $userId: String!
    $userType: String!
    $method: String
    $status: String
    $origin: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Float = 1
    $limit: Float = 10
  ) {
    accountRecharges(
      userId: $userId
      userType: $userType
      method: $method
      status: $status
      origin: $origin
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        ...AccountRecharge
      }
      total
      page
      limit
    }
  }
  ${ACCOUNT_RECHARGE_ENTITY}
`;

export const GET_TOKEN_TRANSACTIONS = gql`
  query GetTokenTransactions(
    $businessId: String!
    $type: String
    $isRedeemed: Boolean
    $isReleased: Boolean
    $startDate: DateTime
    $endDate: DateTime
    $page: Float = 1
    $limit: Float = 10
  ) {
    tokenTransactions(
      businessId: $businessId
      type: $type
      isRedeemed: $isRedeemed
      isReleased: $isReleased
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        ...TokenTransaction
      }
      total
      page
      limit
    }
  }
  ${TOKEN_TRANSACTION_ENTITY}
`;

export const GET_TOKEN_BALANCE = gql`
  query GetTokenBalance($businessId: String!) {
    tokenBalance(businessId: $businessId) {
      totalTokens
      availableTokens
      pendingTokens
      reservedTokens
      transactions {
        id
        amount
        type
        isRedeemed
        isReleased
        createdAt
      }
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_ACCOUNT_RECHARGE = gql`
  mutation CreateAccountRecharge($input: CreateAccountRechargeInput!) {
    createAccountRecharge(input: $input) {
      ...AccountRecharge
    }
  }
  ${ACCOUNT_RECHARGE_ENTITY}
`;

export const UPDATE_ACCOUNT_RECHARGE = gql`
  mutation UpdateAccountRecharge($id: String!, $input: UpdateAccountRechargeInput!) {
    updateAccountRecharge(id: $id, input: $input) {
      ...AccountRecharge
    }
  }
  ${ACCOUNT_RECHARGE_ENTITY}
`;

export const WITHDRAW_ACCOUNT_FUNDS = gql`
  mutation WithdrawAccountFunds($input: WithdrawFundsInput!) {
    withdrawFunds(input: $input) {
      success
      transactionId
      withdrawalFee
      netAmount
      status
    }
  }
`;

export const CONVERT_TO_TOKENS = gql`
  mutation ConvertToTokens($input: ConvertToTokensInput!) {
    convertToTokens(input: $input) {
      success
      tokenAmount
      convertedAmount
      transactionId
    }
  }
`;

export const REDEEM_TOKENS = gql`
  mutation RedeemTokens($input: RedeemTokensInput!) {
    redeemTokens(input: $input) {
      ...TokenTransaction
    }
  }
  ${TOKEN_TRANSACTION_ENTITY}
`;

export const RELEASE_TOKENS = gql`
  mutation ReleaseTokens($input: ReleaseTokensInput!) {
    releaseTokens(input: $input) {
      ...TokenTransaction
    }
  }
  ${TOKEN_TRANSACTION_ENTITY}
`;

export const GET_MOBILE_MONEY_CODE = gql`
  mutation GetMobileMoneyCode($input: GetMobileMoneyCodeInput!) {
    getMobileMoneyCode(input: $input) {
      ussdCode
      phoneNumber
      amount
      provider
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_ACCOUNT_RECHARGE_CREATED = gql`
  subscription OnAccountRechargeCreated($userId: String!, $userType: String!) {
    accountRechargeCreated(userId: $userId, userType: $userType) {
      ...AccountRecharge
    }
  }
  ${ACCOUNT_RECHARGE_ENTITY}
`;

export const ON_TOKEN_TRANSACTION_CREATED = gql`
  subscription OnTokenTransactionCreated($businessId: String!) {
    tokenTransactionCreated(businessId: $businessId) {
      ...TokenTransaction
    }
  }
  ${TOKEN_TRANSACTION_ENTITY}
`;

export const ON_ACCOUNT_BALANCE_UPDATED = gql`
  subscription OnAccountBalanceUpdated($userId: String!, $userType: String!) {
    accountBalanceUpdated(userId: $userId, userType: $userType) {
      totalAmount
      availableAmount
      pendingAmount
      reservedAmount
    }
  }
`;