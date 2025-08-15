import { gql } from "@apollo/client";

// 📦 Get All Order Products
export const GET_ORDER_PRODUCTS = gql`
  query GetOrderProducts {
    orderProducts {
      id
      orderId
      productId
      quantity
      order {
        id
        clientId
      }
      product {
        id
        title
      }
    }
  }
`;

// 📦 Get Order Product by ID
export const GET_ORDER_PRODUCT_BY_ID = gql`
  query GetOrderProductById($id: String!) {
    orderProduct(id: $id) {
      id
      orderId
      productId
      quantity
      order {
        id
        clientId
      }
      product {
        id
        title
      }
    }
  }
`;

// 📦 Get Order Products by Order
export const GET_ORDER_PRODUCTS_BY_ORDER = gql`
  query GetOrderProductsByOrder($orderId: String!) {
    orderProducts(orderId: $orderId) {
      id
      orderId
      productId
      quantity
      order {
        id
        clientId
      }
      product {
        id
        title
      }
    }
  }
`;

// ➕ Create Order Product
export const CREATE_ORDER_PRODUCT = gql`
  mutation CreateOrderProduct($createOrderProductInput: CreateOrderProductInput!) {
    createOrderProduct(createOrderProductInput: $createOrderProductInput) {
      id
      orderId
      productId
      quantity
    }
  }
`;

// ✏ Update Order Product
export const UPDATE_ORDER_PRODUCT = gql`
  mutation UpdateOrderProduct($id: String!, $updateOrderProductInput: UpdateOrderProductInput!) {
    updateOrderProduct(id: $id, updateOrderProductInput: $updateOrderProductInput) {
      id
      orderId
      productId
      quantity
    }
  }
`;

// ❌ Delete Order Product
export const DELETE_ORDER_PRODUCT = gql`
  mutation DeleteOrderProduct($id: String!) {
    deleteOrderProduct(id: $id) {
      id
      orderId
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