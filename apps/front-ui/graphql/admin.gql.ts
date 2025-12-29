import { gql } from '@apollo/client';

// ======================
// USER MANAGEMENT QUERIES
// ======================

export const GET_USERS = gql`
  query GetUsers(
    $input: GetUsersInput!

    $includeBusinesses: Boolean!
    $includeClients: Boolean!
    $includeWorkers: Boolean!
    $includeAdmins: Boolean!
  ) {
    all_businesses(
      input: $input
    ) @include(if: $includeBusinesses) {
      items {
        id
        name
        email
        phone
        avatar
        businessType
        kycStatus
        isB2BEnabled
        address
        description
        totalProductsSold
        totalWorkers
        totalClients
        totalSales
        totalRevenueGenerated
        createdAt
        updatedAt
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
        kyc {
          id
          status
          documentUrl
          submittedAt
          verifiedAt
        }
      }
      total
      page
      limit
    }
    
    all_clients(
      input: $input
    ) @include(if: $includeClients) {
      items {
        id
        fullName
        email
        phone
        avatar
        address
        createdAt
        updatedAt
        loyaltyPoints
        totalSpent
        totalOrders
        addresses {
          id
          street
          city
          country
          postalCode
          isDefault
        }
        paymentMethods {
          id
          type
          last4
          isDefault
        }
      }
      total
      page
      limit
    }
    
    all_workers(
      input: $input
    ) @include(if: $includeWorkers) {
      items {
        id
        email
        fullName
        avatar
        role
        isVerified
        createdAt
        updatedAt
        business {
          id
          name
          businessType
          kycStatus
        }
        kyc {
          id
          status
          documentUrl
          submittedAt
          verifiedAt
        }
      }
      total
      page
      limit
    }

    all_admins(
      input: $input
    ) @include(if: $includeAdmins) {
      items {
        id
        email
        fullName
        phone
        avatar
        role
        isActive
        lastLogin
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;

export const GET_USER_DETAILS = gql`
  query GetUserDetails(
    $id: String!  
    $userType: String!

    $includeBusinesse: Boolean!
    $includeClient: Boolean!
    $includeWorker: Boolean!
    $includeAdmin: Boolean!
  ) {
    one_business(id: $id) @include(if: $includeBusinesse) {
      id
      name
      email
      phone
      avatar
      businessType
      kycStatus
      isB2BEnabled
      address
      description
      totalProductsSold
      totalWorkers
      totalClients
      totalSales
      totalRevenueGenerated
      createdAt
      updatedAt
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
      kyc {
        id
        status
        documentUrl
        submittedAt
        verifiedAt
      }
    }
    
    one_client(id: $id) @include(if: $includeClient) {
      id
      fullName
      email
      phone
      avatar
      address
      createdAt
      updatedAt
      loyaltyPoints
      totalSpent
      totalOrders
      addresses {
        id
        street
        city
        country
        postalCode
        isDefault
      }
      paymentMethods {
        id
        type
        last4
        isDefault
      }
    }
    
    one_worker(id: $id) @include(if: $includeWorker) {
      id
      email
      fullName
      phone
      avatar
      role
      isVerified
      createdAt
      updatedAt
      business {
        id
        name
        businessType
        kycStatus
      }
      kyc {
        id
        status
        documentUrl
        submittedAt
        verifiedAt
      }
    }
    
    one_admin(id: $id) @include(if: $includeAdmin) {
      id
      email
      fullName
      phone
      avatar
      role
      isActive
      lastLogin
      createdAt
      updatedAt
    }
  }
`;

// ======================
// USER MANAGEMENT MUTATIONS
// ======================

export const VERIFY_KYC = gql`
  mutation VerifyKyc($businessId: String!, $notes: String) {
    verifyKyc(businessId: $businessId, notes: $notes) {
      id
      kycStatus
      kyc {
        id
        status
        verifiedAt
        verifiedBy {
          id
          fullName
        }
      }
    }
  }
`;

export const REJECT_KYC = gql`
  mutation RejectKyc($businessId: String!, $rejectionReason: String!) {
    rejectKyc(businessId: $businessId, rejectionReason: $rejectionReason) {
      id
      kycStatus
      kyc {
        id
        status
        rejectionReason
        verifiedAt
      }
    }
  }
