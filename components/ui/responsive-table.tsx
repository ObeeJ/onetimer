"use client"

import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Column {
  key: string
  label: string
  className?: string
  mobileLabel?: string
}

interface ResponsiveTableProps {
  columns: Column[]
  data: Record<string, any>[]
  renderCell: (_item: Record<string, any>, _column: Column) => ReactNode
  className?: string
}

export function ResponsiveTable({ columns, data, renderCell, className }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn("py-3 px-4 font-medium text-slate-600", column.className)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className={cn("py-4 px-4", column.className)}>
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item, index) => (
          <Card key={index} className="rounded-lg">
            <CardContent className="p-4 space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-600 min-w-0 flex-1">
                    {column.mobileLabel || column.label}:
                  </span>
                  <div className="ml-2 text-right">
                    {renderCell(item, column)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}