import { gql } from "@apollo/client";

// 📦 Get All ReOwned Products
export const GET_REOWNED_PRODUCTS = gql`
  query GetReOwnedProducts {
    reOwnedProducts {
      id
      newProductId
      originalProductId
      oldOwnerId
      newOwnerId
      quantity
      oldPrice
      newPrice
      markupPercentage
      agreedViaChatId
      agreementDate
      isOriginalApproved
      isNewOwnerApproved
      shippingId
      createdAt
      newProduct {
        id
        title
      }
      originalProduct {
        id
        title
      }
      shipping {
        id
        status
      }
    }
  }
`;

// 📦 Get ReOwned Product by ID
export const GET_REOWNED_PRODUCT_BY_ID = gql`
  query GetReOwnedProductById($id: String!) {
    reOwnedProduct(id: $id) {
      id
      newProductId
      originalProductId
      oldOwnerId
      newOwnerId
      quantity
      oldPrice
      newPrice
      markupPercentage
      agreedViaChatId
      agreementDate
      isOriginalApproved
      isNewOwnerApproved
      shippingId
      createdAt
      newProduct {
        id
        title
      }
      originalProduct {
        id
        title
      }
      shipping {
        id
        status
      }
    }
  }
`;

// 📦 Get ReOwned Products by Owner
export const GET_REOWNED_PRODUCTS_BY_OWNER = gql`
  query GetReOwnedProductsByOwner($ownerId: String!) {
    reOwnedProducts(ownerId: $ownerId) {
      id
      newProductId
      originalProductId
      oldOwnerId
      newOwnerId
      quantity
      oldPrice
      newPrice
      markupPercentage
      agreedViaChatId
      agreementDate
      isOriginalApproved
      isNewOwnerApproved
      shippingId
      createdAt
      newProduct {
        id
        title
      }
      originalProduct {
        id
        title
      }
      shipping {
        id
        status
      }
    }
  }
`;

// ➕ Create ReOwned Product
export const CREATE_REOWNED_PRODUCT = gql`
  mutation CreateReOwnedProduct($createReOwnedProductInput: CreateReOwnedProductInput!) {
    createReOwnedProduct(createReOwnedProductInput: $createReOwnedProductInput) {
      id
      newProductId
      originalProductId
      oldOwnerId
      newOwnerId
      quantity
      oldPrice
      newPrice
      markupPercentage
      agreedViaChatId
      agreementDate
      isOriginalApproved
      isNewOwnerApproved
      shippingId
      createdAt
    }
  }
`;

// ✏ Update ReOwned Product
export const UPDATE_REOWNED_PRODUCT = gql`
  mutation UpdateReOwnedProduct($id: String!, $updateReOwnedProductInput: UpdateReOwnedProductInput!) {
    updateReOwnedProduct(id: $id, updateReOwnedProductInput: $updateReOwnedProductInput) {
      id
      newProductId
      originalProductId
      oldOwnerId
      newOwnerId
      quantity
      oldPrice
      newPrice
      markupPercentage
      agreedViaChatId
      agreementDate
      isOriginalApproved
      isNewOwnerApproved
      shippingId
      createdAt
    }
  }
`;

// ❌ Delete ReOwned Product
export const DELETE_REOWNED_PRODUCT = gql`
  mutation DeleteReOwnedProduct($id: String!) {
    deleteReOwnedProduct(id: $id) {
      id
      newProductId
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