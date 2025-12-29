import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GET_CHAT_BY_ID } from '@/graphql/chat.gql';
import { CREATE_CHAT_MESSAGE, GET_CHAT_MESSAGES_BY_CHAT } from '@/graphql/chat-message.gql';
import ChatMessage from './ChatMessage';
import { GlowButton } from '@/components/seraui/GlowButton';
import { useToast } from '@/components/toast-provider';
import { useMe } from '@/lib/useMe';

interface ChatThreadProps {
  id: string | string[];
}

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export default function ChatThread({ id }: ChatThreadProps) {

  const user = useMe()

  const { loading, error, data } = useQuery(GET_CHAT_BY_ID, {
    variables: { id: id },
  });
  const { showToast } = useToast();
  const { loading: messagesLoading, data: messagesData } = useQuery(GET_CHAT_MESSAGES_BY_CHAT, {
    variables: { chatId: id },
  });
  const [createMessage, { loading: createLoading }] = useMutation(CREATE_CHAT_MESSAGE, {
    onCompleted: () => {
      showToast(
        'success',
        'Success',
        'Message sent successfully',
        true,
        5000,
        'bottom-right'
      )
      form.reset();
    },
    onError: (error) => {
      showToast(
        'error',
        'Failed',
        error.message,
        true,
        8000,
        'bottom-right'
      )
    },
    refetchQueries: [{ query: GET_CHAT_MESSAGES_BY_CHAT, variables: { chatId: id } }],
  });

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: '' },
  });

  const onSubmit = (data: any) => {
    createMessage({
      variables: {
        createChatMessageInput: {
          chatId: id,
          message: data.message,
          senderId: user?.id, // Replace with actual user ID from auth
        },
      },
    });
  };

  if (loading || messagesLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error.message}</p>;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Chat: {data.chat.service?.title || 'Discussion'}
      </h1>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-orange-500 p-4 rounded-lg">
        {messagesData?.chatMessages.map((msg: any) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            senderId={msg.senderId}
            createdAt={msg.createdAt}
            className={msg.senderId === user?.id ? 'ml-auto bg-orange-100 dark:bg-orange-900 text-right' : 'mr-auto bg-gray-100 dark:bg-gray-700'}
          />
        ))}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormControl>
                  <Input
                    placeholder="Type your message..."
                    {...field}
                    className="border-orange-500 focus:border-orange-600 flex-1"
                  />
                </FormControl>
              )}
            />
            <GlowButton
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={createLoading}
            >
              {createLoading ? 'Sending...' : 'Send'}
            </GlowButton>
          </form>
        </Form>
      </div>
    </div>
  );
}