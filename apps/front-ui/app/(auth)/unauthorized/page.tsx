import { GlowButton } from '@/components/seraui/GlowButton';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Unauthorized Access</h1>
        <p className="text-secondary-light dark:text-secondary-dark">
          You don’t have permission to access this page.
        </p>
        <Link href="/">
          <GlowButton>Go to Homepage</GlowButton>
        </Link>
      </div>
    </div>
  );
}