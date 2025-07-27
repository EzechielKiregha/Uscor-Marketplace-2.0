import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const MaxWidthWrapper = ({
    className,
    children
}: {
    className?: string
    children: ReactNode
}) => {
    return (
        <div className={cn(
            "px-1.5 w-full dark:bg-gray-950",
            className
        )}>
            {children}
        </div>
    )
}

export default MaxWidthWrapper;