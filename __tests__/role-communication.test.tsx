import { renderHook, act } from '@testing-library/react'
import { useRoleCommunication } from '@/hooks/useRoleCommunication'
import { useApi } from '@/hooks/use-api'
import { toast } from 'sonner'

// Mock the useApi hook
jest.mock('@/hooks/use-api')
const mockUseApi = useApi as jest.Mock

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('useRoleCommunication Hook', () => {
  const mockApi = {
    post: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseApi.mockReturnValue(mockApi)
  })

  describe('Role Hierarchy Validation', () => {
    test('super admin can perform all actions', () => {
      const { result } = renderHook(() => useRoleCommunication())
      expect(result.current.canUserPerformAction('super_admin', 'create_admin')).toBe(true)
      expect(result.current.canUserPerformAction('super_admin', 'suspend_admin')).toBe(true)
      expect(result.current.canUserPerformAction('super_admin', 'approve_user')).toBe(true)
    })

    test('admin can approve users but not create admins', () => {
      const { result } = renderHook(() => useRoleCommunication())
      expect(result.current.canUserPerformAction('admin', 'approve_user')).toBe(true)
      expect(result.current.canUserPerformAction('admin', 'approve_survey')).toBe(true)
      expect(result.current.canUserPerformAction('admin', 'create_admin')).toBe(false)
      expect(result.current.canUserPerformAction('admin', 'suspend_admin')).toBe(false)
    })
  })

  describe('Admin Actions', () => {
    test('approveCreator calls API, logs action, and shows success toast', async () => {
      mockApi.post.mockResolvedValueOnce({ id: 'creator-123' }) // For approval
      mockApi.post.mockResolvedValueOnce({}) // For logging

      const { result } = renderHook(() => useRoleCommunication())
      
      let res
      await act(async () => {
        res = await result.current.approveCreator('creator-123', 'KYC verified')
      })

      expect(mockApi.post).toHaveBeenCalledWith('/v1/admin/users/creator-123/approve', {})
      expect(mockApi.post).toHaveBeenCalledWith('/v1/audit/actions', expect.objectContaining({
        type: 'approval',
        targetId: 'creator-123',
        reason: 'KYC verified',
      }))
      expect(toast.success).toHaveBeenCalledWith('Creator account has been approved successfully')
      expect(res).toEqual({ ok: true, data: { id: 'creator-123' } })
    })

    test('approveFillerKYC calls API and logs action', async () => {
        mockApi.post.mockResolvedValueOnce({ id: 'filler-456' }) // For approval
        mockApi.post.mockResolvedValueOnce({}) // For logging
  
        const { result } = renderHook(() => useRoleCommunication())
        
        let res
        await act(async () => {
          res = await result.current.approveFillerKYC('filler-456')
        })
  
        expect(mockApi.post).toHaveBeenCalledWith('/v1/admin/users/filler-456/approve', {})
        expect(mockApi.post).toHaveBeenCalledWith('/v1/audit/actions', expect.objectContaining({
            type: 'approval',
            targetId: 'filler-456',
          }))
        expect(toast.success).toHaveBeenCalledWith('Filler KYC has been verified and approved')
        expect(res).toEqual({ ok: true, data: { id: 'filler-456' } })
      })
  })

  describe('Super Admin Actions', () => {
    test('createAdmin creates new admin, logs action, and shows success toast', async () => {
        const adminData = { id: 'admin-new', email: 'newadmin@test.com', name: 'New Admin' }
        mockApi.post.mockResolvedValueOnce(adminData) // For creation
        mockApi.post.mockResolvedValueOnce({}) // For logging

        const { result } = renderHook(() => useRoleCommunication())

        let res: any;
        await act(async () => {
            res = await result.current.createAdmin(adminData)
        })

        expect(mockApi.post).toHaveBeenCalledWith('/v1/super-admin/admins', adminData)
        expect(mockApi.post).toHaveBeenCalledWith('/v1/audit/actions', expect.objectContaining({
            type: 'creation',
            targetId: 'admin-new',
        }))
        expect(toast.success).toHaveBeenCalledWith('New admin account created for newadmin@test.com')
        expect(res?.ok).toBe(true)
    })
  })

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
        const error = new Error('User not found')
        mockApi.post.mockRejectedValue(error)

        const { result } = renderHook(() => useRoleCommunication())
        
        let res
        await act(async () => {
            res = await result.current.approveCreator('invalid-user')
        })

        expect(toast.error).not.toHaveBeenCalled() // The hook returns the error, the component would show the toast.
        expect(res).toEqual({ ok: false, error: 'User not found' })
    })
  })
})