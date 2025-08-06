// src/app/api/refresh-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { gql } from '@apollo/client';
import { client } from '@/lib/apollo-client';

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { refreshToken },
    });

    return NextResponse.json({ accessToken: data.refreshToken.accessToken });
  } catch (error) {
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
  }
}