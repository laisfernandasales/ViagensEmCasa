import React from 'react';
import { CartProvider } from '@/services/cart/CartContext';
import { ThemeProvider } from '@/services/themes/ThemeContext';
import ClientThemeWrapper from '@/services/themes/ClientThemeWrapper';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import GoogleCaptchaWrapper from './GoogleCaptchaWrapper'

interface WebpageContextProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

const WebpageContext: React.FC<WebpageContextProps> = ({ children, locale, messages }) => {
  return (
    <SessionProvider>
      <GoogleCaptchaWrapper>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider>
          <ClientThemeWrapper>
            <CartProvider>
               {children}
            </CartProvider>
          </ClientThemeWrapper>
        </ThemeProvider>
      </NextIntlClientProvider>
      </GoogleCaptchaWrapper>
    </SessionProvider>
  );
};

export default WebpageContext;
