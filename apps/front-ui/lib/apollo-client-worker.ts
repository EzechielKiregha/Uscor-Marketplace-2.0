// import {
// 	ApolloClient,
// 	ApolloLink,
// 	HttpLink,
// 	InMemoryCache,
// 	split,
// } from "@apollo/client";
// import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
// import { onError } from "@apollo/client/link/error";
// import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
// import { getMainDefinition, Observable } from "@apollo/client/utilities";
// import { createClient } from "graphql-ws";
// import { getAccessToken, refreshToken } from "@/lib/auth";

// // Import IndexedDB functions
// import { getFromIndexedDB, saveToIndexedDB } from "@/lib/indexed-db";

// if (process.env.NODE_ENV !== "production") {
// 	loadErrorMessages();
// 	loadDevMessages();
// }

// // HTTP Link for queries/mutations
// const httpLink =
// 	process.env.NODE_ENV === "production"
// 		? new HttpLink({
// 				uri: "https://uscor-marketplace-2-0-server.vercel.app/graphql",
// 			})
// 		: new HttpLink({ uri: "http://localhost:8000/graphql" });

// // WebSocket Link for subscriptions
// const wsLink = new GraphQLWsLink(
// 	createClient({
// 		url:
// 			process.env.NODE_ENV === "production"
// 				? "wss://uscor-marketplace-2-0-server.vercel.app/graphql"
// 				: "ws://localhost:8000/graphql",
// 		connectionParams: () => {
// 			const token = getAccessToken();
// 			return token ? { Authorization: `Bearer ${token}` } : {};
// 		},
// 	}),
// );

// // Split link for queries/mutations (HTTP) vs subscriptions (WebSocket)
// const splitLink = split(
// 	({ query }) => {
// 		const definition = getMainDefinition(query);
// 		return (
// 			definition.kind === "OperationDefinition" &&
// 			definition.operation === "subscription"
// 		);
// 	},
// 	wsLink,
// 	httpLink,
// );

// // Authentication Link
// const authLink = new ApolloLink((operation, forward) => {
// 	const token = getAccessToken();
// 	operation.setContext({
// 		headers: { Authorization: token ? `Bearer ${token}` : "" },
// 	});
// 	return forward(operation);
// });

// // Error Link with refresh token logic
// const errorLink = onError(
// 	({ graphQLErrors, networkError, operation, forward }) => {
// 		if (
// 			graphQLErrors?.some((err) => err.extensions?.code === "UNAUTHENTICATED")
// 		) {
// 			return new Observable((observer) => {
// 				refreshToken()
// 					.then((accessToken) => {
// 						operation.setContext(({ headers = {} }) => ({
// 							headers: { ...headers, Authorization: `Bearer ${accessToken}` },
// 						}));
// 						const subscriber = {
// 							next: observer.next.bind(observer),
// 							error: observer.error.bind(observer),
// 							complete: observer.complete.bind(observer),
// 						};
// 						return forward(operation).subscribe(subscriber);
// 					})
// 					.catch((error) => {
// 						if (typeof window !== "undefined") {
// 							window.location.href = "/login";
// 						}
// 						observer.error(error);
// 					});
// 			});
// 		}

// 		// Handle network errors - queue for offline processing
// 		if (networkError) {
// 			console.warn(
// 				"Network error occurred, attempting offline operation:",
// 				networkError,
// 			);

// 			// For critical operations, save to IndexedDB for later sync
// 			if (
// 				operation.operationName.includes("Create") ||
// 				operation.operationName.includes("Update") ||
// 				operation.operationName.includes("Add")
// 			) {
// 				const operationName = operation.operationName;
// 				const variables = operation.variables;

// 				// Queue operation for later retry
// 				saveToIndexedDB("offlineOperations", {
// 					id: Date.now().toString(),
// 					operationName,
// 					variables,
// 					timestamp: new Date().toISOString(),
// 					status: "PENDING",
// 				}).then(() => {
// 					console.log("Operation queued for offline processing");
// 				});
// 			}
// 		}

// 		return forward(operation);
// 	},
// );

// // Offline Link - intercept operations when offline
// const offlineLink = new ApolloLink((operation, forward) => {
// 	return new Observable((observer) => {
// 		// Check if online
// 		const isOnline = navigator.onLine;

