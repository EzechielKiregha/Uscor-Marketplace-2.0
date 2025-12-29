import { gql } from '@apollo/client';

// ======================
// QUERIES
// ======================

export const GET_MARKETPLACE_DATA = gql`
  query GetMarketplaceData(
    $search: String
    $category: String
    $businessType: String
    $hasPromotion: Boolean
    $isFeatured: Boolean
    $minPrice: Float
    $maxPrice: Float
    $sort: String
    $page: Int = 1
    $limit: Int = 12
  ) {
    marketplaceProducts(
      search: $search
      category: $category
      businessType: $businessType
      hasPromotion: $hasPromotion
      isFeatured: $isFeatured
      minPrice: $minPrice
      maxPrice: $maxPrice
      sort: $sort
      page: $page
      limit: $limit
    ) {
      items {
        id
        title
        description
        price
        quantity
        isPhysical
        featured
        approvedForSale
        business {
          id
          name
          avatar
          businessType
          kycStatus
        }
        store {
          id
          name
        }
        medias {
          url
          type
        }
        category {
          id
          name
        }
        promotions {
          id
          title
          discountPercentage
          code
          value
          startDate
          endDate
        }
      }
      total
      page
      limit
    }
    
    marketplaceServices(
      search: $search
      category: $category
      businessType: $businessType
      minPrice: $minPrice
      maxPrice: $maxPrice
      sort: $sort
      page: $page
      limit: $limit
    ) {
      items {
        id
        title
        description
        isHourly
        rate
        category
        business {
          id
          name
          avatar
          businessType
          kycStatus
        }
        medias {
          url
          type
        }
        workerServiceAssignments {
          role
          worker {
            fullName
            avatar
          }
        }
      }
      total
      page
      limit
    }
    
    businessTypes {
      id
      name
      description
    }
    
    productCategories {
      id
      name
      description
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const SEARCH_MARKETPLACE = gql`
  query SearchMarketplace($query: String!) {
    searchMarketplace(query: $query) {
      products {
        id
        title
        description
        price
        quantity
        isPhysical
        featured
        approvedForSale
        business {
          id
          name
          avatar
          businessType
          kycStatus
        }
        store {
          id
          name
        }
        medias {
          url
          type
        }
        category {
          id
          name
        }
        promotions {
          id
          title
          discountPercentage
          startDate
          endDate
        }
          }
      services {
        id
        title
        description
        isHourly
        rate
        category
        business {
          id
          name
          avatar
          businessType
          kycStatus
        }
        medias {
          url
          type
        }
        workerServiceAssignments {
          role
          worker {
            fullName
            avatar
          }
        }
      }
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_PRODUCT_ADDED = gql`
  subscription OnProductAdded($businessId: String!) {
    productAdded(businessId: $businessId) {
      id
      title
      description
      price
      quantity
      isPhysical
      featured
      approvedForSale
      business {
        id
        name
        avatar
        businessType
        kycStatus
      }
      store {
        id
        name
      }
      medias {
        url
        type
      }
      category {
        id
        name
      }
      promotions {
        id
        title
        discountPercentage
        startDate
        endDate
      }
    }
  }
`;

export const ON_SERVICE_ADDED = gql`
  subscription OnServiceAdded($businessId: String!) {
    serviceAdded(businessId: $businessId) {
      id
      title
      description
      isHourly
      rate
      category
      business {
        id
        name
        avatar
        businessType
        kycStatus
      }
      medias {
        url
        type
      }
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