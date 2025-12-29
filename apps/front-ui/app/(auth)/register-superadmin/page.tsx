'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GlowButton } from '@/components/seraui/GlowButton';
import { useToast } from '@/components/toast-provider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CREATE_SUPERADMIN } from '@/graphql/admin.gql';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterSuperAdminPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [createSuperAdmin, { loading }] = useMutation(CREATE_SUPERADMIN, {
    fetchPolicy: 'no-cache',
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', fullName: '', phone: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: res } = await createSuperAdmin({ variables: { createAdminInput: data } });
      if (res?.registerSuperAdmin) {
        showToast('success', 'Success', 'Super admin created successfully', true, 8000, 'bottom-right');
        // redirect to admin dashboard or to login
        router.push('/login');
      } else {
        showToast('error', 'Failed', 'Unexpected response from server', true, 8000, 'bottom-right');
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to create Super Admin';
      showToast('error', 'Registration failed', message, true, 8000, 'bottom-right');
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center min-h-screen bg-white ">
      <div className="w-full max-w-md p-6 space-y-6 bg-background rounded-lg border border-secondary-light dark:border-secondary-dark shadow-lg">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-darkGray dark:text-lightGray">Bootstrap Super Admin</h1>
          <p className="text-sm text-secondary-light dark:text-secondary-dark mt-1">Create the first Super Admin account for the platform.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <input type="text" placeholder="Jane Doe" {...field} className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input type="email" placeholder="admin@example.com" {...field} className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <input type="tel" placeholder="+1234567890" {...field} className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <input type="password" placeholder="Choose a strong password" {...field} className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <GlowButton type="submit" disabled={loading} className="w-full bg-primary rounded-md cursor-pointer py-1">
              {loading ? 'Creating...' : 'Create Super Admin'}
            </GlowButton>
          </form>
        </Form>

        <div className="text-center text-sm text-secondary-light dark:text-secondary-dark">
          <p>Only the first Super Admin can be created here. If a Super Admin already exists, please sign in.</p>
        </div>
      </div>
    </div>
  );
}
