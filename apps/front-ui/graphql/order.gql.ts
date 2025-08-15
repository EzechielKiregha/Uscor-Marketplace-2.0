import { gql } from "@apollo/client";

// 📦 Get All Orders
export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      deliveryFee
      deliveryAddress
      qrCode
      createdAt
      updatedAt
      clientId
      client {
        id
        fullName
      }
      payment {
        id
        amount
        status
      }
      products {
        id
        quantity
        product {
          id
          title
        }
      }
    }
  }
`;

// 📦 Get Order by ID
export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: String!) {
    order(id: $id) {
      id
      deliveryFee
      deliveryAddress
      qrCode
      createdAt
      updatedAt
      clientId
      client {
        id
        fullName
      }
      payment {
        id
        amount
        status
      }
      products {
        id
        quantity
        product {
          id
          title
        }
      }
    }
  }
`;

// ➕ Create Order
export const CREATE_ORDER = gql`
  mutation CreateOrder($createOrderInput: CreateOrderInput!) {
    createOrder(createOrderInput: $createOrderInput) {
      id
      deliveryFee
      deliveryAddress
      qrCode
      createdAt
      updatedAt
      clientId
    }
  }
`;

// ✏ Update Order
export const UPDATE_ORDER = gql`
  mutation UpdateOrder($id: String!, $updateOrderInput: UpdateOrderInput!) {
    updateOrder(id: $id, updateOrderInput: $updateOrderInput) {
      id
      deliveryFee
      deliveryAddress
      qrCode
      createdAt
      updatedAt
      clientId
    }
  }
`;

// ❌ Delete Order
export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: String!) {
    deleteOrder(id: $id) {
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