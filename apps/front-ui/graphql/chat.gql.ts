import { gql } from '@apollo/client';

// ======================
// QUERIES
// ======================

export const GET_CHATS = gql`
  query GetChats(
    $productId: String
    $clientId: String
    $businessId: String
    $workerId: String
    $status: String
    $search: String
    $page: Float = 1
    $limit: Float = 20
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
        id
        status
        isSecure
        negotiationType
        createdAt
        updatedAt
        product {
          id
          title
          description
          business { id name }
          }
          service {
            id
            title
            description
            business { id name }
        }
        participants {
          id
          clientId
          client {
            id
            fullName
            avatar
          }
          businessId
          business {
            id
            name
            avatar
          }
          workerId
          worker {
            id
            fullName
          }
        }
        messages {
          id
          content
          senderId
          createdAt
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_CHAT_BY_ID = gql`
  query GetChat($id: String!) {
    chat(id: $id) {
      id
      status
      createdAt
      updatedAt
      product {
        id
        title
        price
        business { id name }
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
  }
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
      hasMore
      cursor
    }
  }
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

export const GET_CHATS_BY_PARTICIPANT = gql`
  query GetChatsByParticipant($participantId: String!) {
    chatsByParticipant(participantId: $participantId) {
      id
      status
      isSecure
      negotiationType
      createdAt
      updatedAt
      product {
        id
        title
        description
        business { id name }
        }
        service {
          id
          title
          description
          business { id name }
      }
      participants {
        id
        clientId
        client {
          id
        }
        businessId
        business {
          id
        }
        workerId
        worker {
          id
        }
      }
      messages {
        id
        content
        senderId
        createdAt
      }
    }
  }
`;

export const GET_CHAT_NOTIFICATIONS = gql`
  query GetChatNotifications($userId: String!) {
    chatNotifications(userId: $userId){
      id
      chatId
      userId
      lastReadAt
      unreadCount
      createdAt
      updatedAt
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_CHAT = gql`
  mutation CreateChat($input: CreateChatInput!) {
    createChat(createChatInput: $input) {
      id
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
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
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
  }
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
  mutation UpdateChatStatus($id: String!, $status: String!) {
    updateChatStatus(id: $id, status: $status) {
      id
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
  }
`;

export const START_NEGOTIATION = gql`
  mutation StartNegotiation($input: StartNegotiationInput!) {
    startNegotiation(input: $input) {
      id
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
  }
`;

export const ACCEPT_NEGOTIATION = gql`
  mutation AcceptNegotiation($negotiationId: String!) {
    acceptNegotiation(negotiationId: $negotiationId) {
      id
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
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================

export const ON_CHAT_CREATED = gql`
  subscription OnChatCreated($userId: String!) {
    chatCreated(userId: $userId) {
      id
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
  }
`;

export const ON_MESSAGE_RECEIVED = gql`
  subscription OnMessageReceived($chatId: String!) {
    messageReceived(chatId: $chatId) {
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
  }
`;

export const ON_CHAT_STATUS_UPDATED = gql`
  subscription OnChatStatusUpdated($userId: String!) {
    chatStatusUpdated(userId: $userId) {
      id
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
  }
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