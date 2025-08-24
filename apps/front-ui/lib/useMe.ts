// lib/useMe.ts
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchMe } from './fetchMe';
import { BusinessEntity, ClientEntity, WorkerEntity } from './types';
import { useToast } from '@/components/toast-provider';

type MeResult =
  | { role: 'client'; id: string; user: ClientEntity }
  | { role: 'business'; id: string; user: BusinessEntity }
  | { role: 'worker'; id: string; user: WorkerEntity }
  | null;

export function useMe() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ClientEntity | BusinessEntity | WorkerEntity | null>(null);
  const [role, setRole] = useState<'client' | 'business' | 'worker' | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const path = usePathname()
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchMe();
        if (!mounted) return;
        if (!res) {
          setError('Failed to fetch user profile. Please log in again.');
          setUser(null);
          setRole(null);
          setId(null);
          // if (path !== '/' && path !== "/marketplace/products" && path !== '/freelance-gigs' ) router.push('/');
        } else {
          setUser(res.user);
          setRole(res.role);
          setId(res.id);
        }
      } catch (err) {
        if (!mounted) return;
        setError('An unexpected error occurred.');
        setUser(null);
        setRole(null);
        setId(null);
        if (path !== '/' && path !== "/marketplace/products" && path !== '/freelance-gigs' ) router.push('/login');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Show toast notification for errors
  // useEffect(() => {
  //   if (path !== '/'){
  //     if (error) {
  //       showToast(
  //         'error',
  //         'Failed',
  //         "failed to fetch user profile. Please log in again.",
  //         true,
  //         8000,
  //         'bottom-right'
  //       )
  //     }
  //   }
    
  // }, [error]);

  return { loading, user, role, id, error };
}