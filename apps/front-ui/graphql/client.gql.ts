import { gql } from "@apollo/client";

// 📦 Get All Clients
export const GET_CLIENTS = gql`
  query GetClients {
    clients {
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
        totalAmount
      }
      reviews {
        id
        productId
        rating
      }
      chats {
        id
        status
      }
      recharges {
        id
        amount
      }
      freelanceOrders {
        id
        status
      }
      referralsMade {
        id
        referredClientId
      }
      referralsReceived {
        id
        affiliateClientId
      }
    }
  }
`;

// 📦 Get Client by ID
export const GET_CLIENT_BY_ID = gql`
  query GetClientById($id: String!) {
    client(id: $id) {
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
        totalAmount
      }
      reviews {
        id
        productId
        rating
      }
      chats {
        id
        status
      }
      recharges {
        id
        amount
      }
      freelanceOrders {
        id
        status
      }
      referralsMade {
        id
        referredClientId
      }
      referralsReceived {
        id
        affiliateClientId
      }
    }
  }
`;

// ➕ Create Client
export const CREATE_CLIENT = gql`
  mutation CreateClient($createClientInput: CreateClientInput!) {
    createClient(createClientInput: $createClientInput) {
      id
      username
      email
      fullName
      address
      phone
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// ✏ Update Client
export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: String!, $updateClientInput: UpdateClientInput!) {
    updateClient(id: $id, updateClientInput: $updateClientInput) {
      id
      username
      email
      fullName
      address
      phone
      isVerified
      createdAt
      updatedAt
    }
  }
`;

// ❌ Delete Client
export const DELETE_CLIENT = gql`
  mutation DeleteClient($id: String!) {
    deleteClient(id: $id) {
      id
      username
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