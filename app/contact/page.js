import ContactClient from "../_client/ContactClient.js";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with CLASO about orders, products and returns.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactClient />;
}
