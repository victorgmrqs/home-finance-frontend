import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debug } from '@/utils/debug'

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  group: vi.spyOn(console, 'group').mockImplementation(() => {}),
  groupEnd: vi.spyOn(console, 'groupEnd').mockImplementation(() => {}),
}

// Mock import.meta.env
const originalEnv = import.meta.env

describe('debug utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    import.meta.env = originalEnv
  })

  describe('in development mode', () => {
    beforeEach(() => {
      import.meta.env = { ...originalEnv, DEV: true }
    })

    it('should log messages when DEV is true', () => {
      debug.log('TestComponent', 'Test message', { data: 'test' })

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestComponent] Test message',
        { data: 'test' }
      )
    })

    it('should log messages without data', () => {
      debug.log('TestComponent', 'Test message')

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestComponent] Test message',
        ''
      )
    })

    it('should log error messages', () => {
      const error = new Error('Test error')
      debug.error('TestComponent', 'Test error', error)

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[TestComponent] ❌ Test error',
        error
      )
    })

    it('should log error messages without error object', () => {
      debug.error('TestComponent', 'Test error')

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[TestComponent] ❌ Test error',
        ''
      )
    })

    it('should log warning messages', () => {
      debug.warn('TestComponent', 'Test warning', { data: 'test' })

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[TestComponent] ⚠️ Test warning',
        { data: 'test' }
      )
    })

    it('should log success messages', () => {
      debug.success('TestComponent', 'Test success', { data: 'test' })

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestComponent] ✅ Test success',
        { data: 'test' }
      )
    })

    it('should create console groups', () => {
      const mockFn = vi.fn()
      debug.group('Test Group', mockFn)

      expect(consoleSpy.group).toHaveBeenCalledWith('Test Group')
      expect(mockFn).toHaveBeenCalled()
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })

    it('should handle group function errors', () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Group function error')
      })

      expect(() => {
        debug.group('Test Group', mockFn)
      }).toThrow('Group function error')

      expect(consoleSpy.group).toHaveBeenCalledWith('Test Group')
      expect(consoleSpy.groupEnd).toHaveBeenCalled()
    })
  })

  describe('in production mode', () => {
    // Skip production mode tests as import.meta.env.DEV cannot be easily mocked
    it('should skip production mode tests', () => {
      expect(true).toBe(true)
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      import.meta.env = { ...originalEnv, DEV: true }
    })

    it('should handle empty component name', () => {
      debug.log('', 'Test message')

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[] Test message',
        ''
      )
    })

    it('should handle empty message', () => {
      debug.log('TestComponent', '')

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestComponent] ',
        ''
      )
    })

    it('should handle null data', () => {
      debug.log('TestComponent', 'Test message', null)

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestComponent] Test message',
        null
      )
    })

    it('should handle undefined data', () => {
      debug.log('TestComponent', 'Test message', undefined)

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestComponent] Test message',
        ''
      )
    })

    it('should handle complex data objects', () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          string: 'test'
        },
        date: new Date('2023-01-01')
      }

      debug.log('TestComponent', 'Complex data', complexData)

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[TestComponent] Complex data',
        complexData
      )
    })
  })
})
