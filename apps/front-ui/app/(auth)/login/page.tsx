'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUserRole, setAuthToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { GlowButton } from '@/components/seraui/GlowButton';
import { useToast } from '@/components/toast-provider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLoginMutation } from '@/graphql/auth.gql';
import { removeTypename } from '@/graphql/client.gql';

// SVG Icons (reused from provided Login)
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-secondary-light dark:text-secondary-dark"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-secondary-light dark:text-secondary-dark"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-secondary-light dark:text-secondary-dark"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const AppleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-6 w-6 text-darkGray dark:text-lightGray"
  >
    <path
      fill="currentColor"
      d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-5 w-5"
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5 text-darkGray dark:text-lightGray"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Zod Schema
const schema = z.object({
  role: z.enum(['Client', 'Business', 'Worker'], { message: 'Please select a role' }),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Client' },
  });
  const { handleSubmit, watch } = form;
  const [signIn, { loading }] = useMutation(getLoginMutation(watch('role')));
  const { showToast } = useToast();

  const onSubmit = async (data: FormData) => {
    try {
      const mutation = getLoginMutation(data.role);
      let { data: { [`sign${data.role}In`]: result } } = await signIn({
        mutation: mutation,
        variables: { SignInInput: { email: data.email, password: data.password } },
      });
      showToast(
        'success',
        'Success',
        'Logged in successfully',
        true,
        8000,
        'bottom-right'
      )
      result = removeTypename(result);
      setAuthToken(result.accessToken, result.refreshToken);
      // router.push('/');
      const role = getUserRole();
      if (role && role === 'client') {
        console.log('Redirecting to client dashboard');
        router.push('/client/dashboard');
      } else if (role && role === 'business') {
        console.log('Redirecting to business dashboard');
        router.push('/business/dashboard');
      }
      else if (role && role === 'worker') {
        console.log('Redirecting to worker dashboard');
        router.push('/worker/dashboard');
      } else {
        console.warn('Unknown role, redirecting to home');
        router.push('/');
      }
    } catch (err: any) {
      showToast(
        'error',
        'Login Failed',
        'Wrong email or password',
        true,
        8000,
        'bottom-right'
      )
    };
  }

  return (
    <div className="relative w-full flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <div className="w-full max-w-sm p-6 space-y-6 bg-white dark:bg-gray-950 rounded-lg border border-secondary-light dark:border-secondary-dark shadow-lg">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2 bg-secondary-light dark:bg-secondary-dark rounded-md border border-secondary-light dark:border-secondary-dark">
            <UserIcon />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-darkGray dark:text-lightGray">Welcome Back</h1>
            <p className="text-sm text-secondary-light dark:text-secondary-dark mt-1">Enter your credentials to sign in</p>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[{ icon: <AppleIcon /> }, { icon: <GoogleIcon /> }, { icon: <XIcon /> }].map((item, index) => (
            <button
              key={index}
              className="flex items-center justify-center h-9 px-3 rounded-md border border-secondary-light dark:border-secondary-dark bg-white dark:bg-gray-950 hover:bg-secondary-light dark:hover:bg-secondary-dark hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-secondary-light dark:border-secondary-dark" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-950 px-2 text-secondary-light dark:text-secondary-dark">
              Or continue with
            </span>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="form-item justify-center items-center w-full">
                  <FormLabel>Account Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultValue="Client"
                    >
                      <FormControl>
                        <SelectTrigger className="form-field">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="form-field">
                        <SelectItem value="Client">Client</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Worker">Worker</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                      className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark"
                    />
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
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...field}
                        className="w-full pr-10 text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <GlowButton type="submit"
              disabled={loading}
              className="w-full bg-primary rounded-md cursor-pointer py-1">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-darkGray border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </GlowButton>
          </form>
        </Form>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-secondary-light dark:text-secondary-dark">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="font-medium text-primary underline underline-offset-4 hover:text-accent transition-colors">
              Sign up
            </a>
          </p>
          <a href="#" className="text-sm font-medium text-primary underline underline-offset-4 hover:text-accent transition-colors">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}