import OrdersClient from "../_client/OrdersClient.js";

export const metadata = {
  title: "Your Orders",
  description: "View your recent CLASO orders and delivery status.",
  alternates: { canonical: "/orders" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrdersClient />;
}
