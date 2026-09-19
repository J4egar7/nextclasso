import AdminClient from "../_client/AdminClient.js";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminClient />;
}
