import { gql } from "@apollo/client";

// 📦 Get All Categories
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
      createdAt
      updatedAt
      products {
        id
        title
      }
    }
  }
`;

// 📦 Get Category by ID
export const GET_CATEGORY_BY_ID = gql`
  query GetCategoryById($id: String!) {
    category(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      products {
        id
        title
      }
    }
  }
`;

// ➕ Create Category
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {
    createCategory(createCategoryInput: $createCategoryInput) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

// ✏ Update Category
export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $updateCategoryInput: UpdateCategoryInput!) {
    updateCategory(id: $id, updateCategoryInput: $updateCategoryInput) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;

// ❌ Delete Category
export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id) {
      id
      name
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