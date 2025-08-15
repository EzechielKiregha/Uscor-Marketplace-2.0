import { gql } from "@apollo/client";

// 📦 Get All Shipments
export const GET_SHIPMENTS = gql`
  query GetShipments {
    shipments {
      id
      reOwnedProductId
      status
      trackingNumber
      carrier
      shippedAt
      deliveredAt
      createdAt
      reOwnedProduct {
        id
        newProductId
      }
    }
  }
`;

// 📦 Get Shipment by ID
export const GET_SHIPMENT_BY_ID = gql`
  query GetShipmentById($id: String!) {
    shipment(id: $id) {
      id
      reOwnedProductId
      status
      trackingNumber
      carrier
      shippedAt
      deliveredAt
      createdAt
      reOwnedProduct {
        id
        newProductId
      }
    }
  }
`;

// 📦 Get Shipments by ReOwned Product
export const GET_SHIPMENTS_BY_REOWNED_PRODUCT = gql`
  query GetShipmentsByReOwnedProduct($reOwnedProductId: String!) {
    shipments(reOwnedProductId: $reOwnedProductId) {
      id
      reOwnedProductId
      status
      trackingNumber
      carrier
      shippedAt
      deliveredAt
      createdAt
      reOwnedProduct {
        id
        newProductId
      }
    }
  }
`;

// ➕ Create Shipment
export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($createShipmentInput: CreateShipmentInput!) {
    createShipment(createShipmentInput: $createShipmentInput) {
      id
      reOwnedProductId
      status
      trackingNumber
      carrier
      shippedAt
      deliveredAt
      createdAt
    }
  }
`;

// ✏ Update Shipment
export const UPDATE_SHIPMENT = gql`
  mutation UpdateShipment($id: String!, $updateShipmentInput: UpdateShipmentInput!) {
    updateShipment(id: $id, updateShipmentInput: $updateShipmentInput) {
      id
      reOwnedProductId
      status
      trackingNumber
      carrier
      shippedAt
      deliveredAt
      createdAt
    }
  }
`;

// ❌ Delete Shipment
export const DELETE_SHIPMENT = gql`
  mutation DeleteShipment($id: String!) {
    deleteShipment(id: $id) {
      id
      reOwnedProductId
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