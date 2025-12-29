import { gql } from '@apollo/client';

// ======================
// QUERIES
// ======================

export const GET_BUSINESS_BY_ID = gql`
  query GetBusinessById($id: String!) {
    business(id: $id) {
      id
      name
      description
      avatar
      coverImage
      address
      phone
      email
      businessType
      kycStatus
      isB2BEnabled
      totalProductsSold
      totalWorkers
      totalClients
      totalSales
      totalRevenueGenerated
      createdAt
      stores {
        id
        name
        address
        products {
          id
          name
          price
          media {
            url
          }
        }
      }
      workers {
        id
        fullName
        avatar
        role
      }
      freelanceServices {
        id
        title
        description
        isHourly
        rate
        category
      }
      kyc {
        id
        status
        documentUrl
        submittedAt
        verifiedAt
      }
    }
  }
`;

export const GET_BUSINESS_PRODUCTS = gql`
  query GetBusinessProducts($businessId: String!, $storeId: String, $category: String, $search: String) {
    businessProducts(businessId: $businessId, storeId: $storeId, category: $category, search: $search) {
      id
      name
      description
      price
      category{
        name
      }
      stockQuantity
      media {
        url
        type
      }
      store {
        id
        name
      }
    }
  }
`;

export const GET_BUSINESS_SERVICES = gql`
  query GetBusinessServices($businessId: String!, $category: String, $search: String) {
    businessServices(businessId: $businessId, category: $category, search: $search) {
      id
      title
      description
      isHourly
      rate
      category
      createdAt
      workerServiceAssignments {
        role
        worker {
          fullName
          avatar
        }
      }
    }
  }
`;

export const GET_BUSINESS_REVIEWS = gql`
  query GetBusinessReviews($businessId: String!, $page: Int = 1, $limit: Int = 10) {
    businessReviews(businessId: $businessId, page: $page, limit: $limit) {
      items {
        id
        rating
        comment
        createdAt
        client {
          id
          fullName
          avatar
        }
      }
      total
      page
      limit
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_BUSINESS_UPDATED = gql`
  subscription OnBusinessUpdated($businessId: String!) {
    businessUpdated(businessId: $businessId) {
      id
    name
    description
    avatar
    coverImage
    address
    phone
    email
    businessType
    kycStatus
    isB2BEnabled
    totalProductsSold
    totalWorkers
    totalClients
    totalSales
    totalRevenueGenerated
    createdAt
    stores {
      id
      name
      address
      products {
        id
        name
        price
        media {
          url
        }
      }
    }
    workers {
      id
      fullName
      avatar
      role
    }
    freelanceServices {
      id
      title
      description
      isHourly
      rate
      category
    }
    kyc {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
    }
    }
  }
`;