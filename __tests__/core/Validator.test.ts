import { describe, expect, it } from 'vitest'
import { createValidator } from '../../src/core/Validator'
import * as rules from '../../src/rules'

describe('Validator', () => {
  describe('basic validation', () => {
    it('should validate with single rule', async () => {
      const validator = createValidator<string>()
        .rule({ validator: rules.required })

      const result = await validator.validate('hello')
      expect(result.valid).toBe(true)

      const result2 = await validator.validate('')
      expect(result2.valid).toBe(false)
    })

    it('should validate with multiple rules', async () => {
      const validator = createValidator<string>()
        .rule({ validator: rules.required })
        .rule({ validator: rules.minLength(3) })
        .rule({ validator: rules.email })

      const result = await validator.validate('user@example.com')
      expect(result.valid).toBe(true)

      const result2 = await validator.validate('ab')
      expect(result2.valid).toBe(false)
    })
  })

  describe('batch validation', () => {
    it('should validate batch of values', async () => {
      const validator = createValidator<string>()
        .rule({ validator: rules.email })

      const result = await validator.validateBatch([
        'user@example.com',
        'invalid',
        'another@test.com',
      ])

      expect(result.valid).toBe(false)
      expect(result.failures.length).toBe(1)
      expect(result.results.length).toBe(3)
    })
  })

  describe('parallel validation', () => {
    it('should validate values in parallel', async () => {
      const validator = createValidator<string>()
        .rule({ validator: rules.email })

      const result = await validator.validateParallel([
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
      ])

      expect(result.valid).toBe(true)
      expect(result.results.length).toBe(3)
    })
  })

  describe('cache', () => {
    it('should cache validation results when enabled', async () => {
      const validator = createValidator<string>({ cache: true })
        .rule({ name: 'email', validator: rules.email })

      // First validation
      await validator.validate('user@example.com')

      // Second validation (should use cache)
      await validator.validate('user@example.com')

      const stats = validator.getCacheStats()
      expect(stats?.hits).toBeGreaterThan(0)
    })
  })

  describe('stopOnFirstError', () => {
    it('should stop on first error when enabled', async () => {
      const validator = createValidator<string>({ stopOnFirstError: true })
        .rule({ validator: rules.minLength(5) })
        .rule({ validator: rules.email })

      const result = await validator.validate('abc')
      expect(result.valid).toBe(false)
      expect(result.code).toBe('MIN_LENGTH')
    })
  })
})



