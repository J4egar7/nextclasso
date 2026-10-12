import SearchClient from "../_client/SearchClient.js";

export const metadata = {
  title: "Search",
  description: "Search CLASO's skincare, makeup, fragrance and hair care products.",
  // Search results are not useful pages for Google to list.
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default function Page() {
  return <SearchClient />;
}
