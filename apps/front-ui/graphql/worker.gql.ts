import { gql } from "@apollo/client";

// 📦 Get All Workers
export const GET_WORKERS = gql`
  query GetWorkers($storeId: String) {
    workers(storeId: $storeId) {
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
      }
      workerServiceAssignments {
        id
        freelanceServiceId
        role
        assignedAt
        freelanceService {
          id
          title
        }
      }
      chatParticipants {
        chat {
          id
          status
        }
      }
    }
  }
`;

// 📦 Get Worker by ID
export const GET_WORKER_BY_ID = gql`
  query GetWorkerById($id: String!) {
    worker(id: $id) {
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
      }
      freelanceServices {
        id
        title
      }
      chatParticipants {
        chat {
          id
          status
        }
      }
    }
  }
`;

// ➕ Create Worker
export const CREATE_WORKER = gql`
  mutation CreateWorker($createWorkerInput: CreateWorkerInput!) {
    createWorker(createWorkerInput: $createWorkerInput) {
      id
      email
      fullName
      role
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// ❌ Delete Worker
export const DELETE_WORKER = gql`
  mutation DeleteWorker($id: String!) {
    deleteWorker(id: $id) {
      id
      fullName
    }
  }
`;

// ======================
// WORKER ENTITIES
// ======================

export const WORKER_ENTITY = gql`
  fragment WorkerEntity on WorkerEntity {
    id
    email
    fullName
    role
    phone
    bio
    avatar
    isVerified
    lastLogin
    createdAt
    updatedAt
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
      address
      phone
      avatar
      coverImage
      stores {
        id
        name
        address
      }
    }
    kyc {
      id
      status
      documentUrl
      submittedAt
      verifiedAt
    }
    sales {
      id
      storeId
      store {
        id
        name
      }
      totalAmount
      discount
      paymentMethod
      status
      createdAt
      updatedAt
      saleProducts {
        id
        quantity
        price
        modifiers
        product {
          id
          title
          price
          stockQuantity
        }
      }
    }
    shifts {
      id
      storeId
      store {
        id
        name
      }
      startTime
      endTime
      sales
      createdAt
      updatedAt
    }
    workerServiceAssignments {
      id
      role
      assignedAt
      freelanceService {
        id
        title
        description
        rate
        category
      }
    }
    chatParticipants {
      id
      chat {
        id
        status
        createdAt
        updatedAt
        messages {
          id
          content
          senderType
          createdAt
        }
      }
    }
    medias {
      id
      url
      type
    }
    auditLogs {
      id
      action
      entityType
      createdAt
    }
  }
`;

export const SALE_ENTITY = gql`
  fragment SaleEntity on SaleEntityWorker {
    id
    storeId
    store {
      id
      name
    }
    workerId
    worker {
      id
      fullName
    }
    clientId
    client {
      id
      fullName
      username
      email
      avatar
    }
    totalAmount
    discount
    paymentMethod
    status
    createdAt
    updatedAt
    saleProducts {
      id
      saleId
      productId
      product {
        id
        title
        price
        stockQuantity
        description
        media {
          url
        }
      }
      quantity
      price
      modifiers
    }
    returns {
      id
      reason
      status
      createdAt
    }
  }
`;

export const SALE_PRODUCT_ENTITY = gql`
  fragment SaleProductEntity on SaleProduct {
    id
    saleId
    productId
    product {
      id
      title
      price
      stockQuantity
    }
    quantity
    price
    modifiers
    createdAt
  }
`;

export const INVENTORY_ADJUSTMENT_ENTITY = gql`
  fragment InventoryAdjustmentEntity on InventoryAdjustment {
    id
    productId
    product {
      id
      title
      price
    }
    storeId
    store {
      id
      name
    }
    adjustmentType
    quantity
    reason
    createdAt
  }
`;

export const SHIFT_ENTITY = gql`
  fragment ShiftEntity on ShiftEntityWorker {
    id
    workerId
    worker {
      id
      fullName
    }
    storeId
    store {
      id
      name
    }
    startTime
    endTime
    sales
    transactionCount
    createdAt
    updatedAt
  }
