"use client";

import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const ToggleThemeButton = () => {
  const { theme, changeTheme } = useContext(ThemeContext);

  return (
    <label className="flex cursor-pointer gap-2 items-center">
      <div className="relative w-5 h-5">
        {/* Sun icon for light theme */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}
        >
          <circle cx="12" cy="12" r="5" />
          <path
            d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
        {/* Moon icon for dark theme */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </div>
      <input
        type="checkbox"
        className="toggle theme-controller"
        checked={theme === 'dark'}
        onChange={() => changeTheme(theme === 'light' ? 'dark' : 'light')}
      />
      <span className="text-base-content">{theme === 'light' ? 'Claro' : 'Escuro'}</span>
    </label>
  );
};

export default ToggleThemeButton;
