import { gql } from '@apollo/client';

// ======================
// ORDER ENTITIES
// ======================

export const ORDER_ENTITY = gql`
  fragment OrderEntity on Order {
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
      email
    }
    payment {
      id
      amount
      method
      status
    }
    products {
      id
      quantity
      product {
        id
        title
        price
        imageUrl
      }
    }
    status
  }
`;

export const ORDER_PRODUCT_ENTITY = gql`
  fragment OrderProductEntity on OrderProduct {
    id
    orderId
    productId
    quantity
    order {
      id
      createdAt
    }
    product {
      id
      title
      price
      imageUrl
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_ORDERS = gql`
  query GetOrders(
    $clientId: String
    $businessId: String
    $minTotal: Float
    $maxTotal: Float
    $status: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
  ) {
    orders(
      clientId: $clientId
      businessId: $businessId
      minTotal: $minTotal
      maxTotal: $maxTotal
      status: $status
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        ...OrderEntity
      }
      total
      page
      limit
    }
  }
  ${ORDER_ENTITY}
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: String!) {
    order(id: $id) {
      ...OrderEntity
    }
  }
  ${ORDER_ENTITY}
`;

export const GET_CLIENT_ORDERS = gql`
  query GetClientOrders($clientId: String!, $page: Int = 1, $limit: Int = 20) {
    clientOrders(clientId: $clientId, page: $page, limit: $limit) {
      items {
        ...OrderEntity
      }
      total
      page
      limit
    }
  }
  ${ORDER_ENTITY}
`;

export const GET_BUSINESS_ORDERS = gql`
  query GetBusinessOrders($businessId: String!, $page: Int = 1, $limit: Int = 20) {
    businessOrders(businessId: $businessId, page: $page, limit: $limit) {
      items {
        ...OrderEntity
      }
      total
      page
      limit
    }
  }
  ${ORDER_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ...OrderEntity
    }
  }
  ${ORDER_ENTITY}
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($id: String!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      ...OrderEntity
    }
  }
  ${ORDER_ENTITY}
`;

export const ADD_ORDER_PRODUCT = gql`
  mutation AddOrderProduct($orderId: String!, $input: AddOrderProductInput!) {
    addOrderProduct(orderId: $orderId, input: $input) {
      ...OrderProductEntity
    }
  }
  ${ORDER_PRODUCT_ENTITY}
`;

export const UPDATE_ORDER_PRODUCT = gql`
  mutation UpdateOrderProduct($id: String!, $input: UpdateOrderProductInput!) {
    updateOrderProduct(id: $id, input: $input) {
      ...OrderProductEntity
    }
  }
  ${ORDER_PRODUCT_ENTITY}
`;

export const REMOVE_ORDER_PRODUCT = gql`
  mutation RemoveOrderProduct($id: String!) {
    removeOrderProduct(id: $id) {
      id
    }
  }
`;

export const PROCESS_ORDER_PAYMENT = gql`
  mutation ProcessOrderPayment($orderId: String!, $input: ProcessPaymentInput!) {
    processOrderPayment(orderId: $orderId, input: $input) {
      ...OrderEntity
    }
  }
  ${ORDER_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_ORDER_CREATED = gql`
  subscription OnOrderCreated($clientId: String!, $businessId: String!) {
    orderCreated(clientId: $clientId, businessId: $businessId) {
      ...OrderEntity
    }
  }
  ${ORDER_ENTITY}
`;

export const ON_ORDER_UPDATED = gql`
  subscription OnOrderUpdated($clientId: String!, $businessId: String!) {
    orderUpdated(clientId: $clientId, businessId: $businessId) {
      ...OrderEntity
    }
  }
  ${ORDER_ENTITY}
`;

export const ON_ORDER_PAYMENT_PROCESSED = gql`
  subscription OnOrderPaymentProcessed($orderId: String!) {
    orderPaymentProcessed(orderId: $orderId) {
      ...OrderEntity
    }
  }
  ${ORDER_ENTITY}
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