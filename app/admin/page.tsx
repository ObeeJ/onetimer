import { redirect } from "next/navigation"

export default function AdminPage() {
  // Redirect to dashboard as the main admin page
  redirect("/admin/dashboard")
}
