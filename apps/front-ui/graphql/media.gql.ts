import { gql } from "@apollo/client";

// 📦 Get All Media
export const GET_MEDIA = gql`
  query GetMedia {
    media {
      id
      url
      type
      productId
      createdAt
      product {
        id
        title
      }
    }
  }
`;

// 📦 Get Media by ID
export const GET_MEDIA_BY_ID = gql`
  query GetMediaById($id: String!) {
    mediaItem(id: $id) {
      id
      url
      type
      productId
      createdAt
      product {
        id
        title
      }
    }
  }
`;

// 📦 Get Media by Product
export const GET_MEDIA_BY_PRODUCT = gql`
  query GetMediaByProduct($productId: String!) {
    media(productId: $productId) {
      id
      url
      type
      productId
      createdAt
      product {
        id
        title
      }
    }
  }
`;

// ➕ Create Media
export const CREATE_MEDIA = gql`
  mutation CreateMedia($createMediaInput: CreateMediaInput!) {
    createMedia(createMediaInput: $createMediaInput) {
      id
      url
      type
      productId
      createdAt
    }
  }
`;

// ✏ Update Media
export const UPDATE_MEDIA = gql`
  mutation UpdateMedia($id: String!, $updateMediaInput: UpdateMediaInput!) {
    updateMedia(id: $id, updateMediaInput: $updateMediaInput) {
      id
      url
      type
      productId
      createdAt
    }
  }
`;

// ❌ Delete Media
export const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: String!) {
    deleteMedia(id: $id) {
      id
      productId
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