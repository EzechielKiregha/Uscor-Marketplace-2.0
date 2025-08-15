import { gql } from "@apollo/client";

// 📦 Get All Chat Participants
export const GET_CHAT_PARTICIPANTS = gql`
  query GetChatParticipants {
    chatParticipants {
      id
      chatId
      clientId
      businessId
      workerId
      createdAt
      client {
        id
        username
      }
      business {
        id
        name
      }
      worker {
        id
        fullName
      }
    }
  }
`;

// 📦 Get Chat Participant by ID
export const GET_CHAT_PARTICIPANT_BY_ID = gql`
  query GetChatParticipantById($id: String!) {
    chatParticipant(id: $id) {
      id
      chatId
      clientId
      businessId
      workerId
      createdAt
      client {
        id
        username
      }
      business {
        id
        name
      }
      worker {
        id
        fullName
      }
    }
  }
`;

// 📦 Get Chat Participants by Chat
export const GET_CHAT_PARTICIPANTS_BY_CHAT = gql`
  query GetChatParticipantsByChat($chatId: String!) {
    chatParticipants(chatId: $chatId) {
      id
      chatId
      clientId
      businessId
      workerId
      createdAt
      client {
        id
        username
      }
      business {
        id
        name
      }
      worker {
        id
        fullName
      }
    }
  }
`;

// ➕ Create Chat Participant
export const CREATE_CHAT_PARTICIPANT = gql`
  mutation CreateChatParticipant($createChatParticipantInput: CreateChatParticipantInput!) {
    createChatParticipant(createChatParticipantInput: $createChatParticipantInput) {
      id
      chatId
      clientId
      businessId
      workerId
      createdAt
    }
  }
`;

// ✏ Update Chat Participant
export const UPDATE_CHAT_PARTICIPANT = gql`
  mutation UpdateChatParticipant($id: String!, $updateChatParticipantInput: UpdateChatParticipantInput!) {
    updateChatParticipant(id: $id, updateChatParticipantInput: $updateChatParticipantInput) {
      id
      chatId
      clientId
      businessId
      workerId
      createdAt
    }
  }
`;

// ❌ Delete Chat Participant
export const DELETE_CHAT_PARTICIPANT = gql`
  mutation DeleteChatParticipant($id: String!) {
    deleteChatParticipant(id: $id) {
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