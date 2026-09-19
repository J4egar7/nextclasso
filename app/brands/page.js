import BrandsClient from "../_client/BrandsClient.js";

export const metadata = {
  title: "Shop by Brand",
  description: "Browse authentic beauty and skincare brands available on CLASO, delivered across Pakistan.",
  alternates: { canonical: "/brands" },
};

export default function Page() {
  return <BrandsClient />;
}