// 		if (!isOnline) {
// 			// Handle offline operations based on type
// 			if (
// 				operation.operationName.includes("Get") ||
// 				operation.operationName.includes("Query")
// 			) {
// 				// Try to get from IndexedDB cache
// 				getFromIndexedDB("workerCache", operation.operationName)
// 					.then((cachedData) => {
// 						if (cachedData) {
// 							observer.next({ data: cachedData });
// 							observer.complete();
// 						} else {
// 							// Return empty data for offline queries
// 							observer.next({ data: {} });
// 							observer.complete();
// 						}
// 					})
// 					.catch(() => {
// 						observer.next({ data: {} });
// 						observer.complete();
// 					});
// 			} else if (
// 				operation.operationName.includes("Create") ||
// 				operation.operationName.includes("Update") ||
// 				operation.operationName.includes("Add")
// 			) {
// 				// Queue mutation for later sync
// 				const operationName = operation.operationName;
// 				const variables = operation.variables;

// 				saveToIndexedDB("offlineOperations", {
// 					id: `${operationName}_${Date.now()}`,
// 					operationName,
// 					variables,
// 					timestamp: new Date().toISOString(),
// 					status: "PENDING",
// 				}).then(() => {
// 					// Return optimistic response
// 					const optimisticResponse = getOptimisticResponse(
// 						operationName,
// 						variables,
// 					);
// 					observer.next({ data: optimisticResponse });
// 					observer.complete();
// 				});
// 			}
// 		} else {
// 			// Forward to normal execution if online
// 			return forward(operation).subscribe(observer);
// 		}
// 	});
// });

// // Create cache with persistence
// const cache = new InMemoryCache({
// 	typePolicies: {
// 		Query: {
// 			fields: {
// 				// Custom merge policies for offline-first queries
// 				workerSales: {
// 					read(existing = [], { args, toReference }) {
// 						if (navigator.onLine) return existing;

// 						// Return cached data from IndexedDB
// 						return getFromIndexedDB("workerSales", args?.storeId || "all");
// 					},
// 				},
// 				workerInventory: {
// 					read(existing = [], { args, toReference }) {
// 						if (navigator.onLine) return existing;

// 						// Return cached data from IndexedDB
// 						return getFromIndexedDB("workerInventory", args?.storeId || "all");
// 					},
// 				},
// 			},
// 		},
// 	},
// });

// // Initialize persistent cache
// persistCache({
// 	cache,
// 	storage: window.indexedDB,
// 	key: "uscor-worker-cache",
// 	maxSize: 10485760, // 10MB
// 	debug: process.env.NODE_ENV !== "production",
// }).then(() => {
// 	console.log("Worker cache persisted");
// });

// // Combined link chain
// const link = ApolloLink.from([offlineLink, errorLink, authLink, splitLink]);

// export const workerClient = new ApolloClient({
// 	link,
// 	cache,
// 	defaultOptions: {
// 		watchQuery: {
// 			fetchPolicy: "cache-and-network",
// 			errorPolicy: "all",
// 		},
// 		query: {
// 			fetchPolicy: "cache-first",
// 			errorPolicy: "all",
// 		},
// 		mutate: {
// 			errorPolicy: "all",
// 		},
// 	},
// });

// // Helper function for optimistic responses
// function getOptimisticResponse(operationName: string, variables: any) {
// 	switch (operationName) {
// 		case "CreateSale":
// 			return {
// 				createSale: {
// 					id: `temp_${Date.now()}`,
// 					status: "PENDING_SYNC",
// 					totalAmount: variables.input.totalAmount,
// 					paymentMethod: variables.input.paymentMethod,
// 					createdAt: new Date().toISOString(),
// 					__typename: "Sale",
// 				},
// 			};
// 		case "AddSaleProduct":
// 			return {
// 				addSaleProduct: {
// 					id: `temp_${Date.now()}`,
// 					quantity: variables.input.quantity,
// 					price: variables.input.price,
// 					__typename: "SaleProduct",
// 				},
// 			};
// 		case "UpdateSaleProduct":
// 			return {
// 				updateSaleProduct: {
// 					id: variables.id,
// 					quantity: variables.input.quantity,
// 					__typename: "SaleProduct",
// 				},
// 			};
// 		case "RemoveSaleProduct":
// 			return {
// 				removeSaleProduct: {
// 					id: variables.id,
// 					__typename: "SaleProduct",
// 				},
// 			};
// 		default:
// 			return {};
// 	}
// }
