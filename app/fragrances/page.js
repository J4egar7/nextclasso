import CategoryClient from "../_client/CategoryClient.js";

export const metadata = {
  title: "Fragrances",
  description: "Shop authentic fragrances from CLASO, delivered across Pakistan with cash on delivery.",
  alternates: { canonical: "/fragrances" },
};

export default function Page() {
  return (
    <CategoryClient
      pageTag="fragrances"
      eyebrow="Fragrances"
      title="Find your"
      titleEm="signature scent"
      blurb="Authentic perfumes and body mists from brands we trust."
      categories={["Fragrance"]}
    />
  );
}
