import { describe, it, expect } from 'vitest'
import { useDashboardData } from '@/hooks/useDashboardData'

describe('useDashboardData', () => {
  it('should be a function', () => {
    expect(typeof useDashboardData).toBe('function')
  })
})
