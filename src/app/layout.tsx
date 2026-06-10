import type { Metadata } from "next";
import { Oswald, DM_Sans } from "next/font/google";
import "./globals.css";
import ClientCartProvider from "@/components/CartProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ThemeProvider } from "@/context/ThemeContext";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "RossyFlowers | Florería Líder Exclusiva en Lima",
  description: "Descubre arreglos florales de lujo en Lima. Diseños exclusivos de autor, rosas pastel premium, orquídeas imperiales y cajas aterciopeladas con delivery el mismo día.",
  keywords: "florería lima, flores premium lima, delivery de flores lima, rosas exclusivas lima, arreglos florales san isidro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${oswald.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-luxury-cream dark:bg-luxury-black text-luxury-black dark:text-luxury-cream font-sans transition-colors duration-500">
        <ThemeProvider>
          <ClientCartProvider>
            <Navbar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
          </ClientCartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
