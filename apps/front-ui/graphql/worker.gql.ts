import { gql } from "@apollo/client";

// 📦 Get All Workers
export const GET_WORKERS = gql`
  query GetWorkers {
    workers {
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
      chats {
        id
        status
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
      chats {
        id
        status
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

// ✏ Update Worker
export const UPDATE_WORKER = gql`
  mutation UpdateWorker($id: String!, $updateWorkerInput: UpdateWorkerInput!) {
    updateWorker(id: $id, updateWorkerInput: $updateWorkerInput) {
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