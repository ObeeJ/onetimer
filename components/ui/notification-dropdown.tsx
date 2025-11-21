"use client"

import { Bell } from "lucide-react"
import { Button } from "./button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu"
import { Badge } from "./badge"
import { useNotifications, useMarkNotificationRead } from "@/hooks/use-notifications"

export function NotificationDropdown() {
  const { data: notifications, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  
  const unreadCount = notifications?.notifications?.filter(n => !n.read).length || 0
  
  const handleMarkAllRead = () => {
    const unreadIds = notifications?.notifications
      ?.filter(n => !n.read)
      ?.map(n => n.id) || []
    
    if (unreadIds.length > 0) {
      markRead.mutate(unreadIds)
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications?.notifications?.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications?.notifications?.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                  <span className="font-medium text-sm">{notification.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
