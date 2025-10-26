export interface Earnings {
  total: number
  available: number
  pending: number
  withdrawn: number
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  type: 'earning' | 'withdrawal' | 'referral'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
  description: string
  survey_id?: string
  referral_id?: string
}

export interface WithdrawalRequest {
  amount: number
  bank_code: string
  account_number: string
  account_name: string
}