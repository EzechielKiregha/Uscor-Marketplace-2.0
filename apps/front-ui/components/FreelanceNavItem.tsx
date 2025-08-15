"use client"
import React from 'react'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { FREELANCE_SERVICE_CATEGORIES } from '@/config/freelance-categories'
import { PopoverCategory, PopoverCategoryContent, PopoverCategoryTrigger } from './seraui/PopOverCategory'
// import { useNavigation } from '@/hooks/useNavigation'

type Category = typeof FREELANCE_SERVICE_CATEGORIES[number]

interface FreelanceNavItemProps {
  category: Category
  handleOpen: () => void
  isOpen: boolean
  isAnyOpen: boolean
}

const FreelanceNavItem = ({
  category,
  handleOpen,
  isOpen,
  isAnyOpen
}: FreelanceNavItemProps) => {
  // const nav = useNavigation()
  return (
    <PopoverCategory >
      {/* Trigger Button */}
      <PopoverCategoryTrigger>
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
      </PopoverCategoryTrigger>
      <PopoverCategoryContent align="center" className="p-0 w-full max-w-4xl">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
              <div className="col-span-4 col-start-1 grid-cols-3 grid gap-x-8">
                {category.services.map((item) => (
                  <div key={item.name} className=" text-base space-y-2 sm:text-sm">
                    <div className=" aspect-video overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                      <img
                        src={item.imageSrc}
                        className="object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(item.name)}`; // Fallback image
                        }}
                        alt='freelance service category image'
                      />
                    </div>
                    <Link
                      // onClick={() => nav()}
                      href={item.href} className='mt-6 font-medium text-gray-200'>
                      {item.name}
                      <span className="text-center mt-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full hidden sm:block">
                        Hire Now
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverCategoryContent>
    </PopoverCategory>
  )
}

export default FreelanceNavItem