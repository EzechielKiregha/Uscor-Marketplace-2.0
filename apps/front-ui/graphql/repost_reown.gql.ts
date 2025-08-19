import { gql } from '@apollo/client';

// ======================
// REPOST & REOWN ENTITIES
// ======================

export const REPOSTED_PRODUCT_ENTITY = gql`
  fragment RepostedProductEntity on RepostedProduct {
    id
    productId
    product {
      id
      title
      price
      description
    }
    businessId
    business {
      id
      name
      avatar
    }
    markupPercentage
    createdAt
    repostedAt
    repostedBy {
      id
      role
      client {
        id
        fullName
      }
      business {
        id
        name
      }
    }
    tokenTransaction {
      id
      amount
      type
    }
  }
`;

export const REOWNED_PRODUCT_ENTITY = gql`
  fragment ReOwnedProductEntity on ReOwnedProduct {
    id
    newProductId
    newProduct {
      id
      title
      price
      description
    }
    originalProductId
    originalProduct {
      id
      title
      price
    }
    oldOwnerId
    newOwnerId
    quantity
    oldPrice
    newPrice
    markupPercentage
    agreedViaChatId
    agreementDate
    isOriginalApproved
    isNewOwnerApproved
    shippingId
    shipping {
      id
      status
      trackingNumber
      carrier
    }
    createdAt
    originalOwner {
      id
      role
      client {
        id
        fullName
      }
      business {
        id
        name
      }
    }
    newOwner {
      id
      role
      client {
        id
        fullName
      }
      business {
        id
        name
      }
    }
  }
`;

export const AGREEMENT_ENTITY = gql`
  fragment AgreementEntity on Agreement {
    id
    chatId
    chat {
      id
      status
    }
    negotiationType
    terms
    isApprovedByOriginalOwner
    isApprovedByNewOwner
    approvedBy
    approvedAt
    createdAt
    updatedAt
  }
`;

// ======================
// QUERIES
// ======================

export const GET_REPOSTED_PRODUCTS = gql`
  query GetRepostedProducts(
    $businessId: String
    $productId: String
    $minMarkup: Float
    $maxMarkup: Float
    $page: Int = 1
    $limit: Int = 20
  ) {
    repostedProducts(
      businessId: $businessId
      productId: $productId
      minMarkup: $minMarkup
      maxMarkup: $maxMarkup
      page: $page
      limit: $limit
    ) {
      items {
        ...RepostedProductEntity
      }
      total
      page
      limit
    }
  }
  ${REPOSTED_PRODUCT_ENTITY}
`;

export const GET_REPOSTED_PRODUCT_BY_ID = gql`
  query GetRepostedProductById($id: String!) {
    repostedProduct(id: $id) {
      ...RepostedProductEntity
    }
  }
  ${REPOSTED_PRODUCT_ENTITY}
`;

export const GET_REOWNED_PRODUCTS = gql`
  query GetReownedProducts(
    $originalOwnerId: String
    $newOwnerId: String
    $productId: String
    $minMarkup: Float
    $maxMarkup: Float
    $page: Int = 1
    $limit: Int = 20
  ) {
    reownedProducts(
      originalOwnerId: $originalOwnerId
      newOwnerId: $newOwnerId
      productId: $productId
      minMarkup: $minMarkup
      maxMarkup: $maxMarkup
      page: $page
      limit: $limit
    ) {
      items {
        ...ReOwnedProductEntity
      }
      total
      page
      limit
    }
  }
  ${REOWNED_PRODUCT_ENTITY}
`;

export const GET_REOWNED_PRODUCT_BY_ID = gql`
  query GetReownedProductById($id: String!) {
    reownedProduct(id: $id) {
      ...ReOwnedProductEntity
    }
  }
  ${REOWNED_PRODUCT_ENTITY}
`;

export const GET_AGREEMENTS = gql`
  query GetAgreements(
    $chatId: String
    $negotiationType: NegotiationType
    $page: Int = 1
    $limit: Int = 20
  ) {
    agreements(
      chatId: $chatId
      negotiationType: $negotiationType
      page: $page
      limit: $limit
    ) {
      items {
        ...AgreementEntity
      }
      total
      page
      limit
    }
  }
  ${AGREEMENT_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const REPOST_PRODUCT = gql`
  mutation RepostProduct($input: RepostProductInput!) {
    repostProduct(input: $input) {
      ...RepostedProductEntity
    }
  }
  ${REPOSTED_PRODUCT_ENTITY}
`;

export const UPDATE_REPOST = gql`
  mutation UpdateRepost($id: String!, $input: UpdateRepostInput!) {
    updateRepost(id: $id, input: $input) {
      ...RepostedProductEntity
    }
  }
  ${REPOSTED_PRODUCT_ENTITY}
`;

export const DELETE_REPOST = gql`
  mutation DeleteRepost($id: String!) {
    deleteRepost(id: $id) {
      id
    }
  }
`;

export const REOWN_PRODUCT = gql`
  mutation ReownProduct($input: ReownProductInput!) {
    reownProduct(input: $input) {
      ...ReOwnedProductEntity
    }
  }
  ${REOWNED_PRODUCT_ENTITY}
`;

export const UPDATE_REOWN_AGREEMENT = gql`
  mutation UpdateReownAgreement($input: UpdateReownAgreementInput!) {
    updateReownAgreement(input: $input) {
      ...AgreementEntity
    }
  }
  ${AGREEMENT_ENTITY}
`;

export const APPROVE_REOWN_AGREEMENT = gql`
  mutation ApproveReownAgreement($agreementId: String!, $approverType: AgreementApproverType!) {
    approveReownAgreement(agreementId: $agreementId, approverType: $approverType) {
      ...AgreementEntity
    }
  }
  ${AGREEMENT_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_REPOST_CREATED = gql`
  subscription OnRepostCreated($businessId: String!) {
    repostCreated(businessId: $businessId) {
      ...RepostedProductEntity
    }
  }
  ${REPOSTED_PRODUCT_ENTITY}
`;

export const ON_REPOST_UPDATED = gql`
  subscription OnRepostUpdated($businessId: String!) {
    repostUpdated(businessId: $businessId) {
      ...RepostedProductEntity
    }
  }
  ${REPOSTED_PRODUCT_ENTITY}
`;

export const ON_REOWN_CREATED = gql`
  subscription OnReownCreated($newOwnerId: String!) {
    reownCreated(newOwnerId: $newOwnerId) {
      ...ReOwnedProductEntity
    }
  }
  ${REOWNED_PRODUCT_ENTITY}
`;

export const ON_REOWN_UPDATED = gql`
  subscription OnReownUpdated($originalOwnerId: String!, $newOwnerId: String!) {
    reownUpdated(originalOwnerId: $originalOwnerId, newOwnerId: $newOwnerId) {
      ...ReOwnedProductEntity
    }
  }
  ${REOWNED_PRODUCT_ENTITY}
`;

export const ON_AGREEMENT_CREATED = gql`
  subscription OnAgreementCreated($chatId: String!) {
    agreementCreated(chatId: $chatId) {
      ...AgreementEntity
    }
  }
  ${AGREEMENT_ENTITY}
`;

export const ON_AGREEMENT_UPDATED = gql`
  subscription OnAgreementUpdated($chatId: String!) {
    agreementUpdated(chatId: $chatId) {
      ...AgreementEntity
    }
  }
  ${AGREEMENT_ENTITY}
`;