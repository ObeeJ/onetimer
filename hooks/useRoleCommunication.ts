"use client"

import { useApi } from './use-api'
import { toast } from 'sonner'

export interface AdminData {
  id: string
  email: string
  [key: string]: unknown
}

export interface RoleAction {
  id: string
  type: 'approval' | 'rejection' | 'suspension' | 'creation'
  source: 'admin' | 'super_admin'
  target: 'user' | 'survey' | 'withdrawal'
  targetId: string
  reason?: string
  timestamp: Date
}

export function useRoleCommunication() {
  const api = useApi()

  const logRoleAction = async (action: Omit<RoleAction, 'id' | 'timestamp'>) => {
    try {
      await api.post('/super-admin/audit-logs', action)
    } catch (error) {
      console.error('Failed to log role action', error)
      toast.error('Failed to log action')
    }
  }

  const approveCreator = async (creatorId: string, reason?: string) => {
    try {
      const result = await api.post(`/admin/users/${creatorId}/approve`, {})
      toast.success('Creator account has been approved successfully')
      await logRoleAction({
        type: 'approval',
        source: 'admin',
        target: 'user',
        targetId: creatorId,
        reason,
      })
      return { ok: true, data: result }
    } catch (error) {
      return { ok: false, error: (error as Error).message }
    }
  }

  const approveFillerKYC = async (fillerId: string) => {
    try {
      const result = await api.post(`/admin/users/${fillerId}/approve`, {})
      toast.success('Filler KYC has been verified and approved')
      await logRoleAction({
        type: 'approval',
        source: 'admin',
        target: 'user',
        targetId: fillerId,
      })
      return { ok: true, data: result }
    } catch (error) {
      return { ok: false, error: (error as Error).message }
    }
  }

  const rejectUser = async (userId: string, reason: string) => {
    try {
      const result = await api.post(`/admin/users/${userId}/reject`, { reason })
      toast.error(`User has been rejected: ${reason}`)
      await logRoleAction({
        type: 'rejection',
        source: 'admin',
        target: 'user',
        targetId: userId,
        reason,
      })
      return { ok: true, data: result }
    } catch (error) {
      return { ok: false, error: (error as Error).message }
    }
  }

  const approveSurvey = async (surveyId: string) => {
    try {
      const result = await api.post(`/admin/surveys/${surveyId}/approve`, {})
      toast.success('Survey has been approved and is now live')
      await logRoleAction({
        type: 'approval',
        source: 'admin',
        target: 'survey',
        targetId: surveyId,
      })
      return { ok: true, data: result }
    } catch (error) {
      return { ok: false, error: (error as Error).message }
    }
  }

  const createAdmin = async (adminData: AdminData) => {
    try {
      const result = await api.post('/super-admin/admins', adminData)
      toast.success(`New admin account created for ${adminData.email}`)
      await logRoleAction({
        type: 'creation',
        source: 'super_admin',
        target: 'user',
        targetId: adminData.id || 'unknown',
      })
      return { ok: true, data: result }
    } catch (error) {
      return { ok: false, error: (error as Error).message }
    }
  }

  const suspendAdmin = async (adminId: string, reason: string) => {
    try {
      const result = await api.post(`/super-admin/admins/${adminId}/suspend`, { reason })
      toast.error(`Admin has been suspended: ${reason}`)
      await logRoleAction({
        type: 'suspension',
        source: 'super_admin',
        target: 'user',
        targetId: adminId,
        reason,
      })
      return { ok: true, data: result }
    } catch (error) {
      return { ok: false, error: (error as Error).message }
    }
  }
  
  const canUserPerformAction = (
    userRole: string,
    action: string,
    targetRole?: string
  ): boolean => {
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

  return {
    approveCreator,
    approveFillerKYC,
    rejectUser,
    approveSurvey,
    createAdmin,
    suspendAdmin,
    canUserPerformAction,
  }
}
