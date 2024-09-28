import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ReactQueryProvider from "@/lib/providers/query";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Chat",
  description: "Just chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="absolute h-full w-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark absolute h-full w-full`}>
          <ReactQueryProvider>
            <main>{children}</main>
          </ReactQueryProvider>
      </body>
    </html>
  );
}
