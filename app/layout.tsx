import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/navbar";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "MinuteMate - Expert Advice in Minutes",
  description: "Get instant access to verified experts for your business challenges. Book 15-30 minute consultations and receive AI-generated summaries with actionable insights.",
  keywords: "expert consultation, business advice, professional guidance, micro-consulting",
  authors: [{ name: "MinuteMate" }],
  creator: "MinuteMate",
  publisher: "MinuteMate",
  openGraph: {
    title: "MinuteMate - Expert Advice in Minutes",
    description: "Get instant access to verified experts for your business challenges.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinuteMate - Expert Advice in Minutes",
    description: "Get instant access to verified experts for your business challenges.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}