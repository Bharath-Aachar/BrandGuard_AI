import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandGuardProvider } from "@/context/BrandGuardContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BrandGuard AI — Enterprise Brand Safety, Compliance & Risk Intelligence",
  description: "Next-generation real-time AI brand safety scanning, regulatory compliance auditing, trademark defense, and automated content remediation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <BrandGuardProvider>
          {children}
        </BrandGuardProvider>
      </body>
    </html>
  );
}
