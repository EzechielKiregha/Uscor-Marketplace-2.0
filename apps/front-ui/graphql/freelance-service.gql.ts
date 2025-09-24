import { gql } from "@apollo/client";

// 📦 Get All Freelance Services
export const GET_FREELANCE_SERVICES = gql`
  query GetFreelanceServices($category: FreelanceServiceCategory) {
    freelanceServices(category: $category) {
      items {
        id
        title
        description
        isHourly
        rate
        category
        createdAt
        updatedAt
        business {
          id
          name
          avatar
        }
        workerServiceAssignments {
          id
          role
          assignedAt
        }
      }
      limit
      total
      page
    }
  }
`;

// 📦 Get Freelance Service by ID
export const GET_FREELANCE_SERVICE_BY_ID = gql`
  query GetFreelanceServiceById($id: String!) {
    freelanceService(id: $id) {
      id
      title
      description
      isHourly
      rate
      category
      createdAt
      updatedAt
      business {
        id
        name
        avatar
      }
      workerServiceAssignments {
        id
        role
        assignedAt
      }
    }
  }
`;

// ➕ Create Freelance Service
export const CREATE_FREELANCE_SERVICE = gql`
  mutation CreateFreelanceService($createFreelanceServiceInput: CreateFreelanceServiceInput!) {
    createFreelanceService(createFreelanceServiceInput: $createFreelanceServiceInput) {
      id
      title
      description
      isHourly
      rate
      category
      createdAt
      updatedAt
    }
  }
`;

// ✏ Update Freelance Service
export const UPDATE_FREELANCE_SERVICE = gql`
  mutation UpdateFreelanceService($id: String!, $updateFreelanceServiceInput: UpdateFreelanceServiceInput!) {
    updateFreelanceService(id: $id, updateFreelanceServiceInput: $updateFreelanceServiceInput) {
      id
      title
      description
      isHourly
      rate
      category
      createdAt
      updatedAt
    }
  }
`;

// ❌ Delete Freelance Service
export const DELETE_FREELANCE_SERVICE = gql`
  mutation DeleteFreelanceService($id: String!) {
    deleteFreelanceService(id: $id) {
      id
      title
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