import { useMutation } from '@apollo/client';
import { Form, FormControl, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { CREATE_FREELANCE_ORDER, removeTypename } from '@/graphql/freelance-order.gql';
import { GlowButton } from '@/components/seraui/GlowButton';
import { useToast } from '@/components/toast-provider';

interface FreelanceOrderFormProps {
  serviceId: string;
}

const orderSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export default function FreelanceOrderForm({ serviceId }: FreelanceOrderFormProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity: 1 },
  });
  const { showToast } = useToast();
  const [createOrder, { loading }] = useMutation(CREATE_FREELANCE_ORDER, {
    onCompleted: () => {
      showToast(
        'success',
        'Success',
        'Order placed successfully',
        true,
        5000,
        'bottom-right'
      )
      form.reset();
      router.push('/freelance-gigs/orders');
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
  });

  const onSubmit = (data: any) => {
    createOrder({
      variables: {
        createFreelanceOrderInput: removeTypename({
          serviceId,
          quantity: data.quantity,
          status: 'PENDING',
        }),
      },
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg border border-orange-500">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Place Order</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormControl>
                <Input
                  type="number"
                  placeholder="Quantity"
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="border-orange-500 focus:border-orange-600"
                />
              </FormControl>
            )}
          />
          <GlowButton
            type="submit"
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white w-full"
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </GlowButton>
        </form>
      </Form>
    </div>
  );
}