import { gql } from "@apollo/client";

// ─── Wholesale Pricing ──────────────────────────────────

export const CREATE_WHOLESALE_PRICE = gql`
  mutation CreateWholesalePrice($input: CreateWholesalePriceInput!) {
    createWholesalePrice(input: $input) {
      id
      productId
      businessId
      minQuantity
      price
      maxQuantity
      businessTypeRestriction
      isActive
      createdAt
    }
  }
`;

export const UPDATE_WHOLESALE_PRICE = gql`
  mutation UpdateWholesalePrice($input: UpdateWholesalePriceInput!) {
    updateWholesalePrice(input: $input) {
      id
      minQuantity
      price
      maxQuantity
      businessTypeRestriction
      isActive
    }
  }
`;

export const DELETE_WHOLESALE_PRICE = gql`
  mutation DeleteWholesalePrice($id: String!) {
    deleteWholesalePrice(id: $id) {
      id
    }
  }
`;

export const GET_WHOLESALE_PRICES = gql`
  query WholesalePrices($productId: String!) {
    wholesalePrices(productId: $productId) {
      id
      productId
      minQuantity
      price
      maxQuantity
      businessTypeRestriction
      isActive
    }
  }
`;

export const GET_MY_WHOLESALE_PRICES = gql`
  query MyWholesalePrices {
    myWholesalePrices {
      id
      productId
      minQuantity
      price
      maxQuantity
      businessTypeRestriction
      isActive
      createdAt
      updatedAt
      product {
        id
        title
        price
        stock
      }
    }
  }
`;

// ─── B2B Orders ─────────────────────────────────────────

export const CREATE_B2B_ORDER = gql`
  mutation CreateB2BOrder($input: CreateB2BOrderInput!) {
    createB2BOrder(input: $input) {
      id
      orderNumber
      buyerId
      sellerId
      status
      paymentTerms
      notes
      subtotal
      tax
      total
      createdAt
      items {
        id
        productId
        quantity
        unitPrice
        totalPrice
        product {
          id
          title
          price
        }
      }
      buyer {
        id
        name
        avatar
      }
      seller {
        id
        name
        avatar
      }
    }
  }
`;

export const SUBMIT_B2B_ORDER = gql`
  mutation SubmitB2BOrder($orderId: String!) {
    submitB2BOrder(orderId: $orderId) {
      id
      status
      submittedAt
    }
  }
`;

export const UPDATE_B2B_ORDER_STATUS = gql`
  mutation UpdateB2BOrderStatus($input: UpdateB2BOrderStatusInput!) {
    updateB2BOrderStatus(input: $input) {
      id
      status
      approvedAt
      shippedAt
      deliveredAt
      cancelledAt
      rejectionReason
    }
  }
`;

export const GET_B2B_ORDERS = gql`
  query B2BOrders(
    $role: String! = "all"
    $status: String
    $page: Int = 1
    $limit: Int = 20
  ) {
    b2bOrders(role: $role, status: $status, page: $page, limit: $limit) {
      items {
        id
        orderNumber
        buyerId
        sellerId
        status
        paymentTerms
        notes
        subtotal
        tax
        total
        createdAt
        submittedAt
        approvedAt
        shippedAt
        deliveredAt
        cancelledAt
        items {
          id
          productId
          quantity
          unitPrice
          totalPrice
          notes
          product {
            id
            title
            price
          }
        }
        buyer {
          id
          name
          avatar
          businessType
        }
        seller {
          id
          name
          avatar
          businessType
        }
      }
      total
      page
      limit
    }
  }
`;

export const GET_B2B_ORDER = gql`
  query B2BOrder($orderId: String!) {
    b2bOrder(orderId: $orderId) {
      id
      orderNumber
      buyerId
      sellerId
      status
      paymentTerms
      notes
      rejectionReason
      subtotal
      tax
      total
      shippingAddress
      createdAt
      submittedAt
      approvedAt
      shippedAt
      deliveredAt
      cancelledAt
      items {
        id
        productId
        quantity
        unitPrice
        totalPrice
        notes
        product {
          id
          title
          price
          stock
        }
      }
      buyer {
        id
        name
        email
        avatar
        businessType
        kycStatus
      }
      seller {
        id
        name
        email
        avatar
        businessType
        kycStatus
      }
    }
  }
`;

// ─── Vendor Discovery ───────────────────────────────────

export const GET_B2B_VENDORS = gql`
  query B2BVendors(
    $page: Int = 1
    $limit: Int = 20
    $businessType: String
  ) {
    b2bVendors(page: $page, limit: $limit, businessType: $businessType) {
      items {
        id
        name
        email
        avatar
        businessType
        description
        address
        totalProductsSold
        _count {
          products
          stores
          workers
        }
      }
      total
      page
      limit
    }
  }
`;
