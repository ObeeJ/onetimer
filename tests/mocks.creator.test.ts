import { describe, it, expect } from 'vitest'
import * as mocks from '@/mocks/api'

describe('creator mocks', () => {
  it('creates and lists surveys', async () => {
    const res = await mocks.creatorSurveys('POST', { title: 'T1', status: 'draft' })
    expect(res.ok).toBe(true)
    const list = await mocks.creatorSurveys()
    expect(Array.isArray(list)).toBeTruthy()
  })

  it('returns responses and CSV', async () => {
    const resp = await mocks.creatorSurveyResponses('100')
    expect(Array.isArray(resp)).toBe(true)
    const csv = await mocks.creatorSurveyExport('100')
    expect(typeof csv).toBe('string')
  })
})
