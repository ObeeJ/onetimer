"use client"

import { useQuery } from '@tanstack/react-query'
import { api } from './use-api'
import type { ReferralStats } from '@/types/referral'

export function useReferrals() {
  return useQuery<ReferralStats>({
    queryKey: ['referrals'],
    queryFn: () => api.get('/api/referral/stats'),
  })
}
