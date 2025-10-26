export function TransactionListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 animate-pulse">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-5 w-3/4 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-1/4 bg-slate-200 rounded-md"></div>
      </div>
      <div className="text-right space-y-2">
        <div className="h-5 w-16 bg-slate-200 rounded-md"></div>
        <div className="h-5 w-20 bg-slate-200 rounded-md ml-auto"></div>
      </div>
    </div>
  )
}
