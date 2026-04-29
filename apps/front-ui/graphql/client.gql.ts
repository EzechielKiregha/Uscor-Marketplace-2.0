import { gql } from "@apollo/client";

// 📦 Search Clients
export const SEARCH_CLIENTS = gql`
  query SearchClients($query: String!) {
    searchClients(query: $query) {
      id
      username
      email
      fullName
      phone
      address
      avatar
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// 📦 Get Client by Email
export const GET_CLIENT_BY_EMAIL = gql`
  query GetClientByEmail($email: String!) {
    clientByEmail(email: $email) {
      id
      username
      email
      fullName
      phone
      address
      avatar
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// 📦 Create Client for POS
export const CREATE_CLIENT_FOR_POS = gql`
  mutation CreateClientForPOS($createClientInput: CreateClientForPOSInput!) {
    createClientForPOS(createClientInput: $createClientInput) {
      id
      username
      email
      fullName
      phone
      address
      avatar
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// 📦 Get All Clients
export const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      username
      email
      fullName
      phone
      address
      avatar
      isVerified
      createdAt
      updatedAt
    }
  }
`;
