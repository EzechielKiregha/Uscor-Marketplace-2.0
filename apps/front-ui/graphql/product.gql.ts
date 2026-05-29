import { gql } from "@apollo/client";

// ======================
// QUERIES
// ======================

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      title
      description
      price
      quantity
      featured
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
      medias {
        id
        url
        type
      }
      business {
        id
        name
        avatar
        isB2BEnabled
        isVerified
        businessType
      }
      store {
        id
        name
      }
    }
  }
`;
export const GET_PRODUCTS_BY_BUSINESS_ID = gql`
  query FetchedBusinessProducts {
    fetchedBusinessProducts {
      id
      title
      description
      price
      quantity
      featured
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
      medias {
        id
        url
        type
      }
      business {
        id
        name
        avatar
        isB2BEnabled
        businessType
        isVerified
      }
      store {
        id
        name
      }
    }
  }
`;
export const GET_PRODUCTS_BY_NAME = gql`
  query GetProductsByName($storeId: String!, $title: String!) {
    productsByName(storeId: $storeId, title: $title) {
      id
      title
      description
      price
      quantity
      featured
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
      medias {
        id
        url
        type
      }
      business {
        id
        name
        avatar
        isB2BEnabled
        isVerified
        businessType
      }
      store {
        id
        name
      }
    }
  }
`;
export const SEARCHED_PRODUCTS = gql`
  query GetSearchedProducts($title: String!) {
    searchedProducts(title: $title) {
      id
      title
      description
      price
      quantity
      featured
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
      medias {
        id
        url
        type
      }
      business {
        id
        name
        avatar
        isB2BEnabled
        isVerified
        businessType
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      title
      description
      price
      quantity
      featured
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
      medias {
        id
        url
        type
      }
      business {
        id
        name
        avatar
        isB2BEnabled
        isVerified
        businessType
      }
      store {
        id
        name
      }
    }
  }
`;

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts {
    featuredProducts {
      id
      title
      description
      price
      quantity
      featured
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
      medias {
        id
        url
        type
      }
      business {
        id
        name
        avatar
        isB2BEnabled
        isVerified
        businessType
      }
    }
  }
`;
export const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($category: String!) {
    relatedProducts(category: $category) {
      id
      title
      description
      price
      quantity
      featured
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
      medias {
        id
        url
        type
      }
      business {
        id
        name
        avatar
        isB2BEnabled
        isVerified
        businessType
      }
    }
  }
`;

// ======================
// MUTATIONS
// ======================
const PRODUCT_FIELDS = gql`
  fragment ProductFields on ProductEntity {
    id
    title
    description
    price
    quantity
    featured
    isPhysical
    approvedForSale
    createdAt
    updatedAt
    category {
      id
      name
      description
    }
    medias {
      id
      url
      pathname
      type
      size
    }
    business {
      id
      name
      avatar
    }
    store {
      id
      name
    }
  }
`;
 
// ── Mutations ─────────────────────────────────────────────────────────────────
 
export const CREATE_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  mutation CreateProduct(
    $input: CreateProductInput!
    $mediaInputs: [AddMediaInput!]
  ) {
    createProduct(input: $input, mediaInputs: $mediaInputs) {
      ...ProductFields
    }
  }
`;
 
export const UPDATE_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  mutation UpdateProduct(
    $id: String!
    $input: UpdateProductInput!
    $mediaInputs: [AddMediaInput!]
  ) {
    updateProduct(id: $id, input: $input, mediaInputs: $mediaInputs) {
      ...ProductFields
    }
  }
`;
 

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

export const ADD_PRODUCT_MEDIA = gql`
  mutation AddProductMedia($productId: String!, $input: AddMediaInput!) {
    addProductMedia(productId: $productId, input: $input) {
      id
      url
      type
      productId
      createdAt
    }
  }
`;

export const REMOVE_PRODUCT_MEDIA = gql`
  mutation RemoveProductMedia($mediaId: String!) {
    removeProductMedia(mediaId: $mediaId) {
      id
    }
  }
`;

// ======================
// SUBSCRIPTIONS
// ======================


// ── Subscriptions ─────────────────────────────────────────────────────────────
 
export const ON_PRODUCT_CREATED = gql`
  ${PRODUCT_FIELDS}
  subscription OnProductCreated($businessId: String!) {
    productCreated(businessId: $businessId) {
      ...ProductFields
    }
  }
`;
 
export const ON_PRODUCT_UPDATED = gql`
  ${PRODUCT_FIELDS}
  subscription OnProductUpdated($businessId: String!) {
    productUpdated(businessId: $businessId) {
      ...ProductFields
    }
  }
`;