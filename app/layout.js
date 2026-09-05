import "../src/styles/globals.css";
import { StoreProvider } from "../src/lib/StoreContext.js";
import Shell from "../src/lib/Shell.js";

export const metadata = {
  title: "CLASO — Pakistan's Beauty & Makeup Storefront",
  description: "Shop authentic skincare, makeup and beauty essentials, delivered across Pakistan. Cash on delivery available.",
  metadataBase: new URL("https://classo-topaz.vercel.app"),
  openGraph: {
    title: "CLASO — Pakistan's Beauty & Makeup Storefront",
    description: "Shop authentic skincare, makeup and beauty essentials, delivered across Pakistan.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