`;

export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($id: String!, $userType: String!, $status: String!) {
    updateBusinessStatus(id: $id, status: $status) @include(if: $userType, match: $userType, value: "BUSINESS")
    updateClientStatus(id: $id, status: $status) @include(if: $userType, match: $userType, value: "CLIENT")
    updateWorkerStatus(id: $id, status: $status) @include(if: $userType, match: $userType, value: "WORKER")
    updateAdminStatus(id: $id, status: $status) @include(if: $userType, match: $userType, value: "ADMIN")
  }
`;

// ======================
// USER MANAGEMENT SUBSCRIPTIONS
// ======================

export const ON_NEW_BUSINESS = gql`
  subscription OnNewBusiness {
    newBusiness {
      id
    name
    email
    phone
    avatar
    businessType
    kycStatus
    isB2BEnabled
    address
    description
    totalProductsSold
    totalWorkers
    totalClients
    totalSales
    totalRevenueGenerated
    createdAt
    updatedAt
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

export const ON_NEW_CLIENT = gql`
  subscription OnNewClient {
    newClient {
      id
        fullName
        email
        phone
        avatar
        address
        createdAt
        updatedAt
        loyaltyPoints
        totalSpent
        totalOrders
        addresses {
          id
          street
          city
          country
          postalCode
          isDefault
        }
        paymentMethods {
          id
          type
          last4
          isDefault
        }
    }
  }
