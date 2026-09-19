import AdminLoginClient from "../../_client/AdminLoginClient.js";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminLoginClient />;
}
