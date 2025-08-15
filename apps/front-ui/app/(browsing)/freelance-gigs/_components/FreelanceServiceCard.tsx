import { GlowButton } from '@/components/seraui/GlowButton';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface FreelanceServiceCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  business: { id: string; name: string };
}

export default function FreelanceServiceCard({ id, title, description, price, business }: FreelanceServiceCardProps) {
  return (
    <Card
      className="bg-white dark:bg-gray-800 border-orange-500 hover:border-orange-600 transition-colors"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <p className="text-md font-medium text-orange-500 dark:text-orange-400">${price}</p>
      <p className="text-sm text-gray-500 dark:text-gray-300">Offered by: {business.name}</p>
      <Link href={`/freelance-gigs/${id}`}>
        <GlowButton className="mt-4 bg-orange-500 hover:bg-orange-600 text-white">
          View Details
        </GlowButton>
      </Link>
    </Card>
  );
}