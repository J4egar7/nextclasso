import SkincareClient from "../_client/SkincareClient.js";

export const metadata = {
  title: "Skincare",
  description: "Shop authentic skincare — cleansers, serums, moisturizers and more — delivered across Pakistan with cash on delivery.",
  alternates: { canonical: "/skincare" },
};

export default function Page() {
  return <SkincareClient />;
}
