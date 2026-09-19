import AboutClient from "../_client/AboutClient.js";

export const metadata = {
  title: "About Us",
  description: "Learn about CLASO — Pakistan's online destination for authentic skincare and makeup, delivered nationwide with cash on delivery.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutClient />;
}
