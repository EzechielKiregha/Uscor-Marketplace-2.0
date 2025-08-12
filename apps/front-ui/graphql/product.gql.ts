import { gql } from "@apollo/client";

// 📦 Get All Products
export const GET_PRODUCTS = gql`
  query GetProducts {
  products {
    id
    title
    price
    quantity
    medias { url }
    description
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

// 📦 Get Single Product
export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: String!) {
    product(id: $id) {
      id
      title
      price
      description
      medias {
        url
      }
      quantity
      business {
        id
        name
        avatar
      }
      category {
        name
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
      title
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
      title
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
      title
    }
  }
`;

/**
 * Utility function to remove __typename from objects.
 */
export const removeTypename : any = (obj: any) => {
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
