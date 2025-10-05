import { describe, it, expect } from 'vitest'

describe('Basic Test Setup', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to environment variables', () => {
    expect(import.meta.env.VITE_API_URL).toBe('http://localhost:8000/api/v1')
  })
})
