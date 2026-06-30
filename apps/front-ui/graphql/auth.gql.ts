import { gql } from "@apollo/client";

// GraphQL Mutation
export const getLoginMutation = (role: string) => gql`
  mutation Sign${role}In($SignInInput: SignInInput!) {
    sign${role}In(SignInInput: $SignInInput) {
      accessToken
      refreshToken
      id
      email
      ${role === "Business" ? "coverImage" : ""}
      ${role === "Business" ? "avatar" : ""}
      
    }
  }
`;

export const GET_ROLE_IF_USER_EXIST = gql`
  query WhatIsUserRole($SignInInput: SignInInput!) {
    whatIsUserRole(SignInInput: $SignInInput) {
      role
    }
  }
`;

// GraphQL Mutations
export const CREATE_CLIENT = gql`
  mutation CreateClient($createClientInput: CreateClientInput!) {
    createClient(createClientInput: $createClientInput) {
      id
      email
      fullName
      phone
    }
  }
`;

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness($createBusinessInput: CreateBusinessInput!) {
    createBusiness(createBusinessInput: $createBusinessInput) {
      id
      email
      name
      phone
      avatar
      coverImage
    }
  }
`;

export const CREATE_WORKER = gql`
  mutation CreateWorker($createWorkerInput: CreateWorkerInput!) {
    createWorker(createWorkerInput: $createWorkerInput) {
      id
      email
      fullName
      role
      isVerified
    }
  }
`;

// ─── Auth V2 Operations ─────────────────────────────────────

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      success
      message
    }
  }
`;

export const RESEND_OTP = gql`
  mutation ResendOtp($input: ResendOtpInput!) {
    resendOtp(input: $input) {
      success
      message
    }
  }
`;

export const SEND_VERIFICATION_OTP = gql`
  mutation SendVerificationOtp($email: String!) {
    sendVerificationOtp(email: $email) {
      success
      message
    }
  }
`;

export const GET_SECURITY_LOGS = gql`
  query SecurityLogs {
    securityLogs {
      id
      userId
      userRole
      action
      ipAddress
      userAgent
      deviceId
      metadata
      createdAt
    }
  }
`;

// ─── Offline Login Operations ───────────────────────────────

export const REQUEST_OFFLINE_ACCESS = gql`
  mutation RequestOfflineAccess($input: RequestOfflineAccessInput!) {
    requestOfflineAccess(input: $input) {
      offlineToken
      expiresAt
      permissions
      workerProfile {
        id
        email
        fullName
        avatar
        role
      }
      businessInfo {
        id
        name
        businessType
        storeIds
        storeNames
      }
    }
  }
`;

export const REVOKE_OFFLINE_ACCESS = gql`
  mutation RevokeOfflineAccess($workerId: String!, $deviceId: String!) {
    revokeOfflineAccess(workerId: $workerId, deviceId: $deviceId) {
      success
      message
    }
  }
`;
