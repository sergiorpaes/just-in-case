import type { Metadata } from "next";
import { Montserrat, Dancing_Script } from "next/font/google";
import "./globals.css";
import { ShoppingBag } from "lucide-react";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
});

export const metadata: Metadata = {
  title: "Just in Case",
  description: "Essentials for your stay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${dancingScript.variable} antialiased font-sans bg-background text-foreground`}
      >
        <header className="flex flex-col items-center justify-center py-8 border-b border-black/5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <div className="text-4xl font-handwriting text-primary pt-2">Just in Case</div>
          </div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-stone-500 mt-2">Essentials for your stay</p>
        </header>
        <main className="min-h-screen max-w-md mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
