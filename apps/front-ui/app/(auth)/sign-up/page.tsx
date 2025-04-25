'use client'

import { Icons } from '@/components/Icons'
import {
  Button,
  buttonVariants,
} from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from '@/lib/validators/account-credentials-validator'
// import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { ZodError } from 'zod'
import { useRouter } from 'next/navigation'
import { useNavigation } from '@/hooks/useNavigation'

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  })

  const onSubmit = ({
    email,
    password,
  }: TAuthCredentialsValidator) => {
    console.log(email, password)
  }

  const router = useRouter()
  const nav = useNavigation()
  // const { mutate, isLoading } =
  //   trpc.auth.createPayloadUser.useMutation({
  //     onError: (err) => {
  //       if (err.data?.code === 'CONFLICT') {
  //         toast.error(
  //           "Cet email est en cours d'utilisation, Connectez-vous"
  //         )

  //         return
  //       }

  //       if (err instanceof ZodError) {
  //         toast.error(err.issues[0].message)

  //         return
  //       }

  //       toast.error(
  //         "Il y'a eu un problem, reessayer encore."
  //       )
  //     },
  //     onSuccess: ({ sentToEmail }) => {
  //       toast.success(
  //         `Le mail de verification a ete envoye a ${sentToEmail}.`
  //       )
  //       router.push('/verify-email?to=' + sentToEmail)
  //     },
  //   })

  // const onSubmit = ({
  //   email,
  //   password,
  // }: TAuthCredentialsValidator) => {
  //   mutate({ email, password })
  // }

  return (
    <>
      <div className='container relative flex flex-col items-center justify-center lg:px-0'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col items-center space-y-2 text-center'>
            <Icons.logo className='h-14 w-auto' />
            <h1 className='text-2xl font-semibold tracking-tight'>
              Creer un compte
            </h1>

            <Link
              className={buttonVariants({
                variant: 'link',
                className: 'gap-1.5',
              })}
              onClick={() => nav()}
              href='/sign-in'>
              J&apos;ai deja un compte? Connexion
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>

          <div className='grid gap-6'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='grid gap-2'>
                <div className='grid gap-1 py-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    {...register('email')}
                    className={cn({
                      'focus-visible:ring-red-500':
                        errors.email,
                    })}
                    placeholder='toi@example.com'
                  />
                  {errors?.email && (
                    <p className='text-sm text-red-500'>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className='grid gap-1 py-2'>
                  <Label htmlFor='password'>Mot de passe</Label>
                  <Input
                    {...register('password')}
                    type='password'
                    className={cn({
                      'focus-visible:ring-red-500':
                        errors.password,
                    })}
                    placeholder='Password'
                  />
                  {errors?.password && (
                    <p className='text-sm text-red-500'>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  // disabled={isLoading ? true : false}
                  className={buttonVariants({
                    className: 'bg-blue-600 hover:bg-blue-100 text-gray-50 hover:text-black'
                  })}
                >
                  S&apos;inscrire
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
