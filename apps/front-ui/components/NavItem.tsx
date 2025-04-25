"use client"
import React from 'react'
import { Button } from './ui/button'
import { PRODUCT_CATEGORIES } from '@/config'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
// import { useNavigation } from '@/hooks/useNavigation'

type Category = typeof PRODUCT_CATEGORIES[number]

interface NavItemProps {
    category: Category
    handleOpen: () => void
    isOpen: boolean
    isAnyOpen: boolean
}

const NavItem = ({
    category,
    handleOpen,
    isOpen,
    isAnyOpen
}: NavItemProps) => {
    // const nav = useNavigation()
    return <div className="flex">
        <div className="relative flex items-center">
            <Button className='gap-1.5'
                variant={isOpen ? "secondary" : "ghost"}
                onClick={handleOpen}
            >
                {category.label}
                <ChevronDown className={cn(
                    'h-4 w-4 transition-all text-muted-foreground',
                    {
                        '-rotate-180': isOpen,
                    }
                )}
                />
            </Button>
        </div>
        {isOpen ? (
            <div className={cn(
                "absolute inset-x-0 top-full text-sm text-muted-foreground",
                {
                    "animate-in fade-in-10 slide-in-from-top-5": !isAnyOpen
                }
            )}>
                <div
                    className='absolute inset-0 top-1/2 shadow bg-white'
                    area-hidden='true'
                />
                <div className="relative bg-white">
                    <div className="mx-auto max-w-7xl px-8">
                        <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                            <div className="col-span-4 col-start-1 grid-cols-3 grid gap-x-8">
                                {category.featured.map((item) => (
                                    <div key={item.name} className="group relative text-base sm:text-sm">
                                        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                                            <Image
                                                src={item.imageSrc}
                                                fill
                                                alt='product category image'
                                            />
                                        </div>
                                        <Link
                                            // onClick={() => nav()}
                                            href={item.href} className='mt-6 font-medium text-gray-900'>
                                            {item.name}
                                        </Link>
                                        <p area-hidden='true' className="mt-1">
                                            achete maintenant
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null}
    </div>
}

export default NavItem