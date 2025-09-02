import { gql } from '@apollo/client';

// Client Entity Fragment
export const CLIENT_ENTITY = gql`
  fragment ClientEntity on ClientEntity {
    id
    username
    email
    fullName
    address
    phone
    avatar
    isVerified
    createdAt
    updatedAt
  }
`;

// Queries
export const SEARCH_CLIENTS = gql`
  query SearchClients($query: String!) {
    searchClients(query: $query) {
      ...ClientEntity
    }
  }
  ${CLIENT_ENTITY}
`;

export const GET_CLIENT_BY_EMAIL = gql`
  query GetClientByEmail($email: String!) {
    clientByEmail(email: $email) {
      ...ClientEntity
    }
  }
  ${CLIENT_ENTITY}
`;

// Mutations
export const CREATE_CLIENT_FOR_POS = gql`
  mutation CreateClientForPOS($createClientInput: CreateClientForPOSInput!) {
    createClientForPOS(createClientInput: $createClientInput) {
      ...ClientEntity
    }
  }
  ${CLIENT_ENTITY}
`;