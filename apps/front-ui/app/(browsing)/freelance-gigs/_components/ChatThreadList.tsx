import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { GET_CHATS_BY_PARTICIPANT } from '@/graphql/chat.gql';
import { AnimatedBadge } from '@/components/seraui/AnimatedBadge';

interface ChatThreadListProps {
  participantId: string;
}

export default function ChatThreadList({ participantId }: ChatThreadListProps) {
  const { loading, error, data } = useQuery(GET_CHATS_BY_PARTICIPANT, {
    variables: { participantId },
  });

  if (!data?.chats) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No chats found.</p>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your Chats</h1>
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">Error: {error.message}</p>}
      {data && data.chats.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No chats found.</p>}
      {data && data.chats.map((chat: any) => (
        <Link key={chat.id} href={`/freelance-gigs/chat/${chat.id}`}>
          <Card className="mb-4 bg-white dark:bg-gray-800 border-orange-500 hover:border-orange-600 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {chat.service?.title || 'Chat'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Status: <AnimatedBadge
                  text={chat.status}
                  borderColor="via-amber-500"
                />
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-300">{new Date(chat.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}