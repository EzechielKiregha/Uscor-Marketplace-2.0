import { gql } from '@apollo/client';

// ======================
// SHIPPING ENTITIES
// ======================

export const SHIPPING_ENTITY = gql`
  fragment ShippingEntity on Shipping {
    id
    reOwnedProductId
    reOwnedProduct {
      id
      newProduct {
        title
        price
      }
      originalProduct {
        title
      }
    }
    orderId
    order {
      id
      deliveryAddress
      deliveryFee
    }
    status
    trackingNumber
    carrier
    shippedAt
    deliveredAt
    createdAt
    updatedAt
    shippingAddress {
      address
      city
      state
      postalCode
      country
    }
  }
`;

export const SHIPPING_METHOD_ENTITY = gql`
  fragment ShippingMethodEntity on ShippingMethod {
    id
    name
    description
    price
    estimatedDeliveryDays
    isAvailable
    createdAt
    updatedAt
    business {
      id
      name
    }
    country
    region
  }
`;

export const SHIPPING_RATE_ENTITY = gql`
  fragment ShippingRateEntity on ShippingRate {
    id
    shippingMethodId
    minOrderValue
    maxOrderValue
    price
    country
    region
    createdAt
    updatedAt
  }
`;

// ======================
// QUERIES
// ======================

export const GET_SHIPPING = gql`
  query GetShipping(
    $orderId: String
    $reOwnedProductId: String
    $status: String
    $carrier: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    shipping(
      orderId: $orderId
      reOwnedProductId: $reOwnedProductId
      status: $status
      carrier: $carrier
      page: $page
      limit: $limit
    ) {
      items {
        ...ShippingEntity
      }
      total
      page
      limit
    }
  }
  ${SHIPPING_ENTITY}
`;

export const GET_SHIPPING_BY_ID = gql`
  query GetShippingById($id: String!) {
    shipping(id: $id) {
      ...ShippingEntity
    }
  }
  ${SHIPPING_ENTITY}
`;

export const GET_SHIPPING_METHODS = gql`
  query GetShippingMethods(
    $businessId: String
    $country: String
    $region: String
    $isAvailable: Boolean
  ) {
    shippingMethods(
      businessId: $businessId
      country: $country
      region: $region
      isAvailable: $isAvailable
    ) {
      ...ShippingMethodEntity
    }
  }
  ${SHIPPING_METHOD_ENTITY}
`;

export const GET_SHIPPING_RATES = gql`
  query GetShippingRates(
    $shippingMethodId: String
    $country: String
    $region: String
  ) {
    shippingRates(
      shippingMethodId: $shippingMethodId
      country: $country
      region: $region
    ) {
      ...ShippingRateEntity
    }
  }
  ${SHIPPING_RATE_ENTITY}
`;

export const CALCULATE_SHIPPING = gql`
  query CalculateShipping($input: CalculateShippingInput!) {
    calculateShipping(input: $input) {
      method
      price
      estimatedDeliveryDays
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_SHIPPING = gql`
  mutation CreateShipping($input: CreateShippingInput!) {
    createShipping(input: $input) {
      ...ShippingEntity
    }
  }
  ${SHIPPING_ENTITY}
`;

export const UPDATE_SHIPPING = gql`
  mutation UpdateShipping($id: String!, $input: UpdateShippingInput!) {
    updateShipping(id: $id, input: $input) {
      ...ShippingEntity
    }
  }
  ${SHIPPING_ENTITY}
`;

export const TRACK_SHIPPING = gql`
  mutation TrackShipping($trackingNumber: String!) {
    trackShipping(trackingNumber: $trackingNumber) {
      status
      location
      estimatedDelivery
      updates {
        date
        status
        location
      }
    }
  }
`;

export const CREATE_SHIPPING_METHOD = gql`
  mutation CreateShippingMethod($input: CreateShippingMethodInput!) {
    createShippingMethod(input: $input) {
      ...ShippingMethodEntity
    }
  }
  ${SHIPPING_METHOD_ENTITY}
`;

export const UPDATE_SHIPPING_METHOD = gql`
  mutation UpdateShippingMethod($id: String!, $input: UpdateShippingMethodInput!) {
    updateShippingMethod(id: $id, input: $input) {
      ...ShippingMethodEntity
    }
  }
  ${SHIPPING_METHOD_ENTITY}
`;

export const CREATE_SHIPPING_RATE = gql`
  mutation CreateShippingRate($input: CreateShippingRateInput!) {
    createShippingRate(input: $input) {
      ...ShippingRateEntity
    }
  }
  ${SHIPPING_RATE_ENTITY}
`;

export const UPDATE_SHIPPING_RATE = gql`
  mutation UpdateShippingRate($id: String!, $input: UpdateShippingRateInput!) {
    updateShippingRate(id: $id, input: $input) {
      ...ShippingRateEntity
    }
  }
  ${SHIPPING_RATE_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_SHIPPING_CREATED = gql`
  subscription OnShippingCreated($orderId: String!) {
    shippingCreated(orderId: $orderId) {
      ...ShippingEntity
    }
  }
  ${SHIPPING_ENTITY}
`;

export const ON_SHIPPING_UPDATED = gql`
  subscription OnShippingUpdated($orderId: String!) {
    shippingUpdated(orderId: $orderId) {
      ...ShippingEntity
    }
  }
  ${SHIPPING_ENTITY}
`;

export const ON_SHIPPING_TRACKING_UPDATE = gql`
  subscription OnShippingTrackingUpdate($trackingNumber: String!) {
    shippingTrackingUpdate(trackingNumber: $trackingNumber) {
      status
      location
      estimatedDelivery
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