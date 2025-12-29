import { gql } from '@apollo/client';

// ======================
// QUERIES
// ======================

export const GET_CLIENT_PROFILE = gql`
  query GetClientProfile($id: String!) {
    client(id: $id) {
      id
      fullName
      email
      phone
      avatar
      loyaltyPoints
      loyaltyTier
      totalSpent
      totalOrders
      addresses {
        id
        street
        city
        country
        postalCode
        isDefault
      }
      paymentMethods {
        id
        type
        last4
        isDefault
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CLIENT_ORDERS = gql`
  query GetClientOrders($clientId: String!, $status: String, $page: Int = 1, $limit: Int = 10) {
    clientOrders(clientId: $clientId, status: $status, page: $page, limit: limit) {
      items {
        id
        orderNumber
        status
        totalAmount
        createdAt
        items {
          id
          name
          price
          quantity
          media {
            url
          }
        }
        business {
          id
          name
          avatar
        }
        store {
          id
          name
        }
        paymentMethod {
          type
          last4
        }
        deliveryAddress {
          street
          city
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_CLIENT_REVIEWS = gql`
  query GetClientReviews($clientId: String!, $page: Int = 1, $limit: Int = 10) {
    clientReviews(clientId: $clientId, page: $page, limit: $limit) {
      items {
        id
        rating
        comment
        createdAt
        response {
          id
          comment
          createdAt
        }
        business {
          id
          name
          avatar
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_CLIENT_PROMOTIONS = gql`
  query GetClientPromotions($clientId: String!) {
    clientPromotions(clientId: $clientId) {
      id
      title
      description
      type
      value
      code
      startDate
      endDate
      applicableBusinesses {
        id
        name
        avatar
      }
      applicableCategories
      minimumPurchase
      isRedeemed
    }
  }
`;

export const GET_CLIENT_RECOMMENDATIONS = gql`
  query GetClientRecommendations($clientId: String!) {
    clientRecommendations(clientId: $clientId) {
      id
      type
      title
      description
      items {
        id
        name
        price
        media {
          url
        }
        business {
          id
          name
        }
      }
      reason
      createdAt
    }
  }
`;

export const GET_LOYALTY_PROGRAM = gql`
  query GetLoyaltyProgram($businessId: String!) {
    loyaltyProgram(businessId: $businessId) {
      id
      name
      description
      pointsPerDollar
      redemptionRate
      tiers {
        id
        name
        minPoints
        benefits {
          id
          description
        }
      }
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const UPDATE_CLIENT_PROFILE = gql`
  mutation UpdateClientProfile($id: String!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
    fullName
    email
    phone
    avatar
    loyaltyPoints
    loyaltyTier
    totalSpent
    totalOrders
    addresses {
      id
      street
      city
      country
      postalCode
      isDefault
    }
    paymentMethods {
      id
      type
      last4
      isDefault
    }
    createdAt
    updatedAt
    }
  }
`;

export const ADD_CLIENT_ADDRESS = gql`
  mutation AddClientAddress($clientId: String!, $input: AddressInput!) {
    addClientAddress(clientId: $clientId, input: $input) {
      id
    fullName
    email
    phone
    avatar
    loyaltyPoints
    loyaltyTier
    totalSpent
    totalOrders
    addresses {
      id
      street
      city
      country
      postalCode
      isDefault
    }
    paymentMethods {
      id
      type
      last4
      isDefault
    }
    createdAt
    updatedAt
    }
  }
`;

export const UPDATE_CLIENT_ADDRESS = gql`
  mutation UpdateClientAddress($addressId: String!, $input: AddressInput!) {
    updateClientAddress(addressId: $addressId, input: $input) {
      id
      street
      city
      country
      postalCode
      isDefault
    }
  }
`;

export const DELETE_CLIENT_ADDRESS = gql`
  mutation DeleteClientAddress($addressId: String!) {
    deleteClientAddress(addressId: $addressId) {
      success
    }
  }
`;

export const ADD_CLIENT_PAYMENT_METHOD = gql`
  mutation AddClientPaymentMethod($clientId: String!, $input: PaymentMethodInput!) {
    addClientPaymentMethod(clientId: $clientId, input: $input) {
      id
    fullName
    email
    phone
    avatar
    loyaltyPoints
    loyaltyTier
    totalSpent
    totalOrders
    addresses {
      id
      street
      city
      country
      postalCode
      isDefault
    }
    paymentMethods {
      id
      type
      last4
      isDefault
    }
    createdAt
    updatedAt
    }
  }
`;

export const SET_DEFAULT_PAYMENT_METHOD = gql`
  mutation SetDefaultPaymentMethod($paymentMethodId: String!) {
    setDefaultPaymentMethod(paymentMethodId: $paymentMethodId) {
      id
      isDefault
    }
  }
`;

export const SUBMIT_REVIEW = gql`
  mutation SubmitReview($input: ReviewInput!) {
    submitReview(input: $input) {
      id
    rating
    comment
    createdAt
    response {
      id
      comment
      createdAt
    }
    business {
      id
      name
      avatar
    }
    }
  }
`;

export const REDEEM_LOYALTY_POINTS = gql`
  mutation RedeemLoyaltyPoints($input: RedeemPointsInput!) {
    redeemLoyaltyPoints(input: $input) {
      success
      newBalance
      orderId
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_ORDER_UPDATED = gql`
  subscription OnOrderUpdated($clientId: String!) {
    orderUpdated(clientId: $clientId) {
      id
    orderNumber
    status
    totalAmount
    createdAt
    items {
      id
      name
      price
      quantity
      media {
        url
      }
    }
    business {
      id
      name
      avatar
    }
    store {
      id
      name
    }
    paymentMethod {
      type
      last4
    }
    deliveryAddress {
      street
      city
    }
    }
  }
`;

export const ON_LOYALTY_POINTS_UPDATED = gql`
  subscription OnLoyaltyPointsUpdated($clientId: String!) {
    loyaltyPointsUpdated(clientId: $clientId) {
      id
      loyaltyPoints
      loyaltyTier
    }
  }
`;