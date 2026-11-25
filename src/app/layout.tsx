import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AgriTrack",
    template: "%s | AgriTrack",
  },
  description:
    "Smart Polytunnel & Agricultural Management System for Kurunduwatta Villa & Cottages",
  applicationName: "AgriTrack",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "AgriTrack",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#164222",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${fraunces.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
