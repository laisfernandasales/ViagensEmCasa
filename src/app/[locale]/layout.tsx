import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

import { ThemeProvider } from "@/services/themes/ThemeContext";
import ClientThemeWrapper from "@/services/themes/ClientThemeWrapper";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viagens em casa",
  description: "O Marketplace da tua terra",
};

type Props = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
};

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
              <ClientThemeWrapper>
                <Header locale={locale} /> {/* Passa o locale diretamente */}
                {children}
                <Footer />
              </ClientThemeWrapper>
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}