`;

export const ON_NEW_WORKER = gql`
  subscription OnNewWorker {
    newWorker {
      id
        email
        fullName
        phone
        avatar
        role
        isVerified
        createdAt
        updatedAt
        business {
          id
          name
          businessType
          kycStatus
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

export const ON_NEW_ADMIN = gql`
  subscription OnNewAdmin {
    newAdmin {
      id
      email
      fullName
      phone
      avatar
      role
      isActive
      lastLogin
      createdAt
      updatedAt
    }
  }
`;

export const GET_PLATFORM_DASHBOARD = gql`
  query GetPlatformDashboard {
    platformMetrics {
      totalUsers
      totalBusinesses
      totalProducts
      totalServices
      totalTransactions
      totalRevenue
      activeUsersToday
      activeBusinessesToday
      averageTransactionValue
      platformFeesCollected
      kycPendingCount
      kycVerifiedCount
      kycRejectedCount
      disputesOpenCount
      disputesResolvedCount
      adsActiveCount
      adsPendingCount
      last24Hours {
        date
        count
      }
      last7Days {
        date
        count
      }
      last30Days {
        date
        count
      }
    }
    platformSettings {
      id
      platformFeePercentage
      minTransactionAmount
      maxTransactionAmount
      currency
      tokenValue
      tokenSymbol
      kycRequired
      b2bEnabled
      marketplaceEnabled
      createdAt
      updatedAt
    }
  }
`;

export const GET_DISPUTES = gql`
  query GetDisputes(
    $status: String
    $type: String
    $search: String
    $page: Int = 1
    $limit: Int = 10
  ) {
    disputes(
      status: $status
      type: $type
      search: $search
      page: $page
      limit: $limit
    ) {
      items {
        id
        title
        description
        status
        type
        createdAt
        resolvedAt
        resolutionNotes
        reporter {
          id
          fullName
          avatar
        }
        business {
          id
          name
          avatar
        }
        order {
          id
          orderNumber
        }
        messages {
          id
          content
          createdAt
          sender {
            id
            fullName
            avatar
          }
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_ANNOUNCEMENTS = gql`
  query GetAnnouncements(
    $status: String
    $priority: String
    $search: String
    $page: Int = 1
    $limit: Int = 10
  ) {
    announcements(
      status: $status
      priority: $priority
      search: $search
      page: $page
      limit: $limit
    ) {
      items {
        id
        title
        content
        type
        priority
        createdAt
        scheduledFor
        sentAt
        status
        targetUsers
        readCount
        totalRecipients
      }
      total
      page
      limit
    }
  }
`;

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs(
    $action: String
    $adminId: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 10
  ) {
    auditLogs(
      action: $action
      adminId: $adminId
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        id
        action
        entityType
        entityId
        details
        createdAt
        admin {
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

export const GET_PLATFORM_SETTINGS = gql`
  query GetPlatformSettings {
    platformSettings {
      id
      platformFeePercentage
      minTransactionAmount
      maxTransactionAmount
      currency
      tokenValue
      tokenSymbol
      kycRequired
      b2bEnabled
      marketplaceEnabled
      createdAt
      updatedAt
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const UPDATE_PLATFORM_SETTINGS = gql`
  mutation UpdatePlatformSettings($input: PlatformSettingsInput!) {
    updatePlatformSettings(input: $input) {
      id
      platformFeePercentage
      minTransactionAmount
      maxTransactionAmount
      currency
      tokenValue
      tokenSymbol
      kycRequired
      b2bEnabled
      marketplaceEnabled
      createdAt
      updatedAt
    }
  }
`;

export const RESOLVE_DISPUTE = gql`
  mutation ResolveDispute(
    $disputeId: String!
    $resolutionNotes: String!
    $refundAmount: Float
    $compensation: Float
  ) {
    resolveDispute(
      disputeId: $disputeId
      resolutionNotes: $resolutionNotes
      refundAmount: $refundAmount
      compensation: $compensation
    ) {
      id
      title
      description
      status
      type
      createdAt
      resolvedAt
      resolutionNotes
      reporter {
        id
        fullName
        avatar
      }
      business {
        id
        name
        avatar
      }
      order {
        id
        orderNumber
      }
      messages {
        id
        content
        createdAt
        sender {
          id
          fullName
          avatar
        }
      }
    }
  }
`;

export const CREATE_ANNOUNCEMENT = gql`
  mutation CreateAnnouncement($input: CreateAnnouncementInput!) {
    createAnnouncement(input: $input) {
      id
      title
      content
      type
      priority
      createdAt
      scheduledFor
      sentAt
      status
      targetUsers
      readCount
      totalRecipients
    }
  }
`;

export const CREATE_RECHARGE = gql`
  mutation CreateRecharge($input: RechargeInput!) {
    createRecharge(input: $input) {
      id
      amount
      utnAmount
      status
      transactionId
      business {
        id
        name
      }
      createdAt
    }
  }
`;

export const CREATE_SUPERADMIN = gql`
  mutation CreateSuperAdmin($createAdminInput: CreateAdminInput!) {
    registerSuperAdmin(createAdminInput: $createAdminInput) {
      id
      email
      fullName
      phone
      role
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_NEW_USER = gql`
  subscription OnNewUser {
    newUser {
      id
      fullName
      email
      phone
      avatar
      role
      createdAt
      updatedAt
      status
      lastLogin
      isVerified
      client {
        id
        loyaltyPoints
        totalSpent
        totalOrders
      }
      business {
        id
        name
        businessType
        kycStatus
        isB2BEnabled
        totalProductsSold
        totalWorkers
        totalClients
        totalSales
        totalRevenueGenerated
      }
    }
  }
`;

export const ON_NEW_DISPUTE = gql`
  subscription OnNewDispute {
    newDispute {
      id
      title
      description
      status
      type
      createdAt
      resolvedAt
      resolutionNotes
      reporter {
        id
        fullName
        avatar
      }
      business {
        id
        name
        avatar
      }
      order {
        id
        orderNumber
      }
      messages {
        id
        content
        createdAt
        sender {
          id
          fullName
          avatar
        }
      }
    }
  }
`;

export const ON_KYC_SUBMITTED = gql`
  subscription OnKycSubmitted {
    kycSubmitted {
      id
      name
      kycStatus
    }
  }
`;

export const ON_PLATFORM_SETTINGS_UPDATED = gql`
  subscription OnPlatformSettingsUpdated {
    platformSettingsUpdated {
      id
      platformFeePercentage
      minTransactionAmount
      maxTransactionAmount
      currency
      tokenValue
      tokenSymbol
      kycRequired
      b2bEnabled
      marketplaceEnabled
      createdAt
      updatedAt
    }
  }
`;