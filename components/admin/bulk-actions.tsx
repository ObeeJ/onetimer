"use client"

import { useState } from "react"
import { Check, X, Pause, Play, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBulkUserActions, useExportUsers } from "@/hooks/use-admin"
import { toast } from "@/hooks/use-toast"

interface BulkActionsProps {
  selectedIds: string[]
  onActionComplete?: () => void
}

export function BulkActions({ selectedIds, onActionComplete }: BulkActionsProps) {
  const [action, setAction] = useState<string>('')
  const [reason, setReason] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const bulkActions = useBulkUserActions()
  const exportUsers = useExportUsers()
  
  const handleBulkAction = async () => {
    if (!action || selectedIds.length === 0) return
    
    try {
      await bulkActions.mutateAsync({
        userIds: selectedIds,
        action: action as any,
        reason: reason || undefined
      })
      
      toast({
        title: "Success",
        description: `${action} action applied to ${selectedIds.length} users`
      })
      
      setIsDialogOpen(false)
      setReason('')
      onActionComplete?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive"
      })
    }
  }
  
  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      await exportUsers.mutateAsync(format)
      toast({
        title: "Success",
        description: `Users exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive"
      })
    }
  }
  
  const actionRequiresReason = ['reject', 'suspend'].includes(action)
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">
        {selectedIds.length} selected
      </span>
      
      <Select value={action} onValueChange={setAction}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Bulk action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="approve">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Approve
            </div>
          </SelectItem>
          <SelectItem value="reject">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-600" />
              Reject
            </div>
          </SelectItem>
          <SelectItem value="suspend">
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4 text-orange-600" />
              Suspend
            </div>
          </SelectItem>
          <SelectItem value="activate">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-600" />
              Activate
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            disabled={!action || selectedIds.length === 0}
            onClick={() => !actionRequiresReason && handleBulkAction()}
          >
            Apply
          </Button>
        </DialogTrigger>
        {actionRequiresReason && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm {action}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason (required)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Enter reason for ${action}...`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkAction}
                  disabled={!reason.trim()}
                >
                  Confirm {action}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
          <Download className="h-4 w-4 mr-1" />
          CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
          <Download className="h-4 w-4 mr-1" />
          Excel
        </Button>
      </div>
    </div>
  )
}
