export interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  pending_earnings: number
  referral_code: string
  referrals: Referral[]
}

export interface Referral {
  id: string
  name: string
  email?: string
  status: 'active' | 'pending' | 'inactive'
  earnings: number
  join_date: string
  first_survey_completed?: boolean
}