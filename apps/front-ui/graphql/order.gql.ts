import { gql } from "@apollo/client";

// ======================
// QUERIES
// ======================

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: String!) {
    order(id: $id) {
    id
    deliveryFee
    receiptUrl
    clientOrderId
    deliveryAddress {
      id
      createdAt
      updatedAt
      clientId
      country
      street
      city
      postalCode
      isDefault
    }
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
        businessId
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
        receiptUrl
        deliveryAddress {
          id
          createdAt
          updatedAt
          clientId
          country
          street
          city
          postalCode
          isDefault
        }
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
        receiptUrl
        deliveryAddress {
          id
      createdAt
      updatedAt
      clientId
      country
      street
      city
      postalCode
      isDefault
        }
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

// export const CREATE_ORDER = gql`
//   mutation CreateOrder($input: CreateOrderInput!) {
//     createOrder(input: $input) {
//     id
//     deliveryFee
//     receiptUrl
//     deliveryAddress {
//       street
//       city
//     }
//     qrCode
//     createdAt
//     updatedAt
//     clientId
//     client {
//       id
//       fullName
//       email
//     }
//     payment {
//       id
//       amount
//       method
//       status
//     }
//     products {
//       id
//       quantity
//       product {
//         id
//         title
//         price
//         medias {
//           url
//         }
//       }
//     }
//     status
//   }
//   }
  
// `;

// export const UPDATE_ORDER = gql`
//   mutation UpdateOrder($id: String!, $input: UpdateOrderInput!) {
//     updateOrder(id: $id, input: $input) {
//     id
//     deliveryFee
//     receiptUrl
//     deliveryAddress {
//       street
//       city
//     }
//     qrCode
//     createdAt
//     updatedAt
//     clientId
//     client {
//       id
//       fullName
//       email
//     }
//     payment {
//       id
//       amount
//       method
//       status
//     }
//     products {
//       id
//       quantity
//       product {
//         id
//         title
//         price
//         medias {
//           url
//         }
//       }
//     }
//     status
//   }
//   }
  
// `;

// export const ADD_ORDER_PRODUCT = gql`
//   mutation AddOrderProduct($orderId: String!, $input: AddOrderProductInput!) {
//     addOrderProduct(orderId: $orderId, input: $input) {
//     id
//     orderId
//     productId
//     quantity
//     order {
//       id
//       createdAt
//     }
//     product {
//       id
//       title
//       price
//       medias {
//         url
//       }
//     }
//   }
//   }
  
// `;

// export const UPDATE_ORDER_PRODUCT = gql`
//   mutation UpdateOrderProduct($id: String!, $input: UpdateOrderProductInput!) {
//     updateOrderProduct(id: $id, input: $input) {
//     id
//     orderId
//     productId
//     quantity
//     order {
//       id
//       createdAt
//     }
//     product {
//       id
//       title
//       price
//       medias {
//         url
//       }
//     }
//   }
//   }
  
// `;

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
    receiptUrl
    deliveryAddress {
      id
      createdAt
      updatedAt
      clientId
      country
      street
      city
      postalCode
      isDefault
    }
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

export const GENERATE_ORDER_RECEIPT = gql`
  mutation GenerateOrderReceipt($input: GenerateOrderReceiptInput!) {
    generateOrderReceipt(input: $input) {
      receiptUrl
      fileName
      mediaId
      emailSent
    }
  }
`;

// ======================
// NEW ENTITIES FOR BUSINESS-GROUPED ORDERS
// ======================

export const BUSINESS_GROUPED_ORDER_ENTITY = gql`
  fragment BusinessGroupedOrderEntity on BusinessGroupedOrder {
    businessId
    business {
      id
      name
      avatar
      businessType
      paymentConfig {
        supportedPaymentMethods
      }
    }
    items {
      id
      productId
      product {
        id
        title
        price
        medias {
          url
        }
      }
      quantity
    }
    subtotal
    deliveryFee
    receiptUrl
    total
    payment {
      id
      amount
      method
      status
      qrCode
    }
  }
`;

export const PROMOTION_ENTITY = gql`
  fragment PromotionEntity on Promotion {
    id
    name
    description
    discountType
    discountValue
    applicableBusinesses {
      id
      name
    }
    applicableCategories
    minimumPurchase
    startDate
    endDate
    isRedeemed
  }
`;


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
        receiptUrl
        deliveryAddress {
          id
      createdAt
      updatedAt
      clientId
      country
      street
      city
      postalCode
      isDefault
        }
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

export const GET_BUSINESS_GROUPED_CART = gql`
  query GetBusinessGroupedCart($cartItems: [CartItemInput!]!) {
    businessGroupedCart(cartItems: $cartItems) {
      ...BusinessGroupedOrderEntity
    }
  }
  ${BUSINESS_GROUPED_ORDER_ENTITY}
`;

export const GET_PROMOTIONS = gql`
  query GetPromotions(
    $businessId: String
    $minPurchase: Float
    $activeOnly: Boolean = true
  ) {
    promotions(
      businessId: $businessId
      minPurchase: $minPurchase
      activeOnly: $activeOnly
    ) {
      ...PromotionEntity
    }
  }
  ${PROMOTION_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_GROUPED_ORDER = gql`
  mutation CreateGroupedOrder($input: CreateGroupedOrderInput!) {
    createGroupedOrder(input: $input) {
      id
      businessOrders {
        businessId
        orderId
        paymentStatus
      }
      totalAmount
      qrCode
      paymentMethod
    }
  }
`;

export const APPLY_PROMOTION = gql`
  mutation ApplyPromotion($code: String!, $cartItems: [CartItemInput!]!) {
    applyPromotion(code: $code, cartItems: $cartItems) {
      success
      message
      discountedTotal
      promotionsApplied {
        ...PromotionEntity
      }
    }
  }
  ${PROMOTION_ENTITY}
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      deliveryFee
      receiptUrl
      deliveryAddress {
        street
        city
      }
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
      receiptUrl
      deliveryAddress {
        street
        city
      }
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
    receiptUrl
    deliveryAddress {
      street
      city
    }
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
    receiptUrl
    deliveryAddress {
      street
      city
    }
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
    receiptUrl
    deliveryAddress {
      street
      city
    }
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
	} else if (obj && typeof obj === "object") {
		const { __typename, ...rest } = obj;
		return Object.keys(rest).reduce((acc, key) => {
			acc[key] = removeTypename(rest[key]);
			return acc;
		}, {} as any);
	}
	return obj;
};
