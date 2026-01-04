import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FreelanceOrderForm from './FreelanceOrderForm';
import { GET_FREELANCE_ORDERS_BY_CLIENT } from '@/graphql/freelance-order.gql';
import { AnimatedBadge } from '@/components/seraui/AnimatedBadge';
import Loader from '@/components/seraui/Loader';

interface FreelanceOrderListProps {
  clientId: string;
}

export default function FreelanceOrderList({ clientId }: FreelanceOrderListProps) {
  const { loading, error, data } = useQuery(GET_FREELANCE_ORDERS_BY_CLIENT, {
    variables: { clientId },
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your Freelance Orders</h1>
      <FreelanceOrderForm serviceId="dynamic-service-id" /> {/* Replace with dynamic service ID */}
      {loading && (<div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading data...</p>
      </div>)}
      {error && <p className="text-center text-red-500">Error: {error.message}</p>}
      {data && data.freelanceOrders.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No orders found.</p>}
      {data && data.freelanceOrders.map((order: any) => (
        <Card key={order.id} className="mb-4 bg-white dark:bg-gray-800 border-orange-500 hover:border-orange-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{order.service?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {order.quantity}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total: ${order.totalAmount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Status: <AnimatedBadge
                text={order.status}
                borderColor="via-amber-500"
              />
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}