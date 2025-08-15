import { gql } from "@apollo/client";

// 📦 Get All Chats
export const GET_CHATS = gql`
  query GetChats {
    chats {
      id
      status
      isSecure
      negotiationType
      productId
      serviceId
      createdAt
      updatedAt
      product {
        id
        title
      }
      service {
        id
        title
      }
      participants {
        id
        clientId
        businessId
        workerId
      }
      messages {
        id
        message
        senderId
        createdAt
      }
    }
  }
`;

// 📦 Get Chat by ID
export const GET_CHAT_BY_ID = gql`
  query GetChatById($id: String!) {
    chat(id: $id) {
      id
      status
      isSecure
      negotiationType
      productId
      serviceId
      createdAt
      updatedAt
      product {
        id
        title
      }
      service {
        id
        title
      }
      participants {
        id
        clientId
        businessId
        workerId
      }
      messages {
        id
        message
        senderId
        createdAt
      }
    }
  }
`;

// 📦 Get Chats by Participant
export const GET_CHATS_BY_PARTICIPANT = gql`
  query GetChatsByParticipant($participantId: String!) {
    chats(participantId: $participantId) {
      id
      status
      isSecure
      negotiationType
      productId
      serviceId
      createdAt
      updatedAt
      product {
        id
        title
      }
      service {
        id
        title
      }
      participants {
        id
        clientId
        businessId
        workerId
      }
      messages {
        id
        message
        senderId
        createdAt
      }
    }
  }
`;

// ➕ Create Chat
export const CREATE_CHAT = gql`
  mutation CreateChat($createChatInput: CreateChatInput!) {
    createChat(createChatInput: $createChatInput) {
      id
      status
      isSecure
      negotiationType
      productId
      serviceId
      createdAt
      updatedAt
    }
  }
`;

// ✏ Update Chat
export const UPDATE_CHAT = gql`
  mutation UpdateChat($id: String!, $updateChatInput: UpdateChatInput!) {
    updateChat(id: $id, updateChatInput: $updateChatInput) {
      id
      status
      isSecure
      negotiationType
      productId
      serviceId
      createdAt
      updatedAt
    }
  }
`;

// ❌ Delete Chat
export const DELETE_CHAT = gql`
  mutation DeleteChat($id: String!) {
    deleteChat(id: $id) {
      id
    }
  }
`;

// ➕ Send Message
export const SEND_MESSAGE = gql`
  mutation SendMessage($createChatMessageInput: CreateChatMessageInput!) {
    sendMessage(createChatMessageInput: $createChatMessageInput) {
      id
      chatId
      message
      senderId
      createdAt
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