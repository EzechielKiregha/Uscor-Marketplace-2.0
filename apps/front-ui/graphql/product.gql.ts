import { gql } from '@apollo/client';

// ======================
// PRODUCT ENTITIES
// ======================

export const PRODUCT_ENTITY = gql`
  fragment ProductEntity on Product {
    id
    title
    description
    price
    quantity
    isFeatured
    categoryId
    createdAt
    updatedAt
    category {
      id
      name
      description
    }
    media {
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
`;

export const CATEGORY_ENTITY = gql`
  fragment CategoryEntity on Category {
    id
    name
    description
    createdAt
    updatedAt
    products {
      id
      title
      price
      quantity
    }
  }
`;

export const MEDIA_ENTITY = gql`
  fragment MediaEntity on Media {
    id
    url
    type
    productId
    createdAt
  }
`;

// ======================
// QUERIES
// ======================

export const GET_PRODUCTS = gql`
  query GetProducts(
    $categoryId: String
    $minPrice: Float
    $maxPrice: Float
    $inStock: Boolean
    $search: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    products(
      categoryId: $categoryId
      minPrice: $minPrice
      maxPrice: $maxPrice
      inStock: $inStock
      search: $search
      page: $page
      limit: $limit
    ) {
      items {
        ...ProductEntity
      }
      total
      page
      limit
    }
  }
  ${PRODUCT_ENTITY}
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: String!) {
    product(id: $id) {
      ...ProductEntity
    }
  }
  ${PRODUCT_ENTITY}
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      ...CategoryEntity
    }
  }
  ${CATEGORY_ENTITY}
`;

export const GET_CATEGORY_BY_ID = gql`
  query GetCategoryById($id: String!) {
    category(id: $id) {
      ...CategoryEntity
    }
  }
  ${CATEGORY_ENTITY}
`;

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts {
    products {
      id
      title
      price
      quantity
      description
      medias { url }
      approvedForSale
      category {
        name
      }
      business {
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
      price
      quantity
      description
      medias { url }
      approvedForSale
      category {
        name
      }
      business {
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
      ...ProductEntity
    }
  }
  ${PRODUCT_ENTITY}
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ...ProductEntity
    }
  }
  ${PRODUCT_ENTITY}
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      ...CategoryEntity
    }
  }
  ${CATEGORY_ENTITY}
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      ...CategoryEntity
    }
  }
  ${CATEGORY_ENTITY}
`;

export const ADD_PRODUCT_MEDIA = gql`
  mutation AddProductMedia($productId: String!, $input: AddMediaInput!) {
    addProductMedia(productId: $productId, input: $input) {
      ...MediaEntity
    }
  }
  ${MEDIA_ENTITY}
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
      ...ProductEntity
    }
  }
  ${PRODUCT_ENTITY}
`;

export const ON_PRODUCT_UPDATED = gql`
  subscription OnProductUpdated($businessId: String!) {
    productUpdated(businessId: $businessId) {
      ...ProductEntity
    }
  }
  ${PRODUCT_ENTITY}
`;

