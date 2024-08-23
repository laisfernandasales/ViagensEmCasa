"use client";
import React, { createContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

interface ThemeContextType {
  theme: string;
  changeTheme: (theme: string) => void;
}

const defaultContext: ThemeContextType = {
  theme: "light",
  changeTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<string>("light");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    }
    setIsMounted(true);
  }, []);

  const changeTheme = useCallback((newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  const contextValue = useMemo(() => ({ theme, changeTheme }), [theme, changeTheme]);

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
