// src/components/DarkModeToggle.tsx
import { useEffect, useState } from 'react';
import { GlowButton } from './seraui/GlowButton';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  return (
    <GlowButton onClick={toggleDarkMode}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </GlowButton>
  );
}