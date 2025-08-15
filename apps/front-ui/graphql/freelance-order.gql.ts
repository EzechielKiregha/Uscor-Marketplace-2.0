import { gql } from "@apollo/client";

// 📦 Get All Freelance Orders
export const GET_FREELANCE_ORDERS = gql`
  query GetFreelanceOrders {
    freelanceOrders {
      id
      status
      quantity
      totalAmount
      escrowAmount
      commissionPercent
      escrowStatus
      createdAt
      escrowReleasedAt
      client {
        id
        username
      }
      service {
        id
        title
      }
      freelanceOrderBusiness {
        id
        role
        business {
          id
          name
        }
      }
      payment {
        id
        amount
        status
      }
    }
  }
`;

// 📦 Get Freelance Order by ID
export const GET_FREELANCE_ORDER_BY_ID = gql`
  query GetFreelanceOrderById($id: String!) {
    freelanceOrder(id: $id) {
      id
      status
      quantity
      totalAmount
      escrowAmount
      commissionPercent
      escrowStatus
      createdAt
      escrowReleasedAt
      client {
        id
        username
      }
      service {
        id
        title
      }
      freelanceOrderBusiness {
        id
        role
        business {
          id
          name
        }
      }
      payment {
        id
        amount
        status
      }
    }
  }
`;

// 📦 Get Freelance Orders by Client
export const GET_FREELANCE_ORDERS_BY_CLIENT = gql`
  query GetFreelanceOrdersByClient($clientId: String!) {
    freelanceOrders(clientId: $clientId) {
      id
      status
      quantity
      totalAmount
      escrowAmount
      commissionPercent
      escrowStatus
      createdAt
      escrowReleasedAt
      client {
        id
        username
      }
      service {
        id
        title
      }
      freelanceOrderBusiness {
        id
        role
        business {
          id
          name
        }
      }
      payment {
        id
        amount
        status
      }
    }
  }
`;

// ➕ Create Freelance Order
export const CREATE_FREELANCE_ORDER = gql`
  mutation CreateFreelanceOrder($createFreelanceOrderInput: CreateFreelanceOrderInput!) {
    createFreelanceOrder(createFreelanceOrderInput: $createFreelanceOrderInput) {
      id
      status
      quantity
      totalAmount
      escrowAmount
      commissionPercent
      escrowStatus
      createdAt
      escrowReleasedAt
    }
  }
`;

// ✏ Update Freelance Order
export const UPDATE_FREELANCE_ORDER = gql`
  mutation UpdateFreelanceOrder($id: String!, $updateFreelanceOrderInput: UpdateFreelanceOrderInput!) {
    updateFreelanceOrder(id: $id, updateFreelanceOrderInput: $updateFreelanceOrderInput) {
      id
      status
      quantity
      totalAmount
      escrowAmount
      commissionPercent
      escrowStatus
      createdAt
      escrowReleasedAt
    }
  }
`;

// ❌ Delete Freelance Order
export const DELETE_FREELANCE_ORDER = gql`
  mutation DeleteFreelanceOrder($id: String!) {
    deleteFreelanceOrder(id: $id) {
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