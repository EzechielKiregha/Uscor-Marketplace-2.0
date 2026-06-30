// graphql/settings.gql.ts
import { gql } from "@apollo/client";

// ======================
// QUERIES
// ======================

export const GET_BUSINESS_SETTINGS = gql`
  query GetBusinessSettings($id: String!) {
    business(id: $id) {
      id
      name
      email
      description
      avatar
      coverImage
      address
      phone
      country
      businessType
      kycStatus
      isB2BEnabled
      totalProductsSold
      hasAgreedToTerms
      termsAgreedAt
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
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRICING_PLANS = gql`
  query GetPricingPlans {
    pricingPlans {
      id
      name
      description
      price
      features {
        id
        name
        description
      }
      isCurrentPlan
      createdAt
      updatedAt
    }
  }
`;

export const GET_HARDWARE_RECOMMENDATIONS = gql`
  query GetHardwareRecommendations($businessType: String!, $country: String!) {
    hardwareRecommendations(businessType: $businessType, country: $country) {
      type
      model
      description
      priceRange
      localSupplier
      setupGuideUrl
      createdAt
      updatedAt
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
// MUTATIONS
// ======================

export const UPDATE_BUSINESS_PROFILE = gql`
  mutation UpdateBusinessProfile($id: String!, $input: UpdateBusinessInput!) {
    updateBusiness(id: $id, input: $input) {
      id
      name
      email
      description
      avatar
      coverImage
      address
      phone
      country
      businessType
      kycStatus
      isB2BEnabled
      totalProductsSold
      hasAgreedToTerms
      termsAgreedAt
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
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PAYMENT_CONFIG = gql`
  mutation UpdatePaymentConfig(
    $businessId: String!
    $input: PaymentConfigInput!
  ) {
    updatePaymentConfig(businessId: $businessId, input: $input) {
      id
      name
      email
      description
      avatar
      coverImage
      address
      phone
      country
      businessType
      kycStatus
      isB2BEnabled
      totalProductsSold
      hasAgreedToTerms
      termsAgreedAt
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
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_HARDWARE_CONFIG = gql`
  mutation UpdateHardwareConfig(
    $businessId: String!
    $input: HardwareConfigInput!
  ) {
    updateHardwareConfig(businessId: $businessId, input: $input) {
      id
      name
      email
      description
      avatar
      coverImage
      address
      phone
      country
      businessType
      kycStatus
      isB2BEnabled
      totalProductsSold
      hasAgreedToTerms
      termsAgreedAt
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
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRICING_PLAN = gql`
  mutation UpdatePricingPlan($planId: String!) {
    updatePricingPlan(planId: $planId) {
      id
      name
      description
      price
      features {
        id
        name
        description
      }
      isCurrentPlan
      createdAt
      updatedAt
    }
  }
`;

export const AGREE_TO_TERMS = gql`
  mutation AgreeToTerms($businessId: String!) {
    agreeToTerms(businessId: $businessId) {
      id
      hasAgreedToTerms
      termsAgreedAt
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_SETTINGS_UPDATED = gql`
  subscription OnSettingsUpdated($businessId: String!) {
    settingsUpdated(businessId: $businessId) {
      id
      name
      email
      description
      avatar
      coverImage
      address
      phone
      country
      businessType
      kycStatus
      isB2BEnabled
      totalProductsSold
      hasAgreedToTerms
      termsAgreedAt
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
      createdAt
      updatedAt
    }
  }
`;

export const ON_PRICING_PLAN_UPDATED = gql`
  subscription OnPricingPlanUpdated($businessId: String!) {
    pricingPlanUpdated(businessId: $businessId) {
      id
      name
      description
      price
      features {
        id
        name
        description
      }
      isCurrentPlan
      createdAt
      updatedAt
    }
  }
`;