`;

export const CHAT_ENTITY = gql`
  fragment ChatEntity on Chat {
    id
    status
    createdAt
    updatedAt
    messages {
      id
      message
      senderType
      senderId
      createdAt
    }
    business {
      id
      name
      avatar
    }
    client {
      id
      fullName
      avatar
    }
  }
`;

export const CHAT_MESSAGE_ENTITY = gql`
  fragment ChatMessageEntity on ChatMessage {
    id
    chatId
    message
    senderType
    senderId
    createdAt
  }
`;

// ======================
// QUERIES
// ======================
export const GET_WORKER_DASHBOARD = gql`
  query GetWorkerDashboard($workerId: String!, $storeId: String!) {
    workerDashboard(workerId: $workerId, storeId: $storeId) {
      todaySales
      todayOrders
      lowStockItems
      activeChats
      currentShift {
        id
        startTime
        sales
        transactions
      }
      salesThisWeek
      salesThisMonth
      topSellingProducts {
        id
        title
        quantitySold
        revenue
      }
      recentOrders {
        id
        orderNumber
        totalAmount
        status
        client {
          id
          fullName
          avatar
        }
        createdAt
      }
      workerPerformance {
        totalSales
        totalTransactions
        customerSatisfaction
        attendanceRate
        shiftsCompleted
        personalSales
      }
    }
  }
`;
export const GET_WORKER_PROFILE = gql`
  query GetWorkerProfile($id: String!) {
    worker(id: $id) {
      ...WorkerEntity
    }
  }
  ${WORKER_ENTITY}
`;

export const GET_WORKER_SALES = gql`
  query GetWorkerSales(
    $workerId: String!
    $storeId: String
    $status: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
  ) {
    workerSales(
      workerId: $workerId
      storeId: $storeId
      status: $status
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        ...SaleEntity
      }
      total
      page
      limit
    }
  }
  ${SALE_ENTITY}
