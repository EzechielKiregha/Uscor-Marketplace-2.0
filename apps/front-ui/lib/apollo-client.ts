import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client/utilities';
import { removeTypenameFromVariables } from '@apollo/client/link/remove-typename';

import { getAccessToken, refreshToken } from '@/lib/auth';

const httpLink = new HttpLink({ uri: 'http://localhost:8000/graphql' });

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

// 👇 Add this link at the very start so all variables have __typename removed before sending
const stripTypenameLink = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    const removeTypename : any = (obj: any) => {
      if (Array.isArray(obj)) {
        return obj.map(removeTypename);
      } else if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        Object.keys(obj).forEach(key => {
          if (key !== '__typename') {
            newObj[key] = removeTypename(obj[key]);
          }
        });
        return newObj;
      }
      return obj;
    };
    operation.variables = removeTypename(operation.variables);
  }
  return forward(operation);
});

export const client = new ApolloClient({
  link: ApolloLink.from([stripTypenameLink, errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});