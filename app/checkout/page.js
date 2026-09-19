import CheckoutClient from "../_client/CheckoutClient.js";

export const metadata = {
  title: "Checkout",
  description: "Complete your CLASO order — cash on delivery across Pakistan.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CheckoutClient />;
}
