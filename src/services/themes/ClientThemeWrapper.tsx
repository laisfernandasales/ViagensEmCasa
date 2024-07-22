"use client";

import { useContext, ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';

interface ClientThemeWrapperProps {
  children: ReactNode;
}

export default function ClientThemeWrapper({ children }: ClientThemeWrapperProps) {
  const { theme } = useContext(ThemeContext);

  return <div data-theme={theme}>{children}</div>;
}
