import MasonryGrid, { ServiceGridItem } from '@/components/seraui/MasonryGrid';
import { GET_FREELANCE_SERVICES } from '@/graphql/freelance-service.gql';
import { ApolloError, useQuery } from '@apollo/client';
import Loader from '@/components/seraui/Loader';
import { useEffect, useState } from 'react';
import { client } from '@/lib/apollo-client';

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
        console.log('Freelance services fetched successfully:', data.freelanceServices);
        setError(undefined);
        setFreelanceServices(data.freelanceServices || []);
      }
    }
    fetchServices();
  }, []);

  console.log('Freelance services:', freelanceServices);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {isloading && <Loader loading={true} />}
      {error && <p className="text-center text-red-500">Error: {error.message}</p>}
      {freelanceServices && (
        <MasonryGrid
          items={freelanceServices}
          GridItem={ServiceGridItem}
          onLike={(id) => console.log(`Liked service ${id}`)}
        />
      )}
    </div>
  );
}