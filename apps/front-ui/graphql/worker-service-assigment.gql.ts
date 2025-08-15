import { gql } from "@apollo/client";

// 📦 Get All Worker Service Assignments
export const GET_WORKER_SERVICE_ASSIGNMENTS = gql`
  query GetWorkerServiceAssignments {
    workerServiceAssignments {
      id
      role
      assignedAt
      worker {
        id
        fullName
      }
    }
  }
`;

// 📦 Get Worker Service Assignment by ID
export const GET_WORKER_SERVICE_ASSIGNMENT_BY_ID = gql`
  query GetWorkerServiceAssignmentById($id: String!) {
    workerServiceAssignment(id: $id) {
      id
      role
      assignedAt
      worker {
        id
        fullName
      }
    }
  }
`;

// 📦 Get Worker Service Assignments by Worker
export const GET_WORKER_SERVICE_ASSIGNMENTS_BY_WORKER = gql`
  query GetWorkerServiceAssignmentsByWorker($workerId: String!) {
    workerServiceAssignments(workerId: $workerId) {
      id
      role
      assignedAt
      worker {
        id
        fullName
      }
    }
  }
`;

// ➕ Create Worker Service Assignment
export const CREATE_WORKER_SERVICE_ASSIGNMENT = gql`
  mutation CreateWorkerServiceAssignment($createWorkerServiceAssignmentInput: CreateWorkerServiceAssignmentInput!) {
    createWorkerServiceAssignment(createWorkerServiceAssignmentInput: $createWorkerServiceAssignmentInput) {
      id
      role
      assignedAt
    }
  }
`;

// ✏ Update Worker Service Assignment
export const UPDATE_WORKER_SERVICE_ASSIGNMENT = gql`
  mutation UpdateWorkerServiceAssignment($id: String!, $updateWorkerServiceAssignmentInput: UpdateWorkerServiceAssignmentInput!) {
    updateWorkerServiceAssignment(id: $id, updateWorkerServiceAssignmentInput: $updateWorkerServiceAssignmentInput) {
      id
      role
      assignedAt
    }
  }
`;

// ❌ Delete Worker Service Assignment
export const DELETE_WORKER_SERVICE_ASSIGNMENT = gql`
  mutation DeleteWorkerServiceAssignment($id: String!) {
    deleteWorkerServiceAssignment(id: $id) {
      id
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