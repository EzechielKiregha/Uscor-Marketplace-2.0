import { gql } from "@apollo/client";

// 📦 Get All Payment Transactions
export const GET_PAYMENT_TRANSACTIONS = gql`
  query GetPaymentTransactions {
    paymentTransactions {
      id
      amount
      method
      status
      transactionDate
      qrCode
      createdAt
      order {
        id
        clientId
      }
      PostTransaction {
        id
        amount
        status
      }
    }
  }
`;

// 📦 Get Payment Transaction by ID
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
        clientId
      }
      PostTransaction {
        id
        amount
        status
      }
    }
  }
`;

// 📦 Get Payment Transactions by Order
export const GET_PAYMENT_TRANSACTIONS_BY_ORDER = gql`
  query GetPaymentTransactionsByOrder($orderId: String!) {
    paymentTransactions(orderId: $orderId) {
      id
      amount
      method
      status
      transactionDate
      qrCode
      createdAt
      order {
        id
        clientId
      }
      PostTransaction {
        id
        amount
        status
      }
    }
  }
`;

// ➕ Create Payment Transaction
export const CREATE_PAYMENT_TRANSACTION = gql`
  mutation CreatePaymentTransaction($createPaymentTransactionInput: CreatePaymentTransactionInput!) {
    createPaymentTransaction(createPaymentTransactionInput: $createPaymentTransactionInput) {
      id
      amount
      method
      status
      transactionDate
      qrCode
      createdAt
    }
  }
`;

// ✏ Update Payment Transaction
export const UPDATE_PAYMENT_TRANSACTION = gql`
  mutation UpdatePaymentTransaction($id: String!, $updatePaymentTransactionInput: UpdatePaymentTransactionInput!) {
    updatePaymentTransaction(id: $id, updatePaymentTransactionInput: $updatePaymentTransactionInput) {
      id
      amount
      method
      status
      transactionDate
      qrCode
      createdAt
    }
  }
`;

// ❌ Delete Payment Transaction
export const DELETE_PAYMENT_TRANSACTION = gql`
  mutation DeletePaymentTransaction($id: String!) {
    deletePaymentTransaction(id: $id) {
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