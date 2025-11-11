"use client"

import { useQuery } from '@tanstack/react-query'
import { api } from './use-api'
import { createQueryOptions } from '@/lib/react-query-config'
import type { ReferralStats } from '@/types/referral'

export function useReferrals() {
  return useQuery(
    createQueryOptions({
      queryKey: ['referrals'],
      queryFn: () => api.get<ReferralStats>('/referral/stats'),
    })
  )
}
