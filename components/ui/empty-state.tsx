import { LucideIcon } from "lucide-react"
import { Button } from "./button"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-slate-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm">{description}</p>
      {action && (
        <Button asChild className="bg-[#013F5C] hover:bg-[#0b577a]">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}