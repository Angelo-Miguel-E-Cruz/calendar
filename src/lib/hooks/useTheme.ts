"use client"

import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg-primary: #ffffff;
        --bg-secondary: #f9fafb;
        --bg-tertiary: #f3f4f6;
        --text-primary: #111827;
        --text-secondary: #6b7280;
        --border-primary: #e5e7eb;
        --calendar-bg: #ffffff;
        --modal-bg: #ffffff;
      }

      [data-theme="dark"] {
        --bg-primary: #111827;
        --bg-secondary: #1f2937;
        --bg-tertiary: #374151;
        --text-primary: #f9fafb;
        --text-secondary: #d1d5db;
        --border-primary: #4b5563;
        --calendar-bg: #1f2937;
        --modal-bg: #1f2937;
      }

      body {
        background-color: var(--bg-primary);
        color: var(--text-primary);
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      /* FullCalendar dark mode styles */
      [data-theme="dark"] .fc {
        color: var(--text-primary);
      }
      
      [data-theme="dark"] .fc-theme-standard .fc-scrollgrid {
        border-color: var(--border-primary);
      }
      
      [data-theme="dark"] .fc-theme-standard td, 
      [data-theme="dark"] .fc-theme-standard th {
        border-color: var(--border-primary);
        background-color: var(--calendar-bg);
      }
      
      [data-theme="dark"] .fc-button-primary {
        background-color: #4f46e5;
        border-color: #4f46e5;
      }
      
      [data-theme="dark"] .fc-daygrid-day-number {
        color: var(--text-primary);
      }
      
      [data-theme="dark"] .fc-event {
        background-color: #4f46e5;
        border-color: #4f46e5;
      }
    `;

    document.head.appendChild(style);

    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return { theme, toggleTheme };
};