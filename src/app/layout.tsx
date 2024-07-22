import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

import { ThemeProvider } from "@/services/themes/ThemeContext";
import ClientThemeWrapper from "@/services/themes/ClientThemeWrapper";
import { SessionProvider } from "next-auth/react"; 



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viagens em casa",
  description: "O Marketplace da tua terra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <SessionProvider> 
          <ThemeProvider>
            <ClientThemeWrapper>
                <Header/>
                 {children}
               <Footer/>
             </ClientThemeWrapper>
          </ThemeProvider>
        </SessionProvider>
        </body>
    </html>
  );
}
