'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, gql } from '@apollo/client';
import { setAuthToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/toast-provider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GlowButton } from '@/components/seraui/GlowButton';
import { Select } from '@radix-ui/react-select';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CREATE_BUSINESS, CREATE_CLIENT, CREATE_WORKER } from '@/graphql/auth.gql';

// SVG Icons (reused from Signin1)
const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LockIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <circle cx="12" cy="16" r="1"></circle>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EyeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);

const ArrowRightIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

const ArrowLeftIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"></path>
    <path d="m12 19-7-7 7-7"></path>
  </svg>
);

// Zod Schema
const schema = z.object({
  role: z.enum(['Client', 'Business', 'Worker'], { message: 'Please select a role' }),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  workerRole: z.enum(['ADMIN', 'STAFF', 'MANAGER', 'FREELANCER']).optional(),
  businessId: z.string().optional(),
}).refine((data) => data.role !== 'Worker' || (data.workerRole && data.businessId), {
  message: 'Worker role and business ID are required for Worker accounts',
  path: ['workerRole'],
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Client' },
  });

  const { handleSubmit, watch, setValue } = form;
  const [createClient, { loading: clientLoading, error: clientError }] = useMutation(CREATE_CLIENT);
  const [createBusiness, { loading: businessLoading, error: businessError }] = useMutation(CREATE_BUSINESS);
  const [createWorker, { loading: workerLoading, error: workerError }] = useMutation(CREATE_WORKER);
  const role = watch('role');

  const loading = clientLoading || businessLoading || workerLoading;
  const error = clientError || businessError || workerError;
  const { showToast } = useToast();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const onSubmit = async (data: FormData) => {
    try {
      let result;
      if (data.role === 'Client') {
        result = await createClient({
          variables: {
            createClientInput: {
              email: data.email,
              password: data.password,
              username: data.fullName.trim(),
              fullName: data.fullName,
              phone: data.phone,
              isVerified: false,
            },
          },
        });
        result = result.data.createClient;
      } else if (data.role === 'Business') {
        result = await createBusiness({
          variables: {
            createBusinessInput: {
              email: data.email,
              password: data.password,
              name: data.fullName,
              phone: data.phone,
            },
          },
        });
        result = result.data.createBusiness;
      } else if (data.role === 'Worker') {
        result = await createWorker({
          variables: {
            createWorkerInput: {
              email: data.email,
              password: data.password,
              fullName: data.fullName,
              role: data.workerRole,
              businessId: data.businessId,
              isVerified: false,
            },
          },
        });
        result = result.data.createWorker;
      }
      showToast(
        'success',
        'Success',
        'Account Was Created',
        true,
        8000,
        'bottom-right'
      )
      router.push('/login');
    } catch (err: any) {
      showToast(
        'error',
        'Failed',
        err.message,
        true,
        8000,
        'bottom-right'
      )
    };
  };

  return (
    <div className="relative w-full flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <div className="w-full max-w-sm p-6 space-y-6 bg-white dark:bg-gray-950 rounded-lg border border-secondary-light dark:border-secondary-dark shadow-lg">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-darkGray dark:text-lightGray">Step {step} of 4</span>
            <span className="text-sm text-secondary-light dark:text-secondary-dark">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary-light dark:bg-secondary-dark rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-950 p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary-light dark:bg-secondary-dark rounded-full mb-4">
              <UserIcon />
            </div>
            <h1 className="text-2xl font-semibold text-darkGray dark:text-lightGray mb-2">
              Create Account
            </h1>
            <p className="text-sm text-secondary-light dark:text-secondary-dark">
              {step === 1 && 'Select your account type'}
              {step === 2 && 'Enter your personal information'}
              {step === 3 && 'Set up your credentials'}
              {step === 4 && 'Review your details'}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 items-center">
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <div className="space-y-4">
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
                              <SelectTrigger className="form-field w-full">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="form-field w-full">
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

                  <GlowButton
                    type="button"
                    onClick={handleNext}
                    disabled={!role}
                    className="mt-4 w-full text-secondary-light dark:text-secondary-dark hover:text-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRightIcon />
                  </GlowButton>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{role === 'Business' ? 'Business Name' : 'Full Name'}</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            placeholder={role === 'Business' ? 'Enter your business name' : 'Enter your full name'}
                            className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark"
                          />
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
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            placeholder="Enter your phone number"
                            className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {role === 'Worker' && (
                    <>
                      <FormField
                        control={form.control}
                        name="workerRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Worker Role</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark"
                              >
                                <option value="">Select role</option>
                                <option value="ADMIN">Admin</option>
                                <option value="STAFF">Staff</option>
                                <option value="MANAGER">Manager</option>
                                <option value="FREELANCER">Freelancer</option>
                              </select>

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
                                  <SelectItem value="Admin">Admin</SelectItem>
                                  <SelectItem value="Staff">Staff</SelectItem>
                                  <SelectItem value="Manager">Manager</SelectItem>
                                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                                </SelectContent>
                              </Select>

                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business ID (Optional)</FormLabel>
                            <FormControl>
                              <input
                                {...field}
                                placeholder="Enter associated business ID"
                                className="w-full text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </>
                  )}
                  <GlowButton
                    type="button"
                    onClick={handleNext}
                    disabled={!watch('fullName') || (role === 'Worker' && !watch('workerRole'))}
                    className="mt-4 w-full text-secondary-light dark:text-secondary-dark hover:text-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRightIcon />
                  </GlowButton>
                </div>
              )}

              {/* Step 3: Credentials */}
              {step === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <MailIcon />
                            </div>
                            <input
                              {...field}
                              type="email"
                              placeholder="name@example.com"
                              className="w-full pl-9 text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LockIcon />
                              </div>
                              <input
                                {...field}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                className="w-full pl-9 pr-10 text-darkGray dark:text-lightGray bg-transparent border rounded-md px-3 py-2 border-secondary-light dark:border-secondary-dark"
                              />
                              <GlowButton
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-light dark:text-secondary-dark hover:text-primary"
                              >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                              </GlowButton>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <GlowButton
                    type="button"
                    onClick={handleNext}
                    disabled={!watch('email') || !watch('password')}
                    className="mt-4 w-full text-secondary-light dark:text-secondary-dark hover:text-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRightIcon />
                  </GlowButton>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-secondary-light dark:bg-secondary-dark border border-secondary-light dark:border-secondary-dark p-4 rounded-md">
                    <h3 className="font-medium text-darkGray dark:text-lightGray mb-3 flex items-center gap-2">
                      <CheckIcon /> Review Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-secondary-light dark:text-secondary-dark">Account Type:</span>
                        <span className="text-darkGray dark:text-lightGray font-medium">{role}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-secondary-light dark:text-secondary-dark">{role === 'Business' ? 'Business Name' : 'Full Name'}:</span>
                        <span className="text-darkGray dark:text-lightGray font-medium">{watch('fullName')}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-secondary-light dark:text-secondary-dark">Email:</span>
                        <span className="text-darkGray dark:text-lightGray font-medium">{watch('email')}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-secondary-light dark:text-secondary-dark">Password:</span>
                        <span className="text-darkGray dark:text-lightGray font-medium">••••••••</span>
                      </div>
                      {watch('phone') && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-secondary-light dark:text-secondary-dark">Phone:</span>
                          <span className="text-darkGray dark:text-lightGray font-medium">{watch('phone')}</span>
                        </div>
                      )}
                      {role === 'Worker' && watch('workerRole') && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-secondary-light dark:text-secondary-dark">Worker Role:</span>
                          <span className="text-darkGray dark:text-lightGray font-medium">{watch('workerRole')}</span>
                        </div>
                      )}
                      {role === 'Worker' && watch('businessId') && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-secondary-light dark:text-secondary-dark">Business ID:</span>
                          <span className="text-darkGray dark:text-lightGray font-medium">{watch('businessId')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <GlowButton
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary rounded-md cursor-pointer py-1"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-darkGray border-t-transparent"></div>
                        Creating account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </GlowButton>
                </div>
              )}
            </form>
          </Form>

          {/* Back Button */}
          {step > 1 && (
            <GlowButton
              onClick={() => setStep(step - 1)}
              className="mt-4 w-full text-secondary-light dark:text-secondary-dark hover:text-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon /> Back to previous step
            </GlowButton>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-light dark:text-secondary-dark">
              Already have an account?{' '}
              <a href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>


    </div>
  );
}