import { gql } from "@apollo/client";

// 📦 Get All Token Transactions
export const GET_TOKEN_TRANSACTIONS = gql`
  query GetTokenTransactions {
    tokenTransactions {
      id
      businessId
      reOwnedProductId
      repostedProductId
      amount
      type
      isRedeemed
      isReleased
      createdAt
      business {
        id
        name
      }
      reOwnedProduct {
        id
        newProductId
      }
      repostedProduct {
        id
        productId
      }
    }
  }
`;

// 📦 Get Token Transaction by ID
export const GET_TOKEN_TRANSACTION_BY_ID = gql`
  query GetTokenTransactionById($id: String!) {
    tokenTransaction(id: $id) {
      id
      businessId
      reOwnedProductId
      repostedProductId
      amount
      type
      isRedeemed
      isReleased
      createdAt
      business {
        id
        name
      }
      reOwnedProduct {
        id
        newProductId
      }
      repostedProduct {
        id
        productId
      }
    }
  }
`;

// 📦 Get Token Transactions by Business
export const GET_TOKEN_TRANSACTIONS_BY_BUSINESS = gql`
  query GetTokenTransactionsByBusiness($businessId: String!) {
    tokenTransactions(businessId: $businessId) {
      id
      businessId
      reOwnedProductId
      repostedProductId
      amount
      type
      isRedeemed
      isReleased
      createdAt
      business {
        id
        name
      }
      reOwnedProduct {
        id
        newProductId
      }
      repostedProduct {
        id
        productId
      }
    }
  }
`;

// ➕ Create Token Transaction
export const CREATE_TOKEN_TRANSACTION = gql`
  mutation CreateTokenTransaction($createTokenTransactionInput: CreateTokenTransactionInput!) {
    createTokenTransaction(createTokenTransactionInput: $createTokenTransactionInput) {
      id
      businessId
      reOwnedProductId
      repostedProductId
      amount
      type
      isRedeemed
      isReleased
      createdAt
    }
  }
`;

// ✏ Update Token Transaction
export const UPDATE_TOKEN_TRANSACTION = gql`
  mutation UpdateTokenTransaction($id: String!, $updateTokenTransactionInput: UpdateTokenTransactionInput!) {
    updateTokenTransaction(id: $id, updateTokenTransactionInput: $updateTokenTransactionInput) {
      id
      businessId
      reOwnedProductId
      repostedProductId
      amount
      type
      isRedeemed
      isReleased
      createdAt
    }
  }
`;

// ❌ Delete Token Transaction
export const DELETE_TOKEN_TRANSACTION = gql`
  mutation DeleteTokenTransaction($id: String!) {
    deleteTokenTransaction(id: $id) {
      id
    }
  }
`;

/**
 * Utility function to remove __typename from objects.
 */
export const removeTypename: any = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  } else if (obj && typeof obj === 'object') {
    const { __typename, ...rest } = obj;
    return Object.keys(rest).reduce((acc, key) => {
      acc[key] = removeTypename(rest[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};