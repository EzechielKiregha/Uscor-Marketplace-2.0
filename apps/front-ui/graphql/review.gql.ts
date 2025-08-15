import { gql } from "@apollo/client";

// 📦 Get All Reviews
export const GET_REVIEWS = gql`
  query GetReviews {
    reviews {
      id
      clientId
      productId
      rating
      comment
      createdAt
      client {
        id
        fullName
      }
      product {
        id
        title
      }
    }
  }
`;

// 📦 Get Review by ID
export const GET_REVIEW_BY_ID = gql`
  query GetReviewById($id: String!) {
    review(id: $id) {
      id
      clientId
      productId
      rating
      comment
      createdAt
      client {
        id
        fullName
      }
      product {
        id
        title
      }
    }
  }
`;

// 📦 Get Reviews by Product
export const GET_REVIEWS_BY_PRODUCT = gql`
  query GetReviewsByProduct($productId: String!) {
    reviews(productId: $productId) {
      id
      clientId
      productId
      rating
      comment
      createdAt
      client {
        id
        fullName
      }
      product {
        id
        title
      }
    }
  }
`;

// ➕ Create Review
export const CREATE_REVIEW = gql`
  mutation CreateReview($createReviewInput: CreateReviewInput!) {
    createReview(createReviewInput: $createReviewInput) {
      id
      clientId
      productId
      rating
      comment
      createdAt
    }
  }
`;

// ✏ Update Review
export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: String!, $updateReviewInput: UpdateReviewInput!) {
    updateReview(id: $id, updateReviewInput: $updateReviewInput) {
      id
      clientId
      productId
      rating
      comment
      createdAt
    }
  }
`;

// ❌ Delete Review
export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: String!) {
    deleteReview(id: $id) {
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