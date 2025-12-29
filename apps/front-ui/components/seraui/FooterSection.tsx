'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// --- Social Icons ---
const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.34 1.23-3.135-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.795 1.23 1.83 1.23 3.135 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.11.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.088 4.126H5.116z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// --- Footer Component ---
export default function Footer() {
  return (
    <footer className=" bg-card border-t border-orange-400/60 dark:border-orange-500/70 text-foreground py-12 px-4 ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Link href='/'>
              <Image alt='logo' src='/logo.png' width={50} height={40} />
            </Link>
            <h3 className="text-2xl font-bold text-primary">Uscor</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Empowering creators and businesses through a seamless digital marketplace experience.
          </p>
          <div className="flex space-x-4 pt-2">
            <Link
              href="https://github.com/EzechielKiregha"
              className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
            >
              <GitHubIcon />
            </Link>
            <Link
              href="https://twitter.com/EzechielKiregh1"
              className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
            >
              <TwitterIcon />
            </Link>
            <Link
              href="https://www.linkedin.com/in/kambale-kiregha-125a60264"
              className="text-muted-foreground hover:text-primary transition-transform hover:scale-110"
            >
              <LinkedInIcon />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
            </li>
            {/* <li>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
            </li> */}
            <li>
              <Link
                href="/marketplace/products"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/freelance-gigs"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Freelance Services
              </Link>
            </li>
            {/* <li>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </li> */}
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Resources</h3>
          <ul className="space-y-2">
            {/* <li>
              <Link
                href="/support"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </Link>
            </li> */}
            <li>
              <Link
                href="/faq"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Careers
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Contact Us</h3>
          <p className="text-muted-foreground text-sm">IRIBA HOUSE, Kigali City, Gikondo</p>
          <p className="text-muted-foreground text-sm">Email: kireghacorp@gmail.com</p>
          <p className="text-muted-foreground text-sm">Phone: +1 (800) 555-USOR</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-muted-foreground text-sm pt-10 mt-10 border-t border-border">
        <p>&copy; {new Date().getFullYear()} Uscor Marketplace. All rights reserved.</p>
        <p className="mt-1">
          Crafted with <span className="text-red-500">&hearts;</span> by Uscor Team
        </p>
      </div>
    </footer>
  );
}