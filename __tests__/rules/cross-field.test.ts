import { describe, expect, it } from 'vitest'
import {
  matchField,
  greaterThan,
  lessThan,
  afterDate,
  beforeDate,
  requiredIf,
  excludesWith,
} from '../../src/rules/cross-field'

describe('Cross-field Validation Rules', () => {
  describe('matchField', () => {
    it('should validate field matching', () => {
      const validator = matchField('password')

      const result1 = validator('password123', {
        formData: { password: 'password123', confirmPassword: 'password123' },
      })
      expect(result1.valid).toBe(true)

      const result2 = validator('different', {
        formData: { password: 'password123', confirmPassword: 'different' },
      })
      expect(result2.valid).toBe(false)
      expect(result2.code).toBe('FIELD_MISMATCH')
    })

    it('should support custom error message', () => {
      const validator = matchField('password', '两次密码不一致')

      const result = validator('wrong', {
        formData: { password: 'correct' },
      })
      expect(result.valid).toBe(false)
      expect(result.message).toBe('两次密码不一致')
    })

    it('should support nested field paths', () => {
      const validator = matchField('user.email')

      const result = validator('test@example.com', {
        formData: { user: { email: 'test@example.com' } },
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('greaterThan', () => {
    it('should validate greater than comparison', () => {
      const validator = greaterThan('minPrice')

      const result1 = validator(100, {
        formData: { minPrice: 50, maxPrice: 100 },
      })
      expect(result1.valid).toBe(true)

      const result2 = validator(30, {
        formData: { minPrice: 50 },
      })
      expect(result2.valid).toBe(false)
    })

    it('should support allowEqual option', () => {
      const validator = greaterThan('minPrice', { allowEqual: true })

      const result = validator(50, {
        formData: { minPrice: 50 },
      })
      expect(result.valid).toBe(true)
    })

    it('should work with Date objects', () => {
      const validator = greaterThan('startDate')

      const result = validator(new Date('2024-12-31'), {
        formData: { startDate: new Date('2024-01-01') },
      })
      expect(result.valid).toBe(true)
    })

    it('should skip validation if compare value does not exist', () => {
      const validator = greaterThan('nonExistent')

      const result = validator(100)
      expect(result.valid).toBe(true)
    })
  })

  describe('lessThan', () => {
    it('should validate less than comparison', () => {
      const validator = lessThan('maxPrice')

      const result1 = validator(50, {
        formData: { maxPrice: 100 },
      })
      expect(result1.valid).toBe(true)

      const result2 = validator(150, {
        formData: { maxPrice: 100 },
      })
      expect(result2.valid).toBe(false)
    })

    it('should support allowEqual option', () => {
      const validator = lessThan('maxPrice', { allowEqual: true })

      const result = validator(100, {
        formData: { maxPrice: 100 },
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('afterDate', () => {
    it('should validate date after comparison', () => {
      const validator = afterDate('startDate')

      const result1 = validator(new Date('2024-12-31'), {
        formData: { startDate: new Date('2024-01-01') },
      })
      expect(result1.valid).toBe(true)

      const result2 = validator(new Date('2024-01-01'), {
        formData: { startDate: new Date('2024-12-31') },
      })
      expect(result2.valid).toBe(false)
    })

    it('should work with date strings', () => {
      const validator = afterDate('startDate')

      const result = validator('2024-12-31', {
        formData: { startDate: '2024-01-01' },
      })
      expect(result.valid).toBe(true)
    })

    it('should support allowSameDate option', () => {
      const validator = afterDate('startDate', { allowSameDate: true })

      const result = validator(new Date('2024-01-01'), {
        formData: { startDate: new Date('2024-01-01') },
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('beforeDate', () => {
    it('should validate date before comparison', () => {
      const validator = beforeDate('endDate')

      const result1 = validator(new Date('2024-01-01'), {
        formData: { endDate: new Date('2024-12-31') },
      })
      expect(result1.valid).toBe(true)

      const result2 = validator(new Date('2024-12-31'), {
        formData: { endDate: new Date('2024-01-01') },
      })
      expect(result2.valid).toBe(false)
    })
  })

  describe('requiredIf', () => {
    it('should make field required if dependency has value', () => {
      const validator = requiredIf('country')

      const result1 = validator('Beijing', {
        formData: { country: 'China', city: 'Beijing' },
      })
      expect(result1.valid).toBe(true)

      const result2 = validator('', {
        formData: { country: 'China', city: '' },
      })
      expect(result2.valid).toBe(false)
      expect(result2.code).toBe('REQUIRED_IF')
    })

    it('should not require if dependency has no value', () => {
      const validator = requiredIf('country')

      const result = validator('', {
        formData: { country: '', city: '' },
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('excludesWith', () => {
    it('should validate field exclusion', () => {
      const validator = excludesWith('phone')

      const result1 = validator('test@example.com', {
        formData: { email: 'test@example.com', phone: '' },
      })
      expect(result1.valid).toBe(true)

      const result2 = validator('test@example.com', {
        formData: { email: 'test@example.com', phone: '13812345678' },
      })
      expect(result2.valid).toBe(false)
      expect(result2.code).toBe('FIELD_EXCLUDES')
    })

    it('should pass if current field has no value', () => {
      const validator = excludesWith('phone')

      const result = validator('', {
        formData: { email: '', phone: '13812345678' },
      })
      expect(result.valid).toBe(true)
    })
  })
})



