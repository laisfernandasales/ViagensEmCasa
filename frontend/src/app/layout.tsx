import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from './components/Footer';
import { ThemeProvider } from "@/app/context/ThemeContext";
import ClientThemeWrapper from "@/app/context/ClientThemeWrapper";
import Header from "./components/Header";

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
    <html lang="en" >
      <body  className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <ClientThemeWrapper>
          <main className="flex-grow">
            <Header />
          <div className="container mx-auto p-4">
            {children}
          </div>
          <Footer />
          </main>

          </ClientThemeWrapper>
        </ThemeProvider>
        
      </body>
    </html>
  );
}
