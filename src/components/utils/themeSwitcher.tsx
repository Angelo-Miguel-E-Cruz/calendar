"use client"

import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';
import { useTheme } from '@/lib/hooks/useTheme';

// Toggle switch version
export const ToggleThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  const switchStyle = {
    backgroundColor: theme === 'light' ? '#d1d5db' : '#4b5563',
    transition: 'background-color 0.3s ease',
  };

  const knobStyle = {
    backgroundColor: 'var(--bg-primary)',
    transform: theme === 'dark' ? 'translateX(2rem)' : 'translateX(0.25rem)',
    transition: 'transform 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  return (
    <button
      onClick={toggleTheme}
      style={switchStyle}
      className="relative inline-flex items-center w-16 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span
        style={knobStyle}
        className="flex w-6 h-6 rounded-full items-center justify-center"
      >
        {theme === 'light' ? (
          <SunIcon className="w-4 h-4 text-yellow-600" />
        ) : (
          <MoonIcon className="w-4 h-4 text-blue-400" />
        )}
      </span>
    </button>
  );
};