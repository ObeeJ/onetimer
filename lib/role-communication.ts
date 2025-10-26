import { apiClient } from './api-client'
import { toast } from '@/hooks/use-toast'

export interface RoleAction {
  id: string
  type: 'approval' | 'rejection' | 'suspension' | 'creation'
  source: 'admin' | 'super_admin'
  target: 'user' | 'survey' | 'withdrawal'
  targetId: string
  reason?: string
  timestamp: Date
}

export class RoleCommunicationManager {
  // Admin Actions on Users
  static async approveCreator(creatorId: string, reason?: string) {
    const result = await apiClient.approveUser(creatorId)
    if (result.ok) {
      toast({
        title: 'Creator Approved',
        description: 'Creator account has been approved successfully',
      })
      this.logRoleAction({
        id: Date.now().toString(),
        type: 'approval',
        source: 'admin',
        target: 'user',
        targetId: creatorId,
        reason,
        timestamp: new Date(),
      })
    }
    return result
  }

  static async approveFillerKYC(fillerId: string) {
    const result = await apiClient.approveUser(fillerId)
    if (result.ok) {
      toast({
        title: 'KYC Approved',
        description: 'Filler KYC has been verified and approved',
      })
      this.logRoleAction({
        id: Date.now().toString(),
        type: 'approval',
        source: 'admin',
        target: 'user',
        targetId: fillerId,
        timestamp: new Date(),
      })
    }
    return result
  }

  static async rejectUser(userId: string, reason: string) {
    const result = await apiClient.rejectUser(userId, reason)
    if (result.ok) {
      toast({
        title: 'User Rejected',
        description: `User has been rejected: ${reason}`,
        variant: 'destructive',
      })
      this.logRoleAction({
        id: Date.now().toString(),
        type: 'rejection',
        source: 'admin',
        target: 'user',
        targetId: userId,
        reason,
        timestamp: new Date(),
      })
    }
    return result
  }

  // Admin Actions on Surveys
  static async approveSurvey(surveyId: string) {
    const result = await apiClient.approveSurvey(surveyId)
    if (result.ok) {
      toast({
        title: 'Survey Approved',
        description: 'Survey has been approved and is now live',
      })
      this.logRoleAction({
        id: Date.now().toString(),
        type: 'approval',
        source: 'admin',
        target: 'survey',
        targetId: surveyId,
        timestamp: new Date(),
      })
    }
    return result
  }

  // Super Admin Actions
  static async createAdmin(adminData: any) {
    const result = await apiClient.createAdmin(adminData)
    if (result.ok) {
      toast({
        title: 'Admin Created',
        description: `New admin account created for ${adminData.email}`,
      })
      this.logRoleAction({
        id: Date.now().toString(),
        type: 'creation',
        source: 'super_admin',
        target: 'user',
        targetId: result.data?.id || 'unknown',
        timestamp: new Date(),
      })
    }
    return result
  }

  static async suspendAdmin(adminId: string, reason: string) {
    // This would need to be implemented in the API
    const result = await apiClient.request(`/super-admin/admins/${adminId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
    
    if (result.ok) {
      toast({
        title: 'Admin Suspended',
        description: `Admin has been suspended: ${reason}`,
        variant: 'destructive',
      })
      this.logRoleAction({
        id: Date.now().toString(),
        type: 'suspension',
        source: 'super_admin',
        target: 'user',
        targetId: adminId,
        reason,
        timestamp: new Date(),
      })
    }
    return result
  }

  // Communication Helpers
  static async sendNotificationToRole(
    role: 'admin' | 'creator' | 'filler' | 'super_admin',
    message: string,
    type: 'info' | 'warning' | 'success' | 'error' = 'info'
  ) {
    // This would send notifications to all users of a specific role
    return apiClient.request('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ role, message, type }),
    })
  }

  static async getNotificationsForUser() {
    return apiClient.getNotifications()
  }

  // Role Hierarchy Validation
  static canUserPerformAction(
    userRole: string,
    action: string,
    targetRole?: string
  ): boolean {
    const hierarchy = {
      super_admin: 4,
      admin: 3,
      creator: 2,
      filler: 1,
    }

    const userLevel = hierarchy[userRole as keyof typeof hierarchy] || 0
    const targetLevel = targetRole ? hierarchy[targetRole as keyof typeof hierarchy] || 0 : 0

    switch (action) {
      case 'approve_user':
      case 'reject_user':
      case 'suspend_user':
        return userLevel >= 3 && userLevel > targetLevel // Admin or above
      case 'approve_survey':
      case 'reject_survey':
        return userLevel >= 3 // Admin or above
      case 'create_admin':
      case 'suspend_admin':
        return userLevel >= 4 // Super admin only
      case 'create_survey':
        return userLevel >= 2 // Creator or above
      case 'take_survey':
        return userLevel >= 1 // Filler or above
      default:
        return false
    }
  }

  // Workflow Status Tracking
  static async trackWorkflowStatus(
    entityType: 'survey' | 'user' | 'withdrawal',
    entityId: string,
    status: string
  ) {
    const workflows = this.getWorkflows()
    const key = `${entityType}_${entityId}`
    
    workflows[key] = {
      ...workflows[key],
      status,
      lastUpdated: new Date().toISOString(),
    }
    
    localStorage.setItem('role_workflows', JSON.stringify(workflows))
  }

  static getWorkflowStatus(entityType: string, entityId: string) {
    const workflows = this.getWorkflows()
    return workflows[`${entityType}_${entityId}`]
  }

  private static getWorkflows() {
    if (typeof window === 'undefined') return {}
    const stored = localStorage.getItem('role_workflows')
    return stored ? JSON.parse(stored) : {}
  }

  // Action Logging
  private static logRoleAction(action: RoleAction) {
    if (typeof window === 'undefined') return
    
    const actions = this.getRoleActions()
    actions.unshift(action)
    
    // Keep only last 100 actions
    if (actions.length > 100) {
      actions.splice(100)
    }
    
    localStorage.setItem('role_actions', JSON.stringify(actions))
  }

  static getRoleActions(): RoleAction[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('role_actions')
    return stored ? JSON.parse(stored) : []
  }

  static clearRoleActions() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('role_actions')
    }
  }

  // Real-time Communication Setup
  static setupRealTimeUpdates(userId: string, role: string) {
    // This would set up WebSocket or Server-Sent Events for real-time updates
    if (typeof window === 'undefined') return

    const eventSource = new EventSource(`/api/notifications/stream?user_id=${userId}`)
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      })
    }

    eventSource.onerror = () => {
      console.error('Real-time connection lost')
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        this.setupRealTimeUpdates(userId, role)
      }, 5000)
    }

    return eventSource
  }
}

export default RoleCommunicationManager