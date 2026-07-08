import {
    ApolloClient,
    ApolloLink,
    HttpLink,
    InMemoryCache,
} from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { onError } from "@apollo/client/link/error";
import { Observable } from "@apollo/client/utilities";
import { getAccessToken, refreshToken } from "@/lib/auth";

if (process.env.NODE_ENV !== "production") {
	loadErrorMessages();
	loadDevMessages();
}

const httpLink =
	process.env.NODE_ENV === "production"
		? new HttpLink({
				uri: "https://uscor-marketplace-2-0-server.vercel.app/graphql",
			})
		: new HttpLink({ uri: "http://localhost:8000/graphql" });

const authLink = new ApolloLink((operation, forward) => {
	const token = getAccessToken();
	operation.setContext({
		headers: { Authorization: token ? `Bearer ${token}` : "" },
	});
	return forward(operation);
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const unauthenticated = graphQLErrors?.some(
    (err) => err.extensions?.code === "UNAUTHENTICATED",
  );

  if (!unauthenticated) {
    return;
  }

  const token = getAccessToken();

  // Guest user
  if (!token) {
    return;
  }

  return new Observable((observer) => {
    refreshToken()
      .then((accessToken) => {
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            Authorization: `Bearer ${accessToken}`,
          },
        }));

        forward(operation).subscribe(observer);
      })
      .catch((err) => {
        // Session expired
        localStorage.removeItem("accessToken");

        // only redirect if page actually requires auth
        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/login";
        }

        observer.error(err);
      });
  });
});

export const client = new ApolloClient({
	link: ApolloLink.from([errorLink, authLink, httpLink]),
	cache: new InMemoryCache(),
});
