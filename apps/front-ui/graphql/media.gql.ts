import { gql } from '@apollo/client';

// ======================
// MEDIA ENTITIES
// ======================

export const MEDIA_ENTITY = gql`
  fragment MediaEntity on Media {
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
`;

// ======================
// QUERIES
// ======================

export const GET_MEDIA = gql`
  query GetMedia(
    $productId: String
    $type: MediaType
    $page: Int = 1
    $limit: Int = 20
  ) {
    media(
      productId: $productId
      type: $type
      page: $page
      limit: $limit
    ) {
      items {
        ...MediaEntity
      }
      total
      page
      limit
    }
  }
  ${MEDIA_ENTITY}
`;

export const GET_MEDIA_BY_ID = gql`
  query GetMediaById($id: String!) {
    media(id: $id) {
      ...MediaEntity
    }
  }
  ${MEDIA_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_MEDIA = gql`
  mutation CreateMedia($input: CreateMediaInput!) {
    createMedia(input: $input) {
      ...MediaEntity
    }
  }
  ${MEDIA_ENTITY}
`;

export const UPDATE_MEDIA = gql`
  mutation UpdateMedia($id: String!, $input: UpdateMediaInput!) {
    updateMedia(id: $id, input: $input) {
      ...MediaEntity
    }
  }
  ${MEDIA_ENTITY}
`;

export const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: String!) {
    deleteMedia(id: $id) {
      id
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_MEDIA_CREATED = gql`
  subscription OnMediaCreated($productId: String!) {
    mediaCreated(productId: $productId) {
      ...MediaEntity
    }
  }
  ${MEDIA_ENTITY}
`;

export const ON_MEDIA_UPDATED = gql`
  subscription OnMediaUpdated($productId: String!) {
    mediaUpdated(productId: $productId) {
      ...MediaEntity
    }
  }
  ${MEDIA_ENTITY}
`;

export const ON_MEDIA_DELETED = gql`
  subscription OnMediaDeleted($productId: String!) {
    mediaDeleted(productId: $productId) {
      id
    }
  }
`;