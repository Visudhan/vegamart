import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VegaMart | Local Grocery Store",
  description: "Your friendly neighborhood grocery store. Order fresh vegetables, fruits, and daily essentials online.",
};

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AppShell from "@/components/layout/AppShell";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CartProvider>
          <AppShell>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Header />
              <main style={{ flex: 1, padding: "2rem 0" }}>
                {children}
              </main>
              <Footer />
            </div>
          </AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
