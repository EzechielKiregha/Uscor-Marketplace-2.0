"use client";
import React, { useState, useEffect } from 'react';
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'
import NavItems from './NavItems'
import { buttonVariants } from './ui/button'
import Cart from './Cart'
// import { getServerSideUser } from '@/lib/payload-utils'
// import { cookies } from 'next/headers'
import UserAccountNav from './UserAccountNav'
import MobileNav from './MobileNav'
import Image from 'next/image'
import { ModeToggle } from './mode-toggle'
// import { useNavigation } from '../hooks/useNavigation'
import {
    useMotionTemplate,
    useMotionValue,
    motion,
    animate,
} from "framer-motion";
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';


const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const color = useMotionValue(COLORS_TOP[0]);


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%)`;


    return (
        <div className={`sticky z-50 top-0 inset-x-0 h-16 transition-colors duration-300 bg-white dark:bg-gray-950 dark:text-gray-100 text-gray-950`}>
            <div className="absolute inset-0 z-0">
                <Canvas>
                    <Stars radius={20} count={200} factor={2} fade speed={1} />
                </Canvas>
            </div>
            <header className="relative shadow-sm">
                <MaxWidthWrapper>
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex h-16 items-center">
                            {/* TODO : Navbar sur mobile */}
                            <MobileNav />
                            <div className="ml-8 pl-2.5 flex flex-row lg:ml-0">
                                <a href='/'>
                                    <Image alt='logo' src='/logo.png' width={50} height={40} />
                                </a>
                            </div>
                            <div className="hidden z-50 lg:ml-8 lg:block lg:self-stretch">
                                <NavItems />
                            </div>
                            <div className="ml-auto flex items-center">
                                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-6">
                                    {/* {user ? null : (
                                            <Link
                                                // onClick={() => nav()}
                                                href="/sign-in"
                                                className={buttonVariants({
                                                    variant: "ghost"
                                                })}
                                            >
                                                Connexion
                                            </Link>
                                        )}

                                        {user ? null : (
                                            <span className="h-6 w-px bg-gray-200"
                                                area-hidden="true"
                                            />
                                        )}

                                        {user ? (
                                            <UserAccountNav user={user} />
                                        ) : (
                                            <Link
                                                // onClick={() => nav()}
                                                href="/sign-up"
                                                className={buttonVariants({
                                                    variant: "ghost"
                                                })}
                                            >
                                                S&apos;inscrire
                                            </Link>
                                        )}

                                        {user ? 
                                            <span className="h-6 w-px bg-gray-200"
                                                area-hidden="true"
                                            /> :
                                            null
                                        }

                                        {user ? null :
                                            <div className="flex lg:ml-6">
                                                <span className="h-6 w-px bg-gray-200"
                                                    area-hidden="true"
                                                />
                                            </div>
                                        } */}

                                </div>
                                <div className="flex felx-col space-x-2 ml-4 pr-2.5 lg:ml-6">
                                    <ModeToggle />
                                    <Cart />
                                </div>
                            </div>
                        </div>
                    </div>
                </MaxWidthWrapper>
            </header>

        </div>
    );
}

export default Navbar;