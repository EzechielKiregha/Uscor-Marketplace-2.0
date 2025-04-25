'use client'
import React, { createContext, useState, useContext } from 'react';

type LoadingContextType = {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
        {children}
        </LoadingContext.Provider>
    );
    };

    export const useLoading = () => {
        const context = useContext(LoadingContext);
        if (context === undefined) {
            throw new Error('useLoading must be used within a LoadingProvider');
        }
    return context;
};