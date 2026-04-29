"use client";

import { ApolloProvider } from "@apollo/client";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { client } from "@/lib/apollo-client";
import { useLoading } from "./context/loadingContext";

export default function ClientWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isLoading, setIsLoading } = useLoading();
	const pathname = usePathname();
	const [prevPath, setPrevPath] = useState(pathname);
	const router = useRouter();
	useEffect(() => {
		if (pathname !== prevPath) {
			setIsLoading(false); // Stop loading when the path changes
			setPrevPath(pathname); // Update the previous path
			router.refresh();
		}
	}, [router, pathname, prevPath, setIsLoading]);

	return (
		<>
			{isLoading && <LoadingSpinner />}
			<ApolloProvider client={client}>
				<Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
			</ApolloProvider>
		</>
	);
}
