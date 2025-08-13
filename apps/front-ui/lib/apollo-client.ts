import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client/utilities';
import { getAccessToken, refreshToken } from '@/lib/auth';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

if (process.env.NODE_ENV !== 'production') {
  loadErrorMessages();
  loadDevMessages();
}

const httpLink = process.env.NODE_ENV === 'production' ? new HttpLink({ uri: 'https://uscor-marketplace-2-0-server.vercel.app/graphql' }) : new HttpLink({ uri: 'http://localhost:8000/graphql' });

const authLink = new ApolloLink((operation, forward) => {
  const token = getAccessToken();
  operation.setContext({
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors?.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
    return new Observable(observer => {
      refreshToken()
        .then(accessToken => {
          operation.setContext(({ headers = {} }) => ({
            headers: { ...headers, Authorization: `Bearer ${accessToken}` },
          }));
          const subscriber = {
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          };
          return forward(operation).subscribe(subscriber);
        })
        .catch(error => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          observer.error(error);
        });
    });
  }
  return forward(operation);
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});