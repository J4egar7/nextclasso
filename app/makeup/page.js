import MakeupClient from "../_client/MakeupClient.js";

export const metadata = {
  title: "Makeup",
  description: "Shop authentic makeup — foundation, lips, eyes and more — delivered across Pakistan with cash on delivery.",
  alternates: { canonical: "/makeup" },
};

export default function Page() {
  return <MakeupClient />;
}
