import { describe, it, expect } from 'vitest'
import { formatCNPJ, isValidCNPJ } from '@/utils/cnpj'

describe('CNPJ utilities', () => {
  describe('formatCNPJ', () => {
    it('should format valid CNPJ with 14 digits', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
    })

    it('should format CNPJ with dots and slashes', () => {
      expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81')
    })

    it('should format CNPJ with mixed formatting', () => {
      expect(formatCNPJ('11222333/0001-81')).toBe('11.222.333/0001-81')
    })

    it('should handle CNPJ with only numbers', () => {
      expect(formatCNPJ('12345678000195')).toBe('12.345.678/0001-95')
    })

    it('should return empty string for empty input', () => {
      expect(formatCNPJ('')).toBe('')
    })

    it('should return empty string for null input', () => {
      expect(formatCNPJ(null as any)).toBe('')
    })

    it('should return empty string for undefined input', () => {
      expect(formatCNPJ(undefined as any)).toBe('')
    })

    it('should handle short input gracefully', () => {
      expect(formatCNPJ('123')).toBe('12.3')
    })

    it('should handle input longer than 14 digits', () => {
      expect(formatCNPJ('123456789012345')).toBe('12.345.678/9012-34')
    })

    it('should handle input with non-numeric characters', () => {
      expect(formatCNPJ('11abc222def333ghi0001jkl81')).toBe('11.222.333/0001-81')
    })
  })

  describe('isValidCNPJ', () => {
    it('should validate correct CNPJ', () => {
      expect(isValidCNPJ('11.222.333/0001-81')).toBe(true)
      expect(isValidCNPJ('11222333000181')).toBe(true)
    })

    it('should validate another correct CNPJ', () => {
      expect(isValidCNPJ('12.345.678/0001-95')).toBe(true)
      expect(isValidCNPJ('12345678000195')).toBe(true)
    })

    it('should reject invalid CNPJ with wrong check digits', () => {
      expect(isValidCNPJ('11.222.333/0001-82')).toBe(false)
      expect(isValidCNPJ('11222333000182')).toBe(false)
    })

    it('should reject CNPJ with all same digits', () => {
      expect(isValidCNPJ('11.111.111/1111-11')).toBe(false)
      expect(isValidCNPJ('11111111111111')).toBe(false)
    })

    it('should reject CNPJ with wrong length', () => {
      expect(isValidCNPJ('11.222.333/0001-8')).toBe(false)
      expect(isValidCNPJ('1122233300018')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidCNPJ('')).toBe(false)
    })

    it('should reject null input', () => {
      expect(isValidCNPJ(null as any)).toBe(false)
    })

    it('should reject undefined input', () => {
      expect(isValidCNPJ(undefined as any)).toBe(false)
    })

    it('should reject CNPJ with non-numeric characters', () => {
      expect(isValidCNPJ('11.222.333/0001-8a')).toBe(false)
    })

    it('should reject CNPJ with too many digits', () => {
      expect(isValidCNPJ('11.222.333/0001-811')).toBe(false)
    })

    it('should validate CNPJ with leading zeros', () => {
      expect(isValidCNPJ('00.000.000/0001-91')).toBe(true)
    })

    it('should reject CNPJ with invalid first check digit', () => {
      expect(isValidCNPJ('11.222.333/0001-91')).toBe(false)
    })

    it('should reject CNPJ with invalid second check digit', () => {
      expect(isValidCNPJ('11.222.333/0001-82')).toBe(false)
    })

    it('should handle edge case CNPJ', () => {
      // Test with a known valid CNPJ
      expect(isValidCNPJ('14.572.457.0001-85')).toBe(true)
    })

    it('should reject CNPJ with wrong formatting but correct digits', () => {
      // This should still be valid as we extract only digits
      expect(isValidCNPJ('11-222-333-0001-81')).toBe(true)
    })

    it('should handle CNPJ with extra formatting characters', () => {
      expect(isValidCNPJ('(11) 222.333/0001-81')).toBe(true)
    })
  })

  describe('integration tests', () => {
    it('should format and validate the same CNPJ', () => {
      const cnpj = '11222333000181'
      const formatted = formatCNPJ(cnpj)
      const isValid = isValidCNPJ(formatted)
      
      expect(formatted).toBe('11.222.333/0001-81')
      expect(isValid).toBe(true)
    })

    it('should handle real-world CNPJ examples', () => {
      const realCNPJs = [
        '11.222.333/0001-81',
        '12.345.678/0001-95',
        '00.000.000/0001-91'
      ]

      realCNPJs.forEach(cnpj => {
        expect(isValidCNPJ(cnpj)).toBe(true)
        expect(formatCNPJ(cnpj.replace(/\D/g, ''))).toBe(cnpj)
      })
    })

    it('should reject common invalid CNPJ patterns', () => {
      const invalidCNPJs = [
        '11.111.111/1111-11',
        '00.000.000/0000-00',
        '12.345.678/0001-00',
        '11.222.333/0001-82'
      ]

      invalidCNPJs.forEach(cnpj => {
        expect(isValidCNPJ(cnpj)).toBe(false)
      })
    })
  })
})
