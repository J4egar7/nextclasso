import FaqClient from "../_client/FaqClient.js";

export const metadata = {
  title: "FAQ",
  description: "Answers to common questions about shopping with CLASO: payment, orders, authenticity, patch testing and returns.",
  alternates: { canonical: "/faq" },
};

export default function Page() {
  return <FaqClient />;
}
