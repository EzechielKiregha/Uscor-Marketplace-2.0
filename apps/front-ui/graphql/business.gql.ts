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
      hasAgreedToTerms
      isB2BEnabled
      createdAt
      updatedAt
      products {
        id
        title
      }
      workers {
        id
        fullName
      }
      ads {
        id
        productId
      }
      freelanceServices {
        id
        title
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
      hasAgreedToTerms
      isB2BEnabled
      createdAt
      updatedAt
      products {
        id
        title
      }
      workers {
        id
        fullName
      }
      ads {
        id
        productId
      }
      freelanceServices {
        id
        title
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
