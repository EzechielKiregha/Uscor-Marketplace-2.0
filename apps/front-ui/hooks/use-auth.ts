import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const useAuth = () => {
  const router = useRouter()

  const signOut = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!res.ok) throw new Error()

      toast.success('Deconnexion reussi!')

      router.push('/sign-in')
      router.refresh()
    } catch (err) {
      toast.error("Nous etions pas capable de vous deconnecter, reessayer encore")
      console.log("Internal Error [500]: ",err);
    }
  }

  return { signOut }
}
