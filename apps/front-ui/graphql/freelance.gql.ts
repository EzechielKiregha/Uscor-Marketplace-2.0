import { gql } from '@apollo/client';

// ======================
// QUERIES
// ======================

export const GET_FREELANCE_SERVICES = gql`
  query GetFreelanceServices(
    $category: String
    $minRate: Float
    $maxRate: Float
    $isHourly: Boolean
    $businessId: String
    $search: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    freelanceServices(
      category: $category
      minRate: $minRate
      maxRate: $maxRate
      isHourly: $isHourly
      businessId: $businessId
      search: $search
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
        createdAt
        updatedAt
        business {
          id
          name
          avatar
        }
        workerServiceAssignments {
          id
          role
          assignedAt
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_FREELANCE_SERVICE_BY_ID = gql`
  query GetFreelanceServiceById($id: String!) {
    freelanceService(id: $id) {
      id
      title
      description
      isHourly
      rate
      category
      createdAt
      updatedAt
      business {
        id
        name
        avatar
      }
      workerServiceAssignments {
        id
        role
        assignedAt
      }
    }
  }
`;

export const GET_FREELANCE_ORDERS = gql`
  query GetFreelanceOrders(
    $serviceId: String
    $clientId: String
    $businessId: String
    $status: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    freelanceOrders(
      serviceId: $serviceId
      clientId: $clientId
      businessId: $businessId
      status: $status
      page: $page
      limit: $limit
    ) {
      items {
        id
        serviceId
        service {
          id
          title
          rate
          isHourly
        }
        clientId
        client {
          id
          fullName
          avatar
        }
        quantity
        totalAmount
        escrowAmount
        platformCommissionPercentage
        status
        createdAt
        updatedAt
        paymentTransaction {
          id
          amount
          method
          status
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_FREELANCE_ORDER_BY_ID = gql`
  query GetFreelanceOrderById($id: String!) {
    freelanceOrder(id: $id) {
      id
      serviceId
      service {
        id
        title
        rate
        isHourly
      }
      clientId
      client {
        id
        fullName
        avatar
      }
      quantity
      totalAmount
      escrowAmount
      platformCommissionPercentage
      status
      createdAt
      updatedAt
      paymentTransaction {
        id
        amount
        method
        status
      }
    }
  }
`;

export const GET_WORKER_ASSIGNMENTS = gql`
  query GetWorkerAssignments($workerId: String!, $serviceId: String) {
    workerServiceAssignments(workerId: $workerId, serviceId: $serviceId) {
      id
      serviceId
      workerId
      role
      assignedAt
      service {
        id
        title
      }
      worker {
        id
        fullName
        email
      }
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_FREELANCE_SERVICE = gql`
  mutation CreateFreelanceService($input: CreateFreelanceServiceInput!) {
    createFreelanceService(input: $input) {
    id
    title
    description
    isHourly
    rate
    category
    createdAt
    updatedAt
    business {
      id
      name
      avatar
    }
    workerServiceAssignments {
      id
      role
      assignedAt
    }
  }
  }
`;

export const UPDATE_FREELANCE_SERVICE = gql`
  mutation UpdateFreelanceService($id: String!, $input: UpdateFreelanceServiceInput!) {
    updateFreelanceService(id: $id, input: $input) {
    id
    title
    description
    isHourly
    rate
    category
    createdAt
    updatedAt
    business {
      id
      name
      avatar
    }
    workerServiceAssignments {
      id
      role
      assignedAt
    }
  }
  }
`;

export const DELETE_FREELANCE_SERVICE = gql`
  mutation DeleteFreelanceService($id: String!) {
    deleteFreelanceService(id: $id) {
      id
    }
  }
`;

export const CREATE_FREELANCE_ORDER = gql`
  mutation CreateFreelanceOrder($input: CreateFreelanceOrderInput!) {
    createFreelanceOrder(input: $input) {
    id
    serviceId
    service {
      id
      title
      rate
      isHourly
    }
    clientId
    client {
      id
      fullName
      avatar
    }
    quantity
    totalAmount
    escrowAmount
    platformCommissionPercentage
    status
    createdAt
    updatedAt
    paymentTransaction {
      id
      amount
      method
      status
    }
  }
  }
`;

export const UPDATE_FREELANCE_ORDER = gql`
  mutation UpdateFreelanceOrder($id: String!, $input: UpdateFreelanceOrderInput!) {
    updateFreelanceOrder(id: $id, input: $input) {
    id
    serviceId
    service {
      id
      title
      rate
      isHourly
    }
    clientId
    client {
      id
      fullName
      avatar
    }
    quantity
    totalAmount
    escrowAmount
    platformCommissionPercentage
    status
    createdAt
    updatedAt
    paymentTransaction {
      id
      amount
      method
      status
    }
  }
  }
`;

export const ASSIGN_WORKER_TO_SERVICE = gql`
  mutation AssignWorkerToService($input: AssignWorkerToServiceInput!) {
    assignWorkerToService(input: $input) {
    id
    serviceId
    workerId
    role
    assignedAt
    service {
      id
      title
    }
    worker {
      id
      fullName
      email
    }
  }
  }
`;

export const COMPLETE_FREELANCE_ORDER = gql`
  mutation CompleteFreelanceOrder($id: String!) {
    completeFreelanceOrder(id: $id) {
    id
    serviceId
    service {
      id
      title
      rate
      isHourly
    }
    clientId
    client {
      id
      fullName
      avatar
    }
    quantity
    totalAmount
    escrowAmount
    platformCommissionPercentage
    status
    createdAt
    updatedAt
    paymentTransaction {
      id
      amount
      method
      status
    }
  }
  }
`;

export const RELEASE_ESCROW = gql`
  mutation ReleaseEscrow($orderId: String!) {
    releaseEscrow(orderId: $orderId) {
    id
    serviceId
    service {
      id
      title
      rate
      isHourly
    }
    clientId
    client {
      id
      fullName
      avatar
    }
    quantity
    totalAmount
    escrowAmount
    platformCommissionPercentage
    status
    createdAt
    updatedAt
    paymentTransaction {
      id
      amount
      method
      status
    }
  }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_FREELANCE_SERVICE_CREATED = gql`
  subscription OnFreelanceServiceCreated($businessId: String!) {
    freelanceServiceCreated(businessId: $businessId) {
    id
    title
    description
    isHourly
    rate
    category
    createdAt
    updatedAt
    business {
      id
      name
      avatar
    }
    workerServiceAssignments {
      id
      role
      assignedAt
    }
  }
  }
`;

export const ON_FREELANCE_SERVICE_UPDATED = gql`
  subscription OnFreelanceServiceUpdated($businessId: String!) {
    freelanceServiceUpdated(businessId: $businessId) {
    id
    title
    description
    isHourly
    rate
    category
    createdAt
    updatedAt
    business {
      id
      name
      avatar
    }
    workerServiceAssignments {
      id
      role
      assignedAt
    }
  }
  }
`;

export const ON_FREELANCE_ORDER_CREATED = gql`
  subscription OnFreelanceOrderCreated($clientId: String!) {
    freelanceOrderCreated(clientId: $clientId) {
    id
    serviceId
    service {
      id
      title
      rate
      isHourly
    }
    clientId
    client {
      id
      fullName
      avatar
    }
    quantity
    totalAmount
    escrowAmount
    platformCommissionPercentage
    status
    createdAt
    updatedAt
    paymentTransaction {
      id
      amount
      method
      status
    }
  }
  }
`;

export const ON_FREELANCE_ORDER_UPDATED = gql`
  subscription OnFreelanceOrderUpdated($businessId: String!) {
    freelanceOrderUpdated(businessId: $businessId) {
    id
    serviceId
    service {
      id
      title
      rate
      isHourly
    }
    clientId
    client {
      id
      fullName
      avatar
    }
    quantity
    totalAmount
    escrowAmount
    platformCommissionPercentage
    status
    createdAt
    updatedAt
    paymentTransaction {
      id
      amount
      method
      status
    }
  }
  }
`;