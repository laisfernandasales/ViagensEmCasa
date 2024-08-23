import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import WebpageContext from "@/services/context/WebpageContext";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viagens em casa",
  description: "O Marketplace da tua terra",
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
  readonly params: {
    readonly locale: string;
  };
}

export default async function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <WebpageContext locale={locale} messages={messages}>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </WebpageContext>
      </body>
    </html>
  );
}