`;

export const GET_WORKER_CURRENT_SALE = gql`
  query GetWorkerCurrentSale($workerId: String!, $storeId: String!) {
    workerCurrentSale(workerId: $workerId, storeId: $storeId) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const GET_WORKER_INVENTORY = gql`
  query GetWorkerInventory(
    $storeId: String!
    $productId: String
    $lowStockOnly: Boolean
    $page: Int = 1
    $limit: Int = 20
  ) {
    workerInventory(
      storeId: $storeId
      productId: $productId
      lowStockOnly: $lowStockOnly
      page: $page
      limit: $limit
    ) {
      items {
        id
        productId
        product {
          id
          title
          price
          stockQuantity
          quantity
          media {
            url
          }
        }
        storeId
        quantity
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;

export const GET_WORKER_SHIFTS = gql`
  query GetWorkerShifts(
    $workerId: String!
    $storeId: String
    $startDate: DateTime
    $endDate: DateTime
    $page: Int = 1
    $limit: Int = 20
  ) {
    workerShifts(
      workerId: $workerId
      storeId: $storeId
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      items {
        ...ShiftEntity
      }
      total
      page
      limit
    }
  }
  ${SHIFT_ENTITY}
`;

export const GET_WORKER_CHATS = gql`
  query GetWorkerChats($workerId: String!, $page: Int = 1, $limit: Int = 20) {
    workerChats(workerId: $workerId, page: $page, limit: $limit) {
      items {
        ...ChatEntity
      }
      total
      page
      limit
    }
  }
  ${CHAT_ENTITY}
`;

export const GET_WORKER_CURRENT_SHIFT = gql`
  query GetWorkerCurrentShift($workerId: String!, $storeId: String!) {
    workerCurrentShift(workerId: $workerId, storeId: $storeId) {
      ...ShiftEntity
    }
  }
  ${SHIFT_ENTITY}
`;

export const GET_WORKER_DASHBOARD_STATS = gql`
  query GetWorkerDashboardStats($workerId: String!, $storeId: String!) {
    workerDashboardStats(workerId: $workerId, storeId: $storeId) {
      todaySales
      todayTransactions
      currentShiftSales
      currentShiftDuration
      lowStockProducts
      upcomingChats
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_SALE = gql`
  mutation CreateSale($input: CreateSaleInput!) {
    createSale(input: $input) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const ADD_SALE_PRODUCT = gql`
  mutation AddSaleProduct($input: AddSaleProductInput!) {
    addSaleProduct(input: $input) {
      ...SaleProductEntity
    }
  }
  ${SALE_PRODUCT_ENTITY}
`;

export const UPDATE_SALE_PRODUCT = gql`
  mutation UpdateSaleProduct($id: String!, $input: UpdateSaleProductInput!) {
    updateSaleProduct(id: $id, input: $input) {
      ...SaleProductEntity
    }
  }
  ${SALE_PRODUCT_ENTITY}
`;

export const REMOVE_SALE_PRODUCT = gql`
  mutation RemoveSaleProduct($id: String!) {
    removeSaleProduct(id: $id) {
      id
    }
  }
`;

export const COMPLETE_SALE = gql`
  mutation CompleteSale($id: String!, $paymentMethod: PaymentMethod!) {
    completeWorkerSale(id: $id, paymentMethod: $paymentMethod) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const START_SHIFT = gql`
  mutation StartShift($input: StartShiftInput!) {
    startShift(input: $input) {
      ...ShiftEntity
    }
  }
  ${SHIFT_ENTITY}
`;

export const END_SHIFT = gql`
  mutation EndShift($input: EndWorkerShiftInput!) {
    endWorkerShift(input: $input) {
      id
      workerId
      worker {
        id
        fullName
      }
      storeId
      store {
        id
        name
      }
      startTime
      endTime
      sales
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_INVENTORY_ADJUSTMENT = gql`
  mutation CreateInventoryAdjustment($input: CreateInventoryAdjustmentInput!) {
    createInventoryAdjustment(input: $input) {
      ...InventoryAdjustmentEntity
    }
  }
  ${INVENTORY_ADJUSTMENT_ENTITY}
`;

export const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage($input: SendChatMessageInput!) {
    sendMessage(input: $input) {
      ...ChatMessageEntity
    }
  }
  ${CHAT_MESSAGE_ENTITY}
`;

export const UPDATE_WORKER_PROFILE = gql`
  mutation UpdateWorkerProfile($id: String!, $updateWorkerInput: UpdateWorkerInput!) {
    updateWorker(id: $id, updateWorkerInput: $updateWorkerInput) {
      ...WorkerEntity
    }
  }
  ${WORKER_ENTITY}
`;

export const PROCESS_MOBILE_MONEY_PAYMENT = gql`
  mutation ProcessMobileMoneyPayment($input: ProcessMobileMoneyInput!) {
    processMobileMoneyPayment(input: $input) {
      success
      transactionId
      status
      ussdCode
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_SALE_CREATED = gql`
  subscription OnSaleCreated($storeId: String!) {
    saleCreated(storeId: $storeId) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const ON_SALE_UPDATED = gql`
  subscription OnSaleUpdated($storeId: String!) {
    saleUpdated(storeId: $storeId) {
      ...SaleEntity
    }
  }
  ${SALE_ENTITY}
`;

export const ON_NEW_CHAT_MESSAGE = gql`
  subscription OnNewChatMessage($workerId: String!) {
    newChatMessage(workerId: $workerId) {
      ...ChatMessageEntity
    }
  }
  ${CHAT_MESSAGE_ENTITY}
`;

export const ON_INVENTORY_UPDATED = gql`
  subscription OnInventoryUpdated($storeId: String!) {
    inventoryUpdated(storeId: $storeId) {
      id
      productId
      quantity
      storeId
    }
  }
`;

export const ON_NEW_SHIFT_STARTED = gql`
  subscription OnNewShiftStarted($workerId: String!) {
    newShiftStarted(workerId: $workerId) {
      ...ShiftEntity
    }
  }
  ${SHIFT_ENTITY}
`;

export const ON_SHIFT_ENDED = gql`
  subscription OnShiftEnded($workerId: String!) {
    shiftEnded(workerId: $workerId) {
      ...ShiftEntity
    }
  }
  ${SHIFT_ENTITY}
`;
