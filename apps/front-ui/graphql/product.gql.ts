import { gql } from "@apollo/client";

// 📦 Get All Products
export const GET_PRODUCTS = gql`
  query GetProducts {
  products {
    id
    name
    price
    quantity
    medias
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

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts {
    products(featured: true) {
      id
      title
      price
      quantity
      description
      medias
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

// 📦 Get Single Product
export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      name
      price
      description
      category
      medias {
        url
      }
      approvedForSale
    }
  }
`;

// ➕ Create Product
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput) {
      id
      name
      price
      quantity
    }
  }
`;

// ✏ Update Product
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $updateProductInput: UpdateProductInput!) {
    updateProduct(id: $id, updateProductInput: $updateProductInput) {
      id
      name
      price
      quantity
    }
  }
`;

// ❌ Delete Product
export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id) {
      id
      name
    }
  }
`;
