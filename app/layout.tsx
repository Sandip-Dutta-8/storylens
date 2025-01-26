import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StoryLens",
  description: "A journaling application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className}`}
        >
          <div className="bg-[url('/bg.jpg')] opacity-50 fixed -z-10 inset-0" />
          <Header />
          <main>{children}</main>
          <Toaster richColors/>

          <footer className="bg-orange-300 py-12 bg-opacity-10">
            <div className="container mx-auto px-4 text-center text-gray-900">
              <p>Made with 💗 by Sandip</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
