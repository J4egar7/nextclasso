import CategoryClient from "../_client/CategoryClient.js";

export const metadata = {
  title: "Hair Care",
  description: "Shop authentic hair and body care from CLASO, delivered across Pakistan with cash on delivery.",
  alternates: { canonical: "/hair-care" },
};

export default function Page() {
  return (
    <CategoryClient
      pageTag="hair-care"
      eyebrow="Hair Care"
      title="Care for your"
      titleEm="hair and body"
      blurb="Shampoos, treatments and body care from authentic brands."
      categories={["Hair & Body"]}
    />
  );
}
