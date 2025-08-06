// 'use client'

// import { User } from '@/payload-types'
// import { Button } from './ui/button'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu'
// import Link from 'next/link'
// import { useAuth } from '@/hooks/use-auth'
// import { LayoutDashboard, LogOut } from 'lucide-react'
// import { useNavigation } from '@/hooks/useNavigation'

// const UserAccountNav = ({ user }: { user: User }) => {
//   const { signOut } = useAuth()
//   const nav = useNavigation()

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger
//         asChild
//         className='overflow-visible'>
//         <Button
//           variant='ghost'
//           size='sm'
//           className='relative'>
//           Mon compte
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         className='bg-white w-60'
//         align='end'>
//         <div className='flex items-center justify-start gap-2 p-2'>
//           <div className='flex flex-col space-y-0.5 leading-none'>
//             <p className='font-medium text-sm text-black'>
//               {user.email}
//             </p>
//           </div>
//         </div>

//         <DropdownMenuSeparator />

//         <DropdownMenuItem asChild>

//           <Link href='/admin' onClick={() => nav()}>
//             <LayoutDashboard className='h4 w-4 mr-2' />
//             Tableau de bord</Link>
//         </DropdownMenuItem>

//         <DropdownMenuItem
//           onClick={signOut}
//           className='cursor-pointer'>
//           <LogOut className='h-4 w-4 mr-2' />
//           Deconnexion
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }

// export default UserAccountNav
