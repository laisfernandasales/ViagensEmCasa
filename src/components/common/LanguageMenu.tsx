"use client";

import React, { useState, useRef, useEffect } from 'react';

const LanguageMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLocaleChange = (newLocale: string) => {
    window.location.href = `/${newLocale}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative flex items-center cursor-pointer rounded-md" onClick={toggleMenu}>
      <button className="flex items-center space-x-2 p-1">
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span className="text-sm">Idioma</span>
      </button>

      {isOpen && (
        <ul className="absolute mt-1 min-w-[120px] rounded-md shadow-lg z-10 top-full left-0">
          <li className="block px-2 py-1 text-sm">
            <a href="#" onClick={() => handleLocaleChange('pt')} className="flex items-center">
              <img src="/icons/portugal.png" alt="Português" className="h-5 w-5 mr-2" />
              Português
            </a>
          </li>
          <li className="block px-2 py-1 text-sm">
            <a href="#" onClick={() => handleLocaleChange('es')} className="flex items-center">
              <img src="/icons/spain.png" alt="Español" className="h-5 w-5 mr-2" />
              Español
            </a>
          </li>
          <li className="block px-2 py-1 text-sm">
            <a href="#" onClick={() => handleLocaleChange('en')} className="flex items-center">
              <img src="/icons/england.png" alt="English" className="h-5 w-5 mr-2" />
              English
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default LanguageMenu;
