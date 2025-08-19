import { gql } from '@apollo/client';

// ======================
// REFERRAL ENTITIES
// ======================

export const REFERRAL_ENTITY = gql`
  fragment ReferralEntity on Referral {
    id
    referrerId
    refereeId
    referralCode
    status
    createdAt
    verifiedAt
    referrer {
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
    referee {
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
    verifiedPurchases {
      id
      amount
      verifiedAt
      purchaseType
    }
  }
`;

export const REFERRAL_PROGRAM_ENTITY = gql`
  fragment ReferralProgramEntity on ReferralProgram {
    id
    name
    description
    referrerReward
    refereeReward
    minPurchaseAmount
    maxReferrals
    validForDays
    isActive
    createdAt
    updatedAt
    businessId
    business {
      id
      name
    }
  }
`;

export const REFERRAL_REWARD_ENTITY = gql`
  fragment ReferralRewardEntity on ReferralReward {
    id
    referralId
    rewardType
    rewardValue
    status
    claimedAt
    createdAt
    referral {
      id
      referrerId
      refereeId
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_REFERRAL = gql`
  query GetReferral($id: String!) {
    referral(id: $id) {
      ...ReferralEntity
    }
  }
  ${REFERRAL_ENTITY}
`;

export const GET_REFERRALS_BY_REFERRER = gql`
  query GetReferralsByReferrer(
    $referrerId: String!
    $referrerType: ReferralUserType!
    $status: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    referralsByReferrer(
      referrerId: $referrerId
      referrerType: $referrerType
      status: $status
      page: $page
      limit: $limit
    ) {
      items {
        ...ReferralEntity
      }
      total
      page
      limit
    }
  }
  ${REFERRAL_ENTITY}
`;

export const GET_REFERRALS_BY_REFERRAL_CODE = gql`
  query GetReferralsByReferralCode($referralCode: String!) {
    referralsByReferralCode(referralCode: $referralCode) {
      ...ReferralEntity
    }
  }
  ${REFERRAL_ENTITY}
`;

export const GET_REFERRAL_PROGRAMS = gql`
  query GetReferralPrograms($businessId: String) {
    referralPrograms(businessId: $businessId) {
      ...ReferralProgramEntity
    }
  }
  ${REFERRAL_PROGRAM_ENTITY}
`;

export const GET_REFERRAL_PROGRAM_BY_ID = gql`
  query GetReferralProgramById($id: String!) {
    referralProgram(id: $id) {
      ...ReferralProgramEntity
    }
  }
  ${REFERRAL_PROGRAM_ENTITY}
`;

export const GET_REFERRAL_REWARDS = gql`
  query GetReferralRewards(
    $referralId: String
    $userId: String
    $status: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    referralRewards(
      referralId: $referralId
      userId: $userId
      status: $status
      page: $page
      limit: $limit
    ) {
      items {
        ...ReferralRewardEntity
      }
      total
      page
      limit
    }
  }
  ${REFERRAL_REWARD_ENTITY}
`;

export const GET_REFERRAL_STATS = gql`
  query GetReferralStats($userId: String!, $userType: ReferralUserType!) {
    referralStats(userId: $userId, userType: $userType) {
      totalReferrals
      activeReferrals
      completedReferrals
      totalEarned
      pendingEarned
      availableEarned
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_REFERRAL = gql`
  mutation CreateReferral($input: CreateReferralInput!) {
    createReferral(input: $input) {
      ...ReferralEntity
    }
  }
  ${REFERRAL_ENTITY}
`;

export const VERIFY_REFERRAL_PURCHASE = gql`
  mutation VerifyReferralPurchase($input: VerifyReferralPurchaseInput!) {
    verifyReferralPurchase(input: $input) {
      ...ReferralEntity
    }
  }
  ${REFERRAL_ENTITY}
`;

export const CREATE_REFERRAL_PROGRAM = gql`
  mutation CreateReferralProgram($input: CreateReferralProgramInput!) {
    createReferralProgram(input: $input) {
      ...ReferralProgramEntity
    }
  }
  ${REFERRAL_PROGRAM_ENTITY}
`;

export const UPDATE_REFERRAL_PROGRAM = gql`
  mutation UpdateReferralProgram($id: String!, $input: UpdateReferralProgramInput!) {
    updateReferralProgram(id: $id, input: $input) {
      ...ReferralProgramEntity
    }
  }
  ${REFERRAL_PROGRAM_ENTITY}
`;

export const CLAIM_REFERRAL_REWARD = gql`
  mutation ClaimReferralReward($rewardId: String!) {
    claimReferralReward(rewardId: $rewardId) {
      ...ReferralRewardEntity
    }
  }
  ${REFERRAL_REWARD_ENTITY}
`;

export const GENERATE_REFERRAL_CODE = gql`
  mutation GenerateReferralCode($input: GenerateReferralCodeInput!) {
    generateReferralCode(input: $input) {
      referralCode
      expiresAt
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_REFERRAL_CREATED = gql`
  subscription OnReferralCreated($referrerId: String!, $referrerType: ReferralUserType!) {
    referralCreated(referrerId: $referrerId, referrerType: $referrerType) {
      ...ReferralEntity
    }
  }
  ${REFERRAL_ENTITY}
`;

export const ON_REFERRAL_VERIFIED = gql`
  subscription OnReferralVerified($referrerId: String!, $referrerType: ReferralUserType!) {
    referralVerified(referrerId: $referrerId, referrerType: $referrerType) {
      ...ReferralEntity
    }
  }
  ${REFERRAL_ENTITY}
`;

export const ON_REFERRAL_REWARD_CLAIMED = gql`
  subscription OnReferralRewardClaimed($userId: String!) {
    referralRewardClaimed(userId: $userId) {
      ...ReferralRewardEntity
    }
  }
  ${REFERRAL_REWARD_ENTITY}
`;

export const ON_REFERRAL_STATS_UPDATED = gql`
  subscription OnReferralStatsUpdated($userId: String!, $userType: ReferralUserType!) {
    referralStatsUpdated(userId: $userId, userType: $userType) {
      totalReferrals
      activeReferrals
      completedReferrals
      totalEarned
      pendingEarned
      availableEarned
    }
  }
`;

/**
 * Utility function to remove __typename from objects.
 */
export const removeTypename: any = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  } else if (obj && typeof obj === 'object') {
    const { __typename, ...rest } = obj;
    return Object.keys(rest).reduce((acc, key) => {
      acc[key] = removeTypename(rest[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};