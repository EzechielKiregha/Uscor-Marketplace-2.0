import { gql } from "@apollo/client";

// GraphQL Mutation
export const getLoginMutation = (role: string) => gql`
  mutation Sign${role}In($SignInInput: SignInInput!) {
    sign${role}In(SignInInput: $SignInInput) {
      accessToken
      refreshToken
      id
      email
      ${role === 'Business' ? 'coverImage' : ''}
      ${role === 'Business' ? 'avatar' : ''}
      
    }
  }
`;

export const GET_ROLE_IF_USER_EXIST = gql`
  query WhatIsUserRole($SignInInput: SignInInput!) {
    whatIsUserRole(SignInInput: $SignInInput) {
      role
    }
  }
`;

// GraphQL Mutations
export const CREATE_CLIENT = gql`
  mutation CreateClient($createClientInput: CreateClientInput!) {
    createClient(createClientInput: $createClientInput) {
      id
      email
      fullName
      phone
    }
  }
`;

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness($createBusinessInput: CreateBusinessInput!) {
    createBusiness(createBusinessInput: $createBusinessInput) {
      id
      email
      name
      phone
      avatar
      coverImage
    }
  }
`;

export const CREATE_WORKER = gql`
  mutation CreateWorker($createWorkerInput: CreateWorkerInput!) {
    createWorker(createWorkerInput: $createWorkerInput) {
      id
      email
      fullName
      role
      isVerified
    }
  }
`;