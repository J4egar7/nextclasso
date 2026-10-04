import ReturnsClient from "../_client/ReturnsClient.js";

export const metadata = {
  title: "Returns & Refunds",
  description: "How returns and refunds work at CLASO: what we accept, what we can't, and how to get in touch.",
  alternates: { canonical: "/returns" },
};

export default function Page() {
  return <ReturnsClient />;
}
