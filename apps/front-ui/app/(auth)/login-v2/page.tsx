'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useLazyQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUserRole, setAuthToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { GlowButton } from '@/components/seraui/GlowButton';
import { useToast } from '@/components/toast-provider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GET_ROLE_IF_USER_EXIST, getLoginMutation } from '@/graphql/auth.gql';
import { removeTypename } from '@/lib/removeTypeName';

// SVG Icons
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
    className="h-6 w-6 text-white/80"
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
    className="h-4 w-4"
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
    className="h-4 w-4"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
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

const AppleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-6 w-6"
  >
    <path
      fill="currentColor"
      d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"
    />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Zod Schema
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPageV2() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { handleSubmit } = form;
  const { showToast } = useToast();
  const [UserRole, setRole] = useState<string>('Client');

  const [getRoleQuery, { loading: roleLoading }] = useLazyQuery(GET_ROLE_IF_USER_EXIST);

  // Create mutations for all possible roles
  const [signInClient, { loading: clientLoading }] = useMutation(getLoginMutation('Client'));
  const [signInBusiness, { loading: businessLoading }] = useMutation(getLoginMutation('Business'));
  const [signInWorker, { loading: workerLoading }] = useMutation(getLoginMutation('Worker'));
  const [signInAdmin, { loading: adminLoading }] = useMutation(getLoginMutation('Admin'));

  const loading = roleLoading || clientLoading || businessLoading || workerLoading || adminLoading;

  const onSubmit = async (formData: FormData) => {
    try {
      // First, get the user role
      const { data: res } = await getRoleQuery({
        variables: { SignInInput: { email: formData.email, password: formData.password } },
      });

      if (!res?.whatIsUserRole) {
        throw new Error("No user found");
      }

      let userRole: string;
      let signInMutation: any;

      switch (res.whatIsUserRole.role.toLowerCase()) {
        case 'client':
          userRole = 'Client';
          signInMutation = signInClient;
          break;
        case 'business':
          userRole = 'Business';
          signInMutation = signInBusiness;
          break;
        case 'worker':
          userRole = 'Worker';
          signInMutation = signInWorker;
          break;
        case 'admin':
          userRole = 'Admin';
          signInMutation = signInAdmin;
          break;
        default:
          throw new Error(`Unknown UserRole ${res.whatIsUserRole.role}`);
      }

      setRole(userRole);

      // Now sign in with the correct role
      let { data: { [`sign${userRole}In`]: result } } = await signInMutation({
        variables: { SignInInput: { email: formData.email, password: formData.password } },
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
      const role = getUserRole();
      if (role && role === 'client') {
        console.log('Redirecting to client dashboard');
        router.push('/client');
      } else if (role && role === 'business') {
        console.log('Redirecting to business dashboard');
        router.push('/business/dashboard');
      }
      else if (role && role === 'worker') {
        console.log('Redirecting to worker dashboard');
        router.push('/');
      } else if (role && role === 'admin') {
        console.log('Redirecting to admin dashboard');
        router.push('/admin');
      } else {
        console.warn('Unknown role, redirecting to home');
        router.push('/');
      }
    } catch (err: any) {
      showToast(
        'error',
        'Login Failed',
        err.message,
        true,
        8000,
        'bottom-right'
      )
    };
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-primary/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Left Panel - Branding (Hidden on mobile, visible on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16 border-r border-white/5 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 backdrop-blur-sm">
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 mix-blend-overlay"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Logo placeholder */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Seraplus
            </span>
          </div>
          
          {/* Hero content */}
          <div className="mt-16 space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Welcome to the Future
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent">
                of Digital Excellence
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
              Experience a premium platform designed for modern businesses. 
              Connect, collaborate, and grow with cutting-edge tools at your fingertips.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              {[
                { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized performance' },
                { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade security' },
                { icon: '📱', title: 'Responsive', desc: 'Works on all devices' },
                { icon: '🎨', title: 'Beautiful', desc: 'Premium design' },
              ].map((feature, idx) => (
                <div key={idx} className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300">
                  <span className="text-2xl mb-2 block">{feature.icon}</span>
                  <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom testimonial or stats */}
        <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-gray-900 flex items-center justify-center text-xs text-white font-medium">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-white">Trusted by 10,000+ users</p>
              <p className="text-xs text-gray-500">Join our growing community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 relative">
        {/* Mobile decorative elements */}
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Seraplus
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <AppleIcon />, label: 'Apple' },
              { icon: <GoogleIcon />, label: 'Google' },
              { icon: <XIcon />, label: 'Twitter' },
            ].map((item, index) => (
              <button
                key={index}
                type="button"
                className="group flex items-center justify-center gap-2 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  {item.icon}
                </span>
              </button>
            ))}
          </div>

          {/* OR Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-950 px-3 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-medium">Email Address</FormLabel>
                    <FormControl>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        className="w-full text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
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
                    <FormLabel className="text-gray-300 font-medium">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...field}
                          className="w-full pr-12 text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forgot password link */}
              <div className="flex justify-end">
                <a 
                  href="#" 
                  className="text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <GlowButton
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </GlowButton>
            </form>
          </Form>

          {/* Footer */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-gray-400">
              Don&apos;t have an account?{' '}
              <a 
                href="/signup" 
                className="font-semibold text-primary hover:text-accent transition-colors underline underline-offset-4"
              >
                Sign up
              </a>
            </p>
            <p>
              <a 
                href="/register-superadmin" 
                className="text-sm font-medium text-gray-500 hover:text-primary transition-colors underline underline-offset-4"
              >
                Bootstrap Super Admin
              </a>
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-600">
              © 2024 Seraplus. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
