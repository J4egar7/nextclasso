import HomeClient from "./_client/HomeClient.js";

export const metadata = {
  title: "CLASO — Pakistan's Beauty & Makeup Storefront",
  description: "Shop authentic skincare, makeup and beauty essentials, delivered across Pakistan. Cash on delivery available.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeClient />;
}
