import { gql } from "@apollo/client";

// 📦 Get All Chat Messages
export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages {
    chatMessages {
      id
      chatId
      message
      senderId
      createdAt
    }
  }
`;

// 📦 Get Chat Message by ID
export const GET_CHAT_MESSAGE_BY_ID = gql`
  query GetChatMessageById($id: String!) {
    chatMessage(id: $id) {
      id
      chatId
      message
      senderId
      createdAt
    }
  }
`;

// 📦 Get Chat Messages by Chat
export const GET_CHAT_MESSAGES_BY_CHAT = gql`
  query GetChatMessagesByChat($chatId: String!) {
    chatMessages(chatId: $chatId) {
      id
      chatId
      message
      senderId
      createdAt
    }
  }
`;

// ➕ Create Chat Message
export const CREATE_CHAT_MESSAGE = gql`
  mutation CreateChatMessage($createChatMessageInput: CreateChatMessageInput!) {
    createChatMessage(createChatMessageInput: $createChatMessageInput) {
      id
      chatId
      message
      senderId
      createdAt
    }
  }
`;

// ✏ Update Chat Message
export const UPDATE_CHAT_MESSAGE = gql`
  mutation UpdateChatMessage($id: String!, $updateChatMessageInput: UpdateChatMessageInput!) {
    updateChatMessage(id: $id, updateChatMessageInput: $updateChatMessageInput) {
      id
      chatId
      message
      senderId
      createdAt
    }
  }
`;

// ❌ Delete Chat Message
export const DELETE_CHAT_MESSAGE = gql`
  mutation DeleteChatMessage($id: String!) {
    deleteChatMessage(id: $id) {
      id
      chatId
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