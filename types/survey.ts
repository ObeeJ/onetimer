export type Survey = {
  id: string
  title: string
  description: string
  category: string
  estimatedTime: number
  reward?: number
  eligible?: boolean
}
