import { gql } from '@apollo/client';

// ======================
// USER ENTITIES
// ======================

export const CLIENT_ENTITY = gql`
  fragment ClientEntity on Client {
    id
    username
    email
    fullName
    address
    phone
    isVerified
    createdAt
    updatedAt
    orders {
      id
      deliveryFee
      createdAt
    }
    reviews {
      id
      rating
      comment
    }
    referralsMade {
      id
      verifiedPurchase
    }
    referralsReceived {
      id
      verifiedPurchase
    }
    recharges {
      id
      amount
      method
      createdAt
    }
    freelanceOrders {
      id
      totalAmount
      status
      createdAt
    }
    kyc {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
    }
  }
`;

export const BUSINESS_ENTITY = gql`
  fragment BusinessEntity on Business {
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
    createdAt
    updatedAt
    products {
      id
      title
      price
      stock
    }
    stores {
      id
      name
      address
    }
    workers {
      id
      fullName
      email
      role
      isVerified
    }
    freelanceServices {
      id
      title
      description
      rate
      isHourly
    }
    referralsMade {
      id
      verifiedPurchase
    }
    referralsReceived {
      id
      verifiedPurchase
    }
    kyc {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
    }
  }
`;

export const WORKER_ENTITY = gql`
  fragment WorkerEntity on Worker {
    id
    email
    fullName
    role
    isVerified
    createdAt
    updatedAt
    business {
      id
      name
    }
    kyc {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
    }
    freelanceServices {
      id
      title
      description
    }
  }
`;

// ======================
// QUERIES
// ======================

export const GET_ME = gql`
  query GetMe {
    me {
      role
      client {
        ...ClientEntity
      }
      business {
        ...BusinessEntity
      }
      worker {
        ...WorkerEntity
      }
    }
  }
  ${CLIENT_ENTITY}
  ${BUSINESS_ENTITY}
  ${WORKER_ENTITY}
`;

export const GET_CLIENT_BY_ID = gql`
  query GetClientById($id: String!) {
    client(id: $id) {
      ...ClientEntity
    }
  }
  ${CLIENT_ENTITY}
`;

export const GET_BUSINESS_BY_ID = gql`
  query GetBusinessById($id: String!) {
    business(id: $id) {
      ...BusinessEntity
    }
  }
  ${BUSINESS_ENTITY}
`;

export const GET_WORKER_BY_ID = gql`
  query GetWorkerById($id: String!) {
    worker(id: $id) {
      ...WorkerEntity
    }
  }
  ${WORKER_ENTITY}
`;

export const GET_WORKERS_BY_BUSINESS = gql`
  query GetWorkersByBusiness($businessId: String!) {
    workers(businessId: $businessId) {
      ...WorkerEntity
    }
  }
  ${WORKER_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      role
      userId
    }
  }
`;

export const REGISTER_CLIENT = gql`
  mutation RegisterClient($input: RegisterClientInput!) {
    registerClient(input: $input) {
      token
      client {
        ...ClientEntity
      }
    }
  }
  ${CLIENT_ENTITY}
`;

export const REGISTER_BUSINESS = gql`
  mutation RegisterBusiness($input: RegisterBusinessInput!) {
    registerBusiness(input: $input) {
      token
      business {
        ...BusinessEntity
      }
    }
  }
  ${BUSINESS_ENTITY}
`;

export const UPDATE_CLIENT = gql`
  mutation UpdateClient($input: UpdateClientInput!) {
    updateClient(input: $input) {
      ...ClientEntity
    }
  }
  ${CLIENT_ENTITY}
`;

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($input: UpdateBusinessInput!) {
    updateBusiness(input: $input) {
      ...BusinessEntity
    }
  }
  ${BUSINESS_ENTITY}
`;

export const CREATE_WORKER = gql`
  mutation CreateWorker($input: CreateWorkerInput!) {
    createWorker(input: $input) {
      ...WorkerEntity
    }
  }
  ${WORKER_ENTITY}
`;

export const UPDATE_WORKER = gql`
  mutation UpdateWorker($id: String!, $input: UpdateWorkerInput!) {
    updateWorker(id: $id, input: $input) {
      ...WorkerEntity
    }
  }
  ${WORKER_ENTITY}
`;

export const VERIFY_KYC = gql`
  mutation VerifyKyc($input: VerifyKycInput!) {
    verifyKyc(input: $input) {
      id
      status
      verifiedAt
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_CLIENT_UPDATED = gql`
  subscription OnClientUpdated($clientId: String!) {
    clientUpdated(clientId: $clientId) {
      ...ClientEntity
    }
  }
  ${CLIENT_ENTITY}
`;

export const ON_BUSINESS_UPDATED = gql`
  subscription OnBusinessUpdated($businessId: String!) {
    businessUpdated(businessId: $businessId) {
      ...BusinessEntity
    }
  }
  ${BUSINESS_ENTITY}
`;