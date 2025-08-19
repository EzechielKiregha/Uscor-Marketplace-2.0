import { gql } from '@apollo/client';

// ======================
// REVIEW ENTITIES
// ======================

export const REVIEW_ENTITY = gql`
  fragment ReviewEntity on Review {
    id
    clientId
    client {
      id
      fullName
      avatar
    }
    productId
    product {
      id
      title
      price
    }
    rating
    comment
    createdAt
    updatedAt
    helpfulVotes
    images {
      id
      url
      type
    }
  }
`;

export const REVIEW_VOTE_ENTITY = gql`
  fragment ReviewVoteEntity on ReviewVote {
    id
    reviewId
    userId
    voteType
    createdAt
    review {
      id
      rating
      comment
    }
  }
`;

export const PRODUCT_RATING_ENTITY = gql`
  fragment ProductRatingEntity on ProductRating {
    productId
    averageRating
    totalReviews
    ratingDistribution {
      rating
      count
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_REVIEWS = gql`
  query GetReviews(
    $productId: String
    $clientId: String
    $minRating: Int
    $maxRating: Int
    $hasComment: Boolean
    $page: Int = 1
    $limit: Int = 20
  ) {
    reviews(
      productId: $productId
      clientId: $clientId
      minRating: $minRating
      maxRating: $maxRating
      hasComment: $hasComment
      page: $page
      limit: $limit
    ) {
      items {
        ...ReviewEntity
      }
      total
      page
      limit
    }
  }
  ${REVIEW_ENTITY}
`;

export const GET_REVIEW_BY_ID = gql`
  query GetReviewById($id: String!) {
    review(id: $id) {
      ...ReviewEntity
    }
  }
  ${REVIEW_ENTITY}
`;

export const GET_REVIEW_VOTES = gql`
  query GetReviewVotes(
    $reviewId: String
    $userId: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    reviewVotes(
      reviewId: $reviewId
      userId: $userId
      page: $page
      limit: $limit
    ) {
      items {
        ...ReviewVoteEntity
      }
      total
      page
      limit
    }
  }
  ${REVIEW_VOTE_ENTITY}
`;

export const GET_PRODUCT_RATINGS = gql`
  query GetProductRatings($productId: String!) {
    productRatings(productId: $productId) {
      ...ProductRatingEntity
    }
  }
  ${PRODUCT_RATING_ENTITY}
`;

export const GET_CLIENT_REVIEWS = gql`
  query GetClientReviews($clientId: String!, $page: Int = 1, $limit: Int = 20) {
    clientReviews(clientId: $clientId, page: $page, limit: $limit) {
      items {
        ...ReviewEntity
      }
      total
      page
      limit
    }
  }
  ${REVIEW_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      ...ReviewEntity
    }
  }
  ${REVIEW_ENTITY}
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($id: String!, $input: UpdateReviewInput!) {
    updateReview(id: $id, input: $input) {
      ...ReviewEntity
    }
  }
  ${REVIEW_ENTITY}
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: String!) {
    deleteReview(id: $id) {
      id
    }
  }
`;

export const VOTE_ON_REVIEW = gql`
  mutation VoteOnReview($input: VoteOnReviewInput!) {
    voteOnReview(input: $input) {
      ...ReviewVoteEntity
    }
  }
  ${REVIEW_VOTE_ENTITY}
`;

export const REPORT_REVIEW = gql`
  mutation ReportReview($input: ReportReviewInput!) {
    reportReview(input: $input) {
      success
      message
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_REVIEW_CREATED = gql`
  subscription OnReviewCreated($productId: String!) {
    reviewCreated(productId: $productId) {
      ...ReviewEntity
    }
  }
  ${REVIEW_ENTITY}
`;

export const ON_REVIEW_UPDATED = gql`
  subscription OnReviewUpdated($productId: String!) {
    reviewUpdated(productId: $productId) {
      ...ReviewEntity
    }
  }
  ${REVIEW_ENTITY}
`;

export const ON_REVIEW_DELETED = gql`
  subscription OnReviewDeleted($productId: String!) {
    reviewDeleted(productId: $productId) {
      id
    }
  }
`;

export const ON_REVIEW_VOTE_CREATED = gql`
  subscription OnReviewVoteCreated($reviewId: String!) {
    reviewVoteCreated(reviewId: $reviewId) {
      ...ReviewVoteEntity
    }
  }
  ${REVIEW_VOTE_ENTITY}
`;