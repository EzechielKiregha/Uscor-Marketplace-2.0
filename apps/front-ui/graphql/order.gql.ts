import { gql } from '@apollo/client';

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
            medias {
              url
            }
          }
        }
        status
      }
      total
      page
      limit
    }
  }
  
`;

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
        medias {
          url
        }
      }
    }
    status
  }
  }
  
`;

export const GET_CLIENT_ORDERS = gql`
  query GetClientOrders($clientId: String!, $page: Int = 1, $limit: Int = 20) {
    clientOrders(clientId: $clientId, page: $page, limit: $limit) {
      items {
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
            medias {
              url
            }
          }
        }
        status
      }
      total
      page
      limit
    }
  }
  
`;

export const GET_BUSINESS_ORDERS = gql`
  query GetBusinessOrders($businessId: String!, $page: Int = 1, $limit: Int = 20) {
    businessOrders(businessId: $businessId, page: $page, limit: $limit) {
      items {
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
            medias {
              url
            }
          }
        }
        status
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

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
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
        medias {
          url
        }
      }
    }
    status
  }
  }
  
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($id: String!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
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
        medias {
          url
        }
      }
    }
    status
  }
  }
  
`;

export const ADD_ORDER_PRODUCT = gql`
  mutation AddOrderProduct($orderId: String!, $input: AddOrderProductInput!) {
    addOrderProduct(orderId: $orderId, input: $input) {
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
      medias {
        url
      }
    }
  }
  }
  
`;

export const UPDATE_ORDER_PRODUCT = gql`
  mutation UpdateOrderProduct($id: String!, $input: UpdateOrderProductInput!) {
    updateOrderProduct(id: $id, input: $input) {
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
      medias {
        url
      }
    }
  }
  }
  
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
        medias {
          url
        }
      }
    }
    status
  }
  }
  
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_ORDER_CREATED = gql`
  subscription OnOrderCreated($clientId: String!, $businessId: String!) {
    orderCreated(clientId: $clientId, businessId: $businessId) {
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
        medias {
          url
        }
      }
    }
    status
  }
  }
  
`;

export const ON_ORDER_UPDATED = gql`
  subscription OnOrderUpdated($clientId: String!, $businessId: String!) {
    orderUpdated(clientId: $clientId, businessId: $businessId) {
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
        medias {
          url
        }
      }
    }
    status
  }
  }
  
`;

export const ON_ORDER_PAYMENT_PROCESSED = gql`
  subscription OnOrderPaymentProcessed($orderId: String!) {
    orderPaymentProcessed(orderId: $orderId) {
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
        medias {
          url
        }
      }
    }
    status
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