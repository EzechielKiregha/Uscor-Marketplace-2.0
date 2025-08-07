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
      <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(202, 44, 72, 0.15), transparent 70%), rgb(248 250 252)' }} />
      <div className="absolute inset-0 z-0 dark:block hidden" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(202, 44, 72, 0.25), transparent 70%), #000000' }} />
      <div className="relative z-10 font-inter py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Affordable Plans for Your Business
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose a plan that fits your marketplace needs. No hidden fees.
            </p>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="relative flex items-center p-1 rounded-full border border-gray-300 dark:border-gray-700 dark:shadow-2xl" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
              <div className="absolute inset-0 rounded-full dark:block hidden" style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)' }} />
              <button ref={monthlyButtonRef} onClick={() => setIsMonthly(true)} className={`relative z-10 py-2 px-6 rounded-full text-sm font-medium transition-all duration-300 ${isMonthly ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>Monthly</button>
              <button ref={yearlyButtonRef} onClick={() => setIsMonthly(false)} className={`relative z-10 py-2 px-6 rounded-full text-sm font-medium transition-all duration-300 flex items-center justify-center ${!isMonthly ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                Yearly
                <span className="ml-2 px-2 py-0.5 bg-[#CA2C48] text-white text-xs font-bold rounded-full">20% off</span>
              </button>
              {activeButtonWidth > 0 && (
                <motion.div className="absolute inset-y-1 rounded-full shadow-md" style={{ background: 'rgba(202, 44, 72, 0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} initial={false} animate={{ left: activeButtonLeft, width: activeButtonWidth }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
              )}
            </div>
          </div>

          <motion.div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants} initial="hidden" animate="visible">
            {pricingTiers.map((tier) => (
              <motion.div key={tier.name} className={`relative flex flex-col p-8 rounded-xl border transition-all duration-300 ${tier.isPopular ? 'border-[#CA2C48] bg-white/90 dark:bg-black/60' : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60'}`} style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} variants={cardVariants} whileHover={{ y: -8, boxShadow: tier.isPopular ? '0 25px 50px -12px rgba(202, 44, 72, 0.3)' : '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                {tier.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#CA2C48] text-white text-xs font-semibold uppercase rounded-full shadow-md">Most Popular</div>}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                    <AnimatedPrice price={isMonthly ? tier.monthlyPrice : tier.yearlyPrice} />
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">/{isMonthly ? 'month' : 'year'}</span>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{tier.name === 'Client' ? 'Perfect for shoppers and loyalty program users.' : tier.name === 'Business' ? 'Ideal for stores with I-POS and inventory needs.' : 'For gig workers offering services.'}</p>
                <ul role="list" className="mt-8 space-y-3 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-[#CA2C48] mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <p className="ml-3 text-base text-gray-700 dark:text-gray-200">{feature}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <motion.button className={`w-full py-2 px-4 rounded-md text-base font-medium transition-all duration-300 inline-flex items-center justify-center border ${tier.isPopular ? 'bg-[#CA2C48] text-white border-[#CA2C48] hover:bg-[#B02441]' : 'bg-white/80 dark:bg-gray-800/80 text-[#CA2C48] border-[#CA2C48]/30 dark:border-[#CA2C48]/50 hover:bg-[#CA2C48]/10 dark:hover:bg-[#CA2C48]/20'}`} style={{ backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>{tier.buttonText}</motion.button>
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
