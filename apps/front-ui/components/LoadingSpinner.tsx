'use client'

import { useLoading } from "@/app/context/loadingContext";



const LoadingSpinner = () => {
    const { isLoading } = useLoading();

    if (!isLoading) return null

    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
};

export default LoadingSpinner;