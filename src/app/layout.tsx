import type { Metadata } from "next";
import { Montserrat, Dancing_Script } from "next/font/google";
import "./globals.css";
import { promises as fs } from 'fs';
import path from 'path';

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Just in Case",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

async function getIsTestMode() {
  try {
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    const data = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(data);
    return settings.mode === 'test';
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isTestMode = await getIsTestMode();

  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${dancingScript.variable} antialiased font-sans bg-background text-foreground`}
      >
        {children}

        {isTestMode && (
          <div className="fixed bottom-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-md z-[60] opacity-80 pointer-events-none">
            TEST MODE
          </div>
        )}
      </body>
    </html>
  );
}
