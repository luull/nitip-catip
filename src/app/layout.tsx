import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://nitip-catip.vercel.app"),

  title: {
    default: "Nitip Catip - Jasa Titip Event & Merchandise",
    template: "%s | Nitip Catip",
  },

  description:
    "Jasa titip merchandise event, konser, fan meeting, exhibition, pop-up store, dan berbagai event lainnya. Titip beli lebih mudah bersama Nitip Catip.",

  keywords: [
    "jastip event",
    "jastip merchandise",
    "titip beli merch",
    "jastip konser",
    "jastip fan meeting",
    "jastip pop up store",
    "jastip exhibition",
    "nitip catip",
    "jasa titip event",
  ],

  openGraph: {
    title: "Nitip Catip - Jasa Titip Event & Merchandise",
    description:
      "Titip beli merchandise event, konser, fan meeting, exhibition, dan pop-up store dengan mudah.",
    url: "https://nitip-catip.vercel.app",
    siteName: "Nitip Catip",
    type: "website",
    locale: "id_ID",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nitip Catip",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
