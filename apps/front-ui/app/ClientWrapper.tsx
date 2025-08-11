// app/ClientWrapper.tsx
'use client'

import LoadingSpinner from '@/components/LoadingSpinner'
import { useLoading } from './context/loadingContext'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ApolloProvider } from '@apollo/client'
import { client } from '@/lib/apollo-client'

export default function ClientWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const { isLoading, setIsLoading } = useLoading()
    const pathname = usePathname();
    const [prevPath, setPrevPath] = useState(pathname);
    const router = useRouter()

    useEffect(() => {
        if (pathname !== prevPath) {
            setIsLoading(false); // Stop loading when the path changes
            setPrevPath(pathname); // Update the previous path
            router.refresh()
        }
    }, [router, pathname, prevPath, setIsLoading]);

    return (
        <>
            {isLoading && <LoadingSpinner />}
            <ApolloProvider client={client}>
                <Suspense fallback={<LoadingSpinner />}>
                    {children}
                </Suspense>
            </ApolloProvider>
        </>
    )
}