import MasonryGrid, { ServiceGridItem } from '@/components/seraui/MasonryGrid';
import { GET_FREELANCE_SERVICES } from '@/graphql/freelance-service.gql';
import { ApolloError, useQuery } from '@apollo/client';
import Loader from '@/components/seraui/Loader';
import { useEffect, useState } from 'react';
import { client } from '@/lib/apollo-client';
import { AlertTriangle } from 'lucide-react';

export default function FreelanceServiceList() {
  const [freelanceServices, setFreelanceServices] = useState([]);
  const [isloading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApolloError | undefined>(undefined);
  // Fetch freelance services using Apollo Client
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error, loading } = await client.query(
        {
          query: GET_FREELANCE_SERVICES,
          variables: { category: null }, // Adjust as needed
        }
      );
      if (loading) {
        console.log('Loading freelance services...');
        setIsLoading(true);
      }
      if (error as any) {
        console.warn('Error fetching freelance services:', error);
        setError(error);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        console.log('Freelance services fetched successfully:', data.freelanceServices.items);
        setError(undefined);
        setFreelanceServices(data.freelanceServices.items || []);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-orange-400/60 dark:border-orange-500/70 rounded-xl">
      {isloading && (
        <div className="flex flex-col bg-transparent justify-center items-center">
          <div className="w-8 h-8 bg-orange-600 rounded mt-20 animate-spin"></div>
          <h3 className="font-medium text-gray-700  text-xl">Loading Services ...</h3>
        </div>
      )}
      {error && <p className="text-center text-red-500">Error: {error.message}</p>}
      {freelanceServices && freelanceServices.length > 0 ? (
        <MasonryGrid
          items={freelanceServices}
          GridItem={ServiceGridItem}
          onLike={(id) => console.log(`Liked service ${id}`)}
        />
      ) : !isloading && (
        <div className="flex flex-col justify-center mt-20 items-center">
          <AlertTriangle />
          <h3 className='font-medium text-gray-700 text-xl'>No Services Displayed</h3>
        </div>
      )}
    </div>
  );
}