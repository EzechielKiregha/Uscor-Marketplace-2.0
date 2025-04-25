"use client"
import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLoading } from '@/app/context/loadingContext';

export function useNavigation() {
  const router = useRouter();
  const { setIsLoading } = useLoading();
  const pathname = usePathname();

  const navigate = useCallback((href?: string) => {
    setIsLoading(true); // Start loading

    if (href) {
      if (pathname !== href) {
        router.push(href); // Wait for the navigation to complete
      }
      router.refresh(); // Refresh the page
    }

    // setIsLoading(false); // Stop loading after navigation completes
  }, [router, pathname, setIsLoading]);

  return navigate;
};
