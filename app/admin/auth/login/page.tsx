import { redirect } from 'next/navigation'

export default function AdminAuthLoginPage() {
  // Redirect to unified auth system
  redirect('/auth/login')
}