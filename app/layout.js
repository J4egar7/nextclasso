import "../src/styles/globals.css";
import { Playfair_Display, DM_Sans, Bebas_Neue, Cormorant_Garamond } from "next/font/google";
import { StoreProvider } from "../src/lib/StoreContext.js";
import Shell from "../src/lib/Shell.js";
import { getPublicProducts } from "../src/lib/serverProducts.js";

// Pages are rebuilt on the server at most once a minute, so the HTML always
// contains a fresh copy of the real catalog. Live changes after that arrive
// through the Supabase realtime subscription in StoreContext.
export const revalidate = 60;

// Self-hosted via next/font at build time — no runtime request to
// fonts.googleapis.com, so fonts always load reliably (previously
// pulled in via a CSS @import, which Next.js doesn't reliably bundle).
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dmsans",
  display: "swap",
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = {
  title: {
    default: "CLASO — Pakistan's Beauty & Makeup Storefront",
    template: "%s — CLASO",
  },
  description: "Shop authentic skincare, makeup and beauty essentials, delivered across Pakistan. Cash on delivery available.",
  metadataBase: new URL("https://nextclasso.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "CLASO — Pakistan's Beauty & Makeup Storefront",
    description: "Shop authentic skincare, makeup and beauty essentials, delivered across Pakistan.",
    type: "website",
    url: "https://nextclasso.vercel.app",
    siteName: "CLASO",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "CLASO — Pakistan's Beauty & Makeup Storefront" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLASO — Pakistan's Beauty & Makeup Storefront",
    description: "Shop authentic skincare, makeup and beauty essentials, delivered across Pakistan.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  applicationName: "CLASO",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/logo192.png" },
  formatDetection: { telephone: false },
};

// Without this, mobile browsers assume a ~980px desktop-width page and
// zoom it to fit — breaking every max-width mobile media query in the
// site (this was the checkout page horizontal-overflow glitch).
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF5E5B",
};

export default async function RootLayout({ children }) {
  const initialProducts = await getPublicProducts();
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "CLASO",
    url: "https://nextclasso.vercel.app",
    description: "Pakistan's online beauty and makeup storefront — authentic skincare, makeup, and beauty essentials with cash-on-delivery.",
    areaServed: "PK",
    paymentAccepted: "Cash on Delivery",
  };

  // Lets Google show a search box for the site and understand the site name.
  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CLASO",
    url: "https://nextclasso.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://nextclasso.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${bebas.variable} ${cormorant.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema).replace(/</g, "\\u003c") }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, "\\u003c") }}
        />
        <StoreProvider initialProducts={initialProducts}>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
