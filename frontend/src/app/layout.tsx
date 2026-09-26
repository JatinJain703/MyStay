import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import "react-day-picker/dist/style.css";
import { AppProvider } from "@/lib/app-context";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MyStay — Find your next stay",
  description: "Browse and book unique stays. A full-stack demo marketplace (portfolio project).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-[#222222] antialiased">
        <AppProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <footer className="border-t border-gray-200 bg-gray-50 py-8 text-sm text-gray-600">
            <div className="mx-auto max-w-7xl px-6">
              © {new Date().getFullYear()} MyStay · Demo / portfolio project · Not affiliated with Airbnb ·
              Mocked payments &amp; auth (no real charges)
            </div>
          </footer>
          <Toaster
            position="top-center"
            toastOptions={{
              style: { borderRadius: "12px", background: "#222", color: "#fff" },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
