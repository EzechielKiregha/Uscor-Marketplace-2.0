import { gql } from '@apollo/client';

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
      }
    }
  }
`;

// ======================
// MUTATIONS
// ======================

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
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
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
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
    }
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

export const ON_PRODUCT_CREATED = gql`
  subscription OnProductCreated($businessId: String!) {
    productCreated(businessId: $businessId) {
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
    }
  }
  }
`;

export const ON_PRODUCT_UPDATED = gql`
  subscription OnProductUpdated($businessId: String!) {
    productUpdated(businessId: $businessId) {
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
    }
  }
  }
`;

