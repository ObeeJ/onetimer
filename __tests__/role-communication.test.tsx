import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoleCommunicationManager from '@/lib/role-communication'
import { apiClient } from '@/lib/api-client'

// Mock the API client
jest.mock('@/lib/api-client')
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}))

describe('Role Communication System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Role Hierarchy Validation', () => {
    test('super admin can perform all actions', () => {
      expect(RoleCommunicationManager.canUserPerformAction('super_admin', 'create_admin')).toBe(true)
      expect(RoleCommunicationManager.canUserPerformAction('super_admin', 'suspend_admin')).toBe(true)
      expect(RoleCommunicationManager.canUserPerformAction('super_admin', 'approve_user')).toBe(true)
    })

    test('admin can approve users but not create admins', () => {
      expect(RoleCommunicationManager.canUserPerformAction('admin', 'approve_user')).toBe(true)
      expect(RoleCommunicationManager.canUserPerformAction('admin', 'approve_survey')).toBe(true)
      expect(RoleCommunicationManager.canUserPerformAction('admin', 'create_admin')).toBe(false)
      expect(RoleCommunicationManager.canUserPerformAction('admin', 'suspend_admin')).toBe(false)
    })

    test('creator can only create surveys', () => {
      expect(RoleCommunicationManager.canUserPerformAction('creator', 'create_survey')).toBe(true)
      expect(RoleCommunicationManager.canUserPerformAction('creator', 'approve_user')).toBe(false)
      expect(RoleCommunicationManager.canUserPerformAction('creator', 'approve_survey')).toBe(false)
    })

    test('filler can only take surveys', () => {
      expect(RoleCommunicationManager.canUserPerformAction('filler', 'take_survey')).toBe(true)
      expect(RoleCommunicationManager.canUserPerformAction('filler', 'create_survey')).toBe(false)
      expect(RoleCommunicationManager.canUserPerformAction('filler', 'approve_user')).toBe(false)
    })

    test('admin cannot affect super admin', () => {
      expect(RoleCommunicationManager.canUserPerformAction('admin', 'suspend_user', 'super_admin')).toBe(false)
      expect(RoleCommunicationManager.canUserPerformAction('admin', 'approve_user', 'creator')).toBe(true)
    })
  })

  describe('Admin Actions', () => {
    test('approveCreator calls API and shows success toast', async () => {
      mockApiClient.approveUser.mockResolvedValue({ ok: true, data: { id: 'creator-123' } })

      const result = await RoleCommunicationManager.approveCreator('creator-123', 'KYC verified')

      expect(mockApiClient.approveUser).toHaveBeenCalledWith('creator-123')
      expect(result.ok).toBe(true)
      
      // Check if action was logged
      const actions = RoleCommunicationManager.getRoleActions()
      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe('approval')
      expect(actions[0].targetId).toBe('creator-123')
    })

    test('approveFillerKYC handles API success', async () => {
      mockApiClient.approveUser.mockResolvedValue({ ok: true, data: { id: 'filler-456' } })

      const result = await RoleCommunicationManager.approveFillerKYC('filler-456')

      expect(mockApiClient.approveUser).toHaveBeenCalledWith('filler-456')
      expect(result.ok).toBe(true)
    })

    test('rejectUser calls API with reason', async () => {
      mockApiClient.rejectUser.mockResolvedValue({ ok: true, data: {} })

      const result = await RoleCommunicationManager.rejectUser('user-789', 'Invalid documents')

      expect(mockApiClient.rejectUser).toHaveBeenCalledWith('user-789', 'Invalid documents')
      expect(result.ok).toBe(true)
      
      const actions = RoleCommunicationManager.getRoleActions()
      expect(actions[0].type).toBe('rejection')
      expect(actions[0].reason).toBe('Invalid documents')
    })

    test('approveSurvey updates survey status', async () => {
      mockApiClient.approveSurvey.mockResolvedValue({ ok: true, data: { id: 'survey-123' } })

      const result = await RoleCommunicationManager.approveSurvey('survey-123')

      expect(mockApiClient.approveSurvey).toHaveBeenCalledWith('survey-123')
      expect(result.ok).toBe(true)
    })
  })

  describe('Super Admin Actions', () => {
    test('createAdmin creates new admin account', async () => {
      const adminData = {
        email: 'newadmin@test.com',
        name: 'New Admin',
        password: 'password123'
      }
      
      mockApiClient.createAdmin.mockResolvedValue({ 
        ok: true, 
        data: { id: 'admin-new', ...adminData } 
      })

      const result = await RoleCommunicationManager.createAdmin(adminData)

      expect(mockApiClient.createAdmin).toHaveBeenCalledWith(adminData)
      expect(result.ok).toBe(true)
      
      const actions = RoleCommunicationManager.getRoleActions()
      expect(actions[0].type).toBe('creation')
      expect(actions[0].source).toBe('super_admin')
    })
  })

  describe('Workflow Status Tracking', () => {
    test('trackWorkflowStatus saves status to localStorage', () => {
      RoleCommunicationManager.trackWorkflowStatus('survey', 'survey-123', 'approved')

      const status = RoleCommunicationManager.getWorkflowStatus('survey', 'survey-123')
      expect(status.status).toBe('approved')
      expect(status.lastUpdated).toBeDefined()
    })

    test('getWorkflowStatus returns undefined for non-existent workflow', () => {
      const status = RoleCommunicationManager.getWorkflowStatus('survey', 'non-existent')
      expect(status).toBeUndefined()
    })
  })

  describe('Action Logging', () => {
    test('role actions are stored and retrieved correctly', () => {
      // Clear any existing actions
      RoleCommunicationManager.clearRoleActions()

      // Perform an action that logs
      mockApiClient.approveUser.mockResolvedValue({ ok: true, data: {} })
      RoleCommunicationManager.approveCreator('test-creator')

      const actions = RoleCommunicationManager.getRoleActions()
      expect(actions).toHaveLength(1)
      expect(actions[0].source).toBe('admin')
      expect(actions[0].target).toBe('user')
    })

    test('clearRoleActions removes all stored actions', () => {
      // Add some actions first
      mockApiClient.approveUser.mockResolvedValue({ ok: true, data: {} })
      RoleCommunicationManager.approveCreator('test-creator')

      expect(RoleCommunicationManager.getRoleActions()).toHaveLength(1)

      RoleCommunicationManager.clearRoleActions()
      expect(RoleCommunicationManager.getRoleActions()).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      mockApiClient.approveUser.mockResolvedValue({ 
        ok: false, 
        error: 'User not found' 
      })

      const result = await RoleCommunicationManager.approveCreator('invalid-user')

      expect(result.ok).toBe(false)
      expect(result.error).toBe('User not found')
    })
  })
})