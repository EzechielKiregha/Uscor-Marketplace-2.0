import { ButtonHTMLAttributes } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function GlowButton({ children, ...props }: GlowButtonProps) {
  return (
    <button
      className="rounded-md bg-primary px-4 py-2 text-white shadow-lg hover:bg-accent dark:bg-primary dark:hover:bg-accent transition"
      {...props}
    >
      {children}
    </button>
  );
}