'use client';
import React from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  avatarFallback: string;
  logo?: string;
}

interface TestimonialSectionProps {
  className?: string;
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({
  className = '',
  title = 'Trusted by Our Customers',
  subtitle = 'Hear from users who love Uscor Marketplace for its seamless shopping and business tools.',
  testimonials = [
    {
      quote: 'Uscor Marketplace has transformed our shopping experience. The intuitive platform and robust features make it a game-changer for buyers and sellers.',
      author: 'Shekinah Tshikulila',
      role: 'Entrepreneur',
      avatar: 'https://i.pravatar.cc/150?img=1',
      avatarFallback: 'https://placehold.co/48x48/6B7280/FFFFFF?text=ST',
    },
    {
      quote: 'The platform’s ease of use and powerful tools have saved us countless hours. It’s an invaluable asset for our business.',
      author: 'Jonathan Yombo',
      role: 'Business Owner',
      avatar: 'https://i.pravatar.cc/150?img=2',
      avatarFallback: 'https://placehold.co/48x48/6B7280/FFFFFF?text=JY',
    },
    {
      quote: 'The product listings and loyalty program are top-notch. Uscor has elevated our customer engagement.',
      author: 'Yucel Farukşahan',
      role: 'Retailer',
      avatar: 'https://i.pravatar.cc/150?img=3',
      avatarFallback: 'https://placehold.co/40x40/6B7280/FFFFFF?text=YF',
    },
    {
      quote: 'Exceptional quality and attention to detail. Uscor is the best marketplace platform I’ve used.',
      author: 'Rodrigo Aguilar',
      role: 'Freelancer',
      avatar: 'https://i.pravatar.cc/150?img=4',
      avatarFallback: 'https://placehold.co/40x40/6B7280/FFFFFF?text=RA',
    },
  ],
}) => {
  return (
    <div className={`font-inter flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 text-[var(--secondary-dark)] dark:text-[var(--lightGray)] ${className}`}>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center max-w-4xl leading-tight mb-6">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed text-center max-w-3xl mb-8">
        {subtitle}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-6xl">
        <div className="bg-white/80 dark:bg-gray-950/50 p-8 rounded-xl flex flex-col justify-between border border-[var(--secondary-light)] dark:border-[var(--secondary-dark)] backdrop-blur-sm shadow-md">
          <div className="mb-8">
            {testimonials[0].logo && (
              <div className="flex items-center mb-6">
                <svg className="w-10 h-10 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 10.99C22 5.47 17.52 1 12 1S2 5.47 2 10.99C2 16.51 6.48 21 12 21S22 16.51 22 10.99ZM12 19C7.58 19 4 15.42 4 11C4 6.58 7.58 3 12 3S20 6.58 20 11C20 15.42 16.42 19 12 19ZM12 5C9.24 5 7 7.24 7 10C7 12.76 9.24 15 12 15C14.76 15 17 12.76 17 10C17 7.24 14.76 5 12 5ZM12 13C10.34 13 9 11.66 9 10C9 8.34 10.34 7 12 7C13.66 7 15 8.34 15 10C15 11.66 13.66 13 12 13Z" />
                </svg>
              </div>
            )}
            <p className="text-base sm:text-lg lg:text-xl text-[var(--secondary-dark)] dark:text-[var(--lightGray)] leading-relaxed mb-8">
              {testimonials[0].quote}
            </p>
          </div>
          <div className="flex items-center">
            <img
              src={testimonials[0].avatar}
              alt={testimonials[0].author}
              className="w-12 h-12 rounded-full object-cover mr-4"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = testimonials[0].avatarFallback; }}
            />
            <div>
              <p className="font-semibold text-[var(--secondary-dark)] dark:text-[var(--lightGray)]">{testimonials[0].author}</p>
              <p className="text-sm text-[var(--secondary-light)] dark:text-[var(--secondary-dark)]">{testimonials[0].role}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white/80 dark:bg-gray-950/50 p-8 rounded-xl flex flex-col justify-between border border-[var(--secondary-light)] dark:border-[var(--secondary-dark)] backdrop-blur-sm shadow-md">
            <p className="text-base sm:text-lg lg:text-xl text-[var(--secondary-dark)] dark:text-[var(--lightGray)] leading-relaxed mb-8">
              {testimonials[1].quote}
            </p>
            <div className="flex items-center">
              <img
                src={testimonials[1].avatar}
                alt={testimonials[1].author}
                className="w-12 h-12 rounded-full object-cover mr-4"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = testimonials[1].avatarFallback; }}
              />
              <div>
                <p className="font-semibold text-[var(--secondary-dark)] dark:text-[var(--lightGray)]">{testimonials[1].author}</p>
                <p className="text-sm text-[var(--secondary-light)] dark:text-[var(--secondary-dark)]">{testimonials[1].role}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testimonials.slice(2).map((testimonial) => (
              <div key={testimonial.author} className="bg-white/80 dark:bg-gray-950/50 p-6 rounded-xl flex flex-col justify-between border border-[var(--secondary-light)] dark:border-[var(--secondary-dark)] backdrop-blur-sm shadow-md">
                <p className="text-sm sm:text-base text-[var(--secondary-dark)] dark:text-[var(--lightGray)] leading-relaxed mb-6">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = testimonial.avatarFallback; }}
                  />
                  <div>
                    <p className="font-semibold text-[var(--secondary-dark)] dark:text-[var(--lightGray)]">{testimonial.author}</p>
                    <p className="text-sm text-[var(--secondary-light)] dark:text-[var(--secondary-dark)]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;