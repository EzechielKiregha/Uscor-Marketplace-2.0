import { gql } from '@apollo/client';

// ======================
// CHAT ENTITIES
// ======================

export const CHAT_ENTITY = gql`
  fragment ChatEntity on Chat {
    id
    productId
    clientId
    businessId
    workerId
    status
    createdAt
    updatedAt
    product {
      id
      title
      price
    }
    client {
      id
      fullName
      avatar
    }
    business {
      id
      name
      avatar
    }
    worker {
      id
      fullName
      avatar
    }
    messages {
      id
      content
      senderType
      senderId
      createdAt
    }
  }
`;

export const CHAT_MESSAGE_ENTITY = gql`
  fragment ChatMessageEntity on ChatMessage {
    id
    chatId
    content
    senderType
    senderId
    createdAt
    sender {
      id
      fullName
      avatar
    }
  }
`;

export const CHAT_NOTIFICATION_ENTITY = gql`
  fragment ChatNotificationEntity on ChatNotification {
    id
    chatId
    userId
    lastReadAt
    unreadCount
    createdAt
    updatedAt
  }
`;

// ======================
// QUERIES
// ======================

export const GET_CHATS = gql`
  query GetChats(
    $productId: String
    $clientId: String
    $businessId: String
    $workerId: String
    $status: ChatStatus
    $search: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    chats(
      productId: $productId
      clientId: $clientId
      businessId: $businessId
      workerId: $workerId
      status: $status
      search: $search
      page: $page
      limit: $limit
    ) {
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

export const GET_CHAT_BY_ID = gql`
  query GetChatById($id: String!) {
    chat(id: $id) {
      ...ChatEntity
    }
  }
  ${CHAT_ENTITY}
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages(
    $chatId: String!
    $after: String
    $before: String
    $limit: Int = 20
  ) {
    chatMessages(
      chatId: $chatId
      after: $after
      before: $before
      limit: $limit
    ) {
      items {
        ...ChatMessageEntity
      }
      hasMore
      cursor
    }
  }
  ${CHAT_MESSAGE_ENTITY}
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount($userId: String!) {
    unreadChatCount(userId: $userId) {
      totalUnread
      chatsWithUnread {
        chatId
        unreadCount
      }
    }
  }
`;

export const GET_CHAT_NOTIFICATIONS = gql`
  query GetChatNotifications($userId: String!) {
    chatNotifications(userId: $userId) {
      ...ChatNotificationEntity
    }
  }
  ${CHAT_NOTIFICATION_ENTITY}
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_CHAT = gql`
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      ...ChatEntity
    }
  }
  ${CHAT_ENTITY}
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      ...ChatMessageEntity
    }
  }
  ${CHAT_MESSAGE_ENTITY}
`;

export const MARK_MESSAGES_AS_READ = gql`
  mutation MarkMessagesAsRead($chatId: String!, $userId: String!) {
    markMessagesAsRead(chatId: $chatId, userId: $userId) {
      success
      unreadCount
    }
  }
`;

export const UPDATE_CHAT_STATUS = gql`
  mutation UpdateChatStatus($id: String!, $status: ChatStatus!) {
    updateChatStatus(id: $id, status: $status) {
      ...ChatEntity
    }
  }
  ${CHAT_ENTITY}
`;

export const START_NEGOTIATION = gql`
  mutation StartNegotiation($input: StartNegotiationInput!) {
    startNegotiation(input: $input) {
      ...ChatEntity
    }
  }
  ${CHAT_ENTITY}
`;

export const ACCEPT_NEGOTIATION = gql`
  mutation AcceptNegotiation($negotiationId: String!) {
    acceptNegotiation(negotiationId: $negotiationId) {
      ...ChatEntity
    }
  }
  ${CHAT_ENTITY}
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_CHAT_CREATED = gql`
  subscription OnChatCreated($userId: String!) {
    chatCreated(userId: $userId) {
      ...ChatEntity
    }
  }
  ${CHAT_ENTITY}
`;

export const ON_MESSAGE_RECEIVED = gql`
  subscription OnMessageReceived($chatId: String!) {
    messageReceived(chatId: $chatId) {
      ...ChatMessageEntity
    }
  }
  ${CHAT_MESSAGE_ENTITY}
`;

export const ON_CHAT_STATUS_UPDATED = gql`
  subscription OnChatStatusUpdated($userId: String!) {
    chatStatusUpdated(userId: $userId) {
      ...ChatEntity
    }
  }
  ${CHAT_ENTITY}
`;

export const ON_UNREAD_COUNT_UPDATED = gql`
  subscription OnUnreadCountUpdated($userId: String!) {
    unreadCountUpdated(userId: $userId) {
      totalUnread
      chatId
      unreadCount
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