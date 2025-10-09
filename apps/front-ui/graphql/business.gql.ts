import { gql } from "@apollo/client";

// 📦 Get All Businesses
export const GET_BUSINESSES = gql`
  query GetBusinesses {
    businesses {
        id
        name
        email
        description
        address
        phone
        avatar
        coverImage
        isVerified
        kycStatus
        totalProductsSold
        totalWorkers
        totalClients
        totalSales
        totalRevenueGenerated
        hasAgreedToTerms
        isB2BEnabled
        termsAgreedAt
        createdAt
        updatedAt
        products {
          id
          title
        }
        stores {
          id
          name
          address
          products {
            id
            title
            price
            medias {
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
        ads {
          id
          productId
        }
        paymentConfig {
          mtnCode
          airtelCode
          orangeCode
          mpesaCode
          bankAccount
          mobileMoneyEnabled
        }
        hardwareConfig {
          receiptPrinter
          barcodeScanner
          cashDrawer
          cardReader
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

export const GET_BUSINESS_DASHBOARD = gql`
  query GetBusinessDashboard {
    businessDashboard{
      stats {
        totalRevenue
        revenueChange
        totalOrders
        ordersChange
        totalProducts
        lowStockProducts
        unreadMessages
        totalMessages
      }
      salesData {
        date
        sales
      }
      recentOrders {
        id
        client {
          fullName
        }
        createdAt
        totalAmount
        status
      }
    }
  }
`;

// 📦 Get Business by ID
export const GET_BUSINESS_BY_ID = gql`
  query GetBusinessById($id: String!) {
    business(id: $id) {
      id
      name
      email
      description
      address
      phone
      avatar
      coverImage
      isVerified
      kycStatus
      totalProductsSold
      totalWorkers
      totalClients
      totalSales
      totalRevenueGenerated
      hasAgreedToTerms
      isB2BEnabled
      termsAgreedAt
      createdAt
      updatedAt
      products {
        id
        title
      }
      stores {
        id
        name
        address
        products {
          id
          title
          price
          medias {
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
      ads {
        id
        productId
      }
      paymentConfig {
        mtnCode
        airtelCode
        orangeCode
        mpesaCode
        bankAccount
        mobileMoneyEnabled
      }
      hardwareConfig {
        receiptPrinter
        barcodeScanner
        cashDrawer
        cardReader
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

// ➕ Create Business
export const CREATE_BUSINESS = gql`
  mutation CreateBusiness($createBusinessInput: CreateBusinessInput!) {
    createBusiness(createBusinessInput: $createBusinessInput) {
      id
      name
      email
      description
      address
      phone
      avatar
      coverImage
      isVerified
      kycStatus
      totalProductsSold
      hasAgreedToTerms
      isB2BEnabled
      createdAt
      updatedAt
    }
  }
`;

// ✏ Update Business
export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($id: String!, $updateBusinessInput: UpdateBusinessInput!) {
    updateBusiness(id: $id, updateBusinessInput: $updateBusinessInput) {
      id
      name
      email
      description
      address
      phone
      avatar
      coverImage
      isVerified
      kycStatus
      totalProductsSold
      hasAgreedToTerms
      isB2BEnabled
      createdAt
      updatedAt
    }
  }
`;

// ❌ Delete Business
export const DELETE_BUSINESS = gql`
  mutation DeleteBusiness($id: String!) {
    deleteBusiness(id: $id) {
      id
      name
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
      category
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
        email
        description
        address
        phone
        avatar
        coverImage
        isVerified
        kycStatus
        totalProductsSold
        totalWorkers
        totalClients
        totalSales
        totalRevenueGenerated
        hasAgreedToTerms
        isB2BEnabled
        termsAgreedAt
        createdAt
        updatedAt
        products {
          id
          title
        }
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
        ads {
          id
          productId
        }
        paymentConfig {
          mtnCode
          airtelCode
          orangeCode
          mpesaCode
          bankAccount
          mobileMoneyEnabled
        }
        hardwareConfig {
          receiptPrinter
          barcodeScanner
          cashDrawer
          cardReader
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
