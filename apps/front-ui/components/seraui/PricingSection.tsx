'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedPriceProps {
  price: string;
}

const AnimatedPrice: React.FC<AnimatedPriceProps> = ({ price }) => {
  return (
    <motion.span
      className="inline-block"
      key={price}
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {price}
    </motion.span>
  );
};

const PricingSection = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const monthlyButtonRef = useRef<HTMLButtonElement>(null);
  const yearlyButtonRef = useRef<HTMLButtonElement>(null);
  const [activeButtonLeft, setActiveButtonLeft] = useState(0);
  const [activeButtonWidth, setActiveButtonWidth] = useState(0);

  useEffect(() => {
    const updateButtonMetrics = () => {
      if (monthlyButtonRef.current && yearlyButtonRef.current) {
        if (isMonthly) {
          setActiveButtonLeft(monthlyButtonRef.current.offsetLeft);
          setActiveButtonWidth(monthlyButtonRef.current.offsetWidth);
        } else {
          setActiveButtonLeft(yearlyButtonRef.current.offsetLeft);
          setActiveButtonWidth(yearlyButtonRef.current.offsetWidth);
        }
      }
    };
    updateButtonMetrics();
    window.addEventListener('resize', updateButtonMetrics);
    return () => window.removeEventListener('resize', updateButtonMetrics);
  }, [isMonthly]);

  const pricingTiers = [
    {
      name: 'Client',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      features: ['Product Browsing', 'Order Tracking', 'Loyalty Points'],
      buttonText: 'Sign Up Free',
      isPopular: false,
    },
    {
      name: 'Business',
      monthlyPrice: '$29',
      yearlyPrice: '$290',
      features: ['I-POS Sales', 'Inventory Management', 'Multi-Store Support'],
      buttonText: 'Start Now',
      isPopular: true,
    },
    {
      name: 'Freelancer',
      monthlyPrice: '$15',
      yearlyPrice: '$150',
      features: ['Service Listings', 'Order Management', 'KYC Verification'],
      buttonText: 'Get Started',
      isPopular: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen w-full relative bg-white dark:bg-black overflow-hidden">
      {/* Background Gradients */}
      <div
        className="absolute inset-0 z-0 opacity-60"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249, 115, 22, 0.15), transparent 70%)'
        }}
      />
      <div
        className="absolute inset-0 z-0 dark:block hidden opacity-80"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249, 115, 22, 0.25), transparent 70%), #000000'
        }}
      />

      <div className="relative z-10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black dark:text-white tracking-tight leading-tight">
              Affordable Plans for Your Business
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Choose a plan that fits your marketplace needs. No hidden fees.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="mt-8 sm:mt-10 flex justify-center px-4">
            <div
              className="relative flex items-center p-1 rounded-full border border-gray-300 dark:border-gray-700 shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <div
                className="absolute inset-0 rounded-full dark:block hidden"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)'
                }}
              />

              <button
                ref={monthlyButtonRef}
                onClick={() => setIsMonthly(true)}
                className={`relative z-10 py-2 px-4 sm:px-6 rounded-full text-sm font-medium transition-all duration-300 ${isMonthly ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
              >
                Monthly
              </button>

              <button
                ref={yearlyButtonRef}
                onClick={() => setIsMonthly(false)}
                className={`relative z-10 py-2 px-4 sm:px-6 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center ${!isMonthly ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
              >
                Yearly
                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                  20% off
                </span>
              </button>

              {activeButtonWidth > 0 && (
                <motion.div
                  className="absolute inset-y-1 rounded-full shadow-md bg-orange-500"
                  style={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                  initial={false}
                  animate={{ left: activeButtonLeft, width: activeButtonWidth }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <motion.div
            className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 px-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                className={`relative flex flex-col p-6 sm:p-8 rounded-xl border transition-all duration-300 ${tier.isPopular
                    ? 'border-orange-500 bg-white/95 dark:bg-black/80 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/70'
                  }`}
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  boxShadow: tier.isPopular
                    ? '0 25px 50px -12px rgba(249, 115, 22, 0.3)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-semibold uppercase rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
                  {tier.name}
                </h3>

                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-extrabold text-black dark:text-white">
                    <AnimatedPrice price={isMonthly ? tier.monthlyPrice : tier.yearlyPrice} />
                  </span>
                  <span className="ml-1 text-lg sm:text-xl font-medium text-gray-500 dark:text-gray-400">
                    /{isMonthly ? 'month' : 'year'}
                  </span>
                </div>

                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {tier.name === 'Client'
                    ? 'Perfect for shoppers and loyalty program users.'
                    : tier.name === 'Business'
                      ? 'Ideal for stores with I-POS and inventory needs.'
                      : 'For gig workers offering services.'
                  }
                </p>

                <ul role="list" className="mt-6 sm:mt-8 space-y-3 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-orange-500 mt-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <p className="ml-3 text-sm sm:text-base text-gray-700 dark:text-gray-200">
                        {feature}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 sm:mt-8">
                  <motion.button
                    className={`glow-button w-full py-3 px-4 rounded-md text-sm sm:text-base font-medium transition-all duration-300 ${tier.isPopular
                        ? ''
                        : 'bg-white dark:bg-gray-800 text-orange-500 border-2 border-orange-500/30 hover:bg-orange-500 hover:text-white'
                      }`}
                    style={!tier.isPopular ? {
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)'
                    } : {}}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tier.buttonText}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;