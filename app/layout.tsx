import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import CarritoFlotante from "./carrito-flotante";

const anton = Anton({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pizzasmicios.vercel.app"),
  title: {
    default: "Micio's Pizzería | Pizza a la piedra en San Jorge",
    template: "%s | Micio's Pizzería",
  },
  description:
    "Micio's Pizzería — pizza a la piedra artesanal en San Jorge, Santa Fe. Pedís online, retirás y pagás en el local. Abierto jueves a domingo de 20 a 23 hs.",
  keywords: [
    "pizzería San Jorge",
    "pizza a la piedra",
    "pizza San Jorge Santa Fe",
    "Micio's pizzería",
    "pizzas artesanales",
    "take away pizza",
  ],
  openGraph: {
    title: "Micio's Pizzería | Pizza a la piedra en San Jorge",
    description:
      "Pizza a la piedra artesanal en San Jorge, Santa Fe. Pedís online, retirás en el local.",
    url: "https://pizzasmicios.vercel.app",
    siteName: "Micio's Pizzería",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/hero-poster.jpg",
        width: 1200,
        height: 630,
        alt: "Micio's Pizzería — pizza a la piedra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Micio's Pizzería | Pizza a la piedra en San Jorge",
    description:
      "Pizza a la piedra artesanal en San Jorge, Santa Fe. Pedís online, retirás en el local.",
    images: ["/hero-poster.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${anton.variable} ${inter.variable} antialiased`}>
        {children}
        <CarritoFlotante />
      </body>
    </html>
  );
}