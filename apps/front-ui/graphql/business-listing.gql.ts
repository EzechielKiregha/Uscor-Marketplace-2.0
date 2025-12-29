// graphql/business-listing.gql.ts
import { gql } from '@apollo/client';

// ======================
// BUSINESS ENTITIES
// ======================

export const BUSINESS_CARD_ENTITY = gql`
  fragment BusinessCardEntity on Business {
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
    loyaltyProgram {
      id
      name
      pointsPerDollar
    }
    promotions {
      id
      title
      description
      startDate
      endDate
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_BUSINESSES = gql`
  query GetBusinesses(
    $search: String
    $businessType: String
    $hasLoyalty: Boolean
    $hasPromotions: Boolean
    $isB2BEnabled: Boolean
    $isVerified: Boolean
    $sort: String
    $page: Int = 1
    $limit: Int = 12
  ) {
    businesses(
      search: $search
      businessType: $businessType
      hasLoyalty: $hasLoyalty
      hasPromotions: $hasPromotions
      isB2BEnabled: $isB2BEnabled
      isVerified: $isVerified
      sort: $sort
      page: $page
      limit: $limit
    ) {
      items {
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
        loyaltyProgram {
          id
          name
          pointsPerDollar
        }
        promotions {
          id
          title
          description
          startDate
          endDate
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_BUSINESS_TYPES = gql`
  query GetBusinessTypes {
    businessTypes {
      id
      name
      description
      icon
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_BUSINESS_ADDED = gql`
  subscription OnBusinessAdded {
    businessAdded {
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
    loyaltyProgram {
      id
      name
      pointsPerDollar
    }
    promotions {
      id
      title
      description
      startDate
      endDate
    }
    }
  }
`;