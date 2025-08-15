import { jwtDecode } from 'jwt-decode';
import { client } from './apollo-client';
import { getAccessToken, logout } from '@/lib/auth';
import { gql } from '@apollo/client';
import { BusinessEntity, ClientEntity, WorkerEntity } from './types';

// GraphQL queries
export const GET_CLIENT_BY_ID = gql`
  query GetClientById($id: String!) {
    client(id: $id) {
      id
      username
      email
      fullName
      address
      phone
      isVerified
      createdAt
      updatedAt
    }
  }
`;

export const GET_BUSINESS_BY_ID = gql`
  query GetBusinessById($id: String!) {
    business(id: $id) {
      id
      name
      email
      description
      address
      phone
      avatar
      coverImage
      isVerified
      kycStatus
      createdAt
      updatedAt
    }
  }
`;

export const GET_WORKER_BY_ID = gql`
  query GetWorkerById($id: String!) {
    worker(id: $id) {
      id
      email
      fullName
      role
      isVerified
      createdAt
      updatedAt
      business {
        id
        name
      }
    }
  }
`;

// Align with backend's AuthJwtPayload and types.ts
interface TokenPayload {
  sub: string; // Matches AuthJwtPayload.sub
  role: 'client' | 'business' | 'worker';
}

type MeResult =
  | { role: 'client'; id: string; user: ClientEntity }
  | { role: 'business'; id: string; user: BusinessEntity }
  | { role: 'worker'; id: string; user: WorkerEntity }
  | null;

/**
 * Fetch current user profile using the client-side JWT.
 * Validates token and queries user data based on role.
 * Returns null on invalid token or error.
 */
export async function fetchMe(): Promise<MeResult> {
  const token = getAccessToken();
  if (!token) {
    console.warn('No access token found');
    return null;
  }

  let payload: TokenPayload;
  try {
    payload = jwtDecode<TokenPayload>(token);
  } catch (err) {
    console.warn('Failed to decode JWT:', err);
    return null;
  }

  const id = payload.sub;
  const role = payload.role;

  if (!id || !['client', 'business', 'worker'].includes(role)) {
    console.warn('Invalid JWT payload: missing id or invalid role');
    return null;
  }

  try {
    switch (role) {
      case 'client': {
        const { data } = await client.query({
          query: GET_CLIENT_BY_ID,
          variables: { id },
          fetchPolicy: 'cache-first', // Use cache for performance
        });
        if (!data.client) throw new Error('Client not found');
        return { role: 'client', id, user: data.client };
      }
      case 'business': {
        const { data } = await client.query({
          query: GET_BUSINESS_BY_ID,
          variables: { id },
          fetchPolicy: 'cache-first',
        });
        if (!data.business) throw new Error('Business not found');
        return { role: 'business', id, user: data.business };
      }
      case 'worker': {
        const { data } = await client.query({
          query: GET_WORKER_BY_ID,
          variables: { id },
          fetchPolicy: 'cache-first',
        });
        if (!data.worker) throw new Error('Worker not found');
        return { role: 'worker', id, user: data.worker };
      }
      default:
        throw new Error('Invalid role');
    }
  } catch (err: any) {
    console.error('fetchMe: failed to fetch profile', err);
    if (err.message.includes('UNAUTHENTICATED')) {
      logout(); // Trigger logout to redirect to /login
    }
    return null;
  }
}