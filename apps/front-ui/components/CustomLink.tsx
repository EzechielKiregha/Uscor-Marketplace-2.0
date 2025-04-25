// components/TGlink.tsx
'use client'

import { useLoading } from '@/app/context/loadingContext'
import Link from 'next/link'

interface TGlinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string
    children: React.ReactNode
}

const TGlink: React.FC<TGlinkProps> = ({ href , children, ...props }) => {
    const { setIsLoading } = useLoading()

    const handleClick = () => {
        setIsLoading(true)
    }

    return (
        <Link href={href} onClick={handleClick} {...props}>
        {children}
        </Link>
    )
}

export default TGlink