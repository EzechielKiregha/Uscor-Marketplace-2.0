import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { GET_FREELANCE_SERVICE_BY_ID, removeTypename } from '@/graphql/freelance-service.gql';
import { CREATE_CHAT } from '@/graphql/chat.gql';
import { GlowButton } from '@/components/seraui/GlowButton';
import { useToast } from '@/components/toast-provider';
import Loader from '@/components/seraui/Loader';

interface FreelanceServiceDetailProps {
  id: string
}

export default function FreelanceServiceDetail({ id }: FreelanceServiceDetailProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { loading, error, data } = useQuery(GET_FREELANCE_SERVICE_BY_ID, {
    variables: { id },
  });
  const [createChat, { loading: chatLoading }] = useMutation(CREATE_CHAT, {
    onCompleted: () => {
      showToast(
        'success',
        'Success',
        'Chat started successfully',
        true,
        5000,
        'bottom-right'
      )
    },
    onError: (error) => {
      showToast(
        'error',
        'Failed ',
        error.message,
        true,
        8000,
        'bottom-right'
      )
    },
  });

  const handleStartChat = () => {
    createChat({
      variables: {
        createChatInput: removeTypename({
          serviceId: id,
          status: 'OPEN',
          isSecure: false,
          negotiationType: 'FREELANCE',
        }),
      },
    });
  };

  if (loading) return (
    <Loader loading={true} />
  )
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  const { title, description, price, business } = data.freelanceService;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">
      <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border-orange-500 hover:border-orange-600 transition-colors">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-gray-600 dark:text-gray-400">{description}</p>
          <p className="text-lg font-medium text-orange-500 dark:text-orange-400 mt-4">${price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Offered by: {business.name}</p>
        </CardContent>
        <CardFooter>
          <GlowButton
            onClick={handleStartChat}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white"
            disabled={chatLoading}
          >
            {chatLoading ? 'Starting Chat...' : 'Discuss with Provider'}
          </GlowButton>
        </CardFooter>
      </Card>
    </div>
  );
}