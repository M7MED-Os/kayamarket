import type { Metadata } from "next";
import { Poppins, Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KayaMarket | المنصة المتكاملة لتجارة التجزئة",
  description: "أنشئ متجرك الإلكتروني الاحترافي في دقائق مع KayaMarket. المنصة العصرية لإدارة التجارة الإلكترونية.",
  icons: {
    icon: [
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={`${poppins.variable} ${inter.variable} ${cairo.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
        <Providers>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
