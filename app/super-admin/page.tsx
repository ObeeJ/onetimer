import { redirect } from "next/navigation"

export default function SuperAdminPage() {
  // Redirect to dashboard as the main super-admin page
  redirect("/super-admin/dashboard")
}
