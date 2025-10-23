import { describe, expect, it } from 'vitest'
import { createValidator, createSchemaValidator } from '../src'
import * as rules from '../src/rules'

describe('Integration Tests', () => {
  describe('complex form validation', () => {
    it('should validate user registration form', async () => {
      const schema = {
        username: {
          type: 'string',
          required: true,
          min: 3,
          max: 20,
        },
        email: {
          type: 'email',
          required: true,
        },
        password: {
          type: 'string',
          required: true,
          min: 8,
        },
        age: {
          type: 'number',
          required: true,
          min: 18,
          max: 100,
        },
      }

      const validator = createSchemaValidator(schema)

      const validData = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        age: 25,
      }

      const result = await validator.validate(validData)
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)

      const invalidData = {
        username: 'ab', // Too short
        email: 'invalid-email',
        password: '123', // Too short
        age: 15, // Too young
      }

      const result2 = await validator.validate(invalidData)
      expect(result2.valid).toBe(false)
      expect(result2.errors.length).toBeGreaterThan(0)
    })
  })

  describe('async validation chain', () => {
    it('should handle async validation rules', async () => {
      const asyncCheckUsername = async (value: string) => {
        // Simulate async API call
        await new Promise(resolve => setTimeout(resolve, 10))
        return {
          valid: value !== 'admin',
          message: value === 'admin' ? '用户名已被占用' : undefined,
          code: 'USERNAME_TAKEN',
        }
      }

      const validator = createValidator<string>()
        .rule({ validator: rules.required })
        .rule({ validator: rules.minLength(3) })
        .rule({ validator: asyncCheckUsername })

      const result1 = await validator.validate('john')
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate('admin')
      expect(result2.valid).toBe(false)
      expect(result2.code).toBe('USERNAME_TAKEN')
    })
  })

  describe('field dependencies', () => {
    it('should validate confirm password matches password', async () => {
      const validator = createValidator<string>()
        .rule({ validator: rules.required })
        .rule({
          validator: (value, context) => {
            const password = context?.formData?.password
            const valid = value === password

            return {
              valid,
              message: valid ? undefined : '两次密码输入不一致',
              code: 'PASSWORD_MISMATCH',
            }
          },
        })

      const result = await validator.validate('password123', {
        formData: {
          password: 'password123',
          confirmPassword: 'password123',
        },
      })

      expect(result.valid).toBe(true)

      const result2 = await validator.validate('different', {
        formData: {
          password: 'password123',
          confirmPassword: 'different',
        },
      })

      expect(result2.valid).toBe(false)
      expect(result2.code).toBe('PASSWORD_MISMATCH')
    })
  })

  describe('conditional validation with when()', () => {
    it('should apply different rules based on conditions', async () => {
      const validator = createValidator<string>()
        .rule({
          validator: rules.when(
            (value, context) => context?.formData?.country === 'China',
            {
              then: rules.idCard,
              otherwise: rules.pattern(/^[A-Z0-9]+$/, '请输入有效的护照号'),
            },
          ),
        })

      // Chinese ID card
      const result1 = await validator.validate('110101199001011234', {
        formData: { country: 'China' },
      })
      expect(result1.valid).toBe(true)

      // Foreign passport
      const result2 = await validator.validate('AB123456', {
        formData: { country: 'USA' },
      })
      expect(result2.valid).toBe(true)
    })
  })

  describe('rule combinations (and/or)', () => {
    it('should validate with AND logic', async () => {
      const validator = createValidator<string>()
        .rule({
          validator: rules.and(
            rules.minLength(8),
            rules.pattern(/[A-Z]/, '必须包含大写字母'),
            rules.pattern(/[0-9]/, '必须包含数字'),
          ),
        })

      const result1 = await validator.validate('Password123')
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate('password')
      expect(result2.valid).toBe(false)
    })

    it('should validate with OR logic', async () => {
      const validator = createValidator<string>()
        .rule({
          validator: rules.or(
            rules.email,
            rules.phone,
          ),
        })

      const result1 = await validator.validate('user@example.com')
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate('13812345678')
      expect(result2.valid).toBe(true)

      const result3 = await validator.validate('not-valid')
      expect(result3.valid).toBe(false)
    })
  })

  describe('ref() field reference', () => {
    it('should reference other fields in validation', async () => {
      const validator = createValidator<string>()
        .rule({
          validator: (value, context) => {
            const refValue = rules.ref('password')(context)
            return rules.equals(refValue, '两次密码不一致')(value, context)
          },
        })

      const result = await validator.validate('password123', {
        formData: {
          password: 'password123',
          confirmPassword: 'password123',
        },
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('performance with caching', () => {
    it('should perform better with cache enabled', async () => {
      const validatorWithoutCache = createValidator<string>()
        .rule({ name: 'email', validator: rules.email })

      const validatorWithCache = createValidator<string>({ cache: true })
        .rule({ name: 'email', validator: rules.email })

      const iterations = 1000
      const testEmail = 'user@example.com'

      // Without cache
      const start1 = performance.now()
      for (let i = 0; i < iterations; i++) {
        await validatorWithoutCache.validate(testEmail)
      }
      const time1 = performance.now() - start1

      // With cache
      const start2 = performance.now()
      for (let i = 0; i < iterations; i++) {
        await validatorWithCache.validate(testEmail)
      }
      const time2 = performance.now() - start2

      console.log(`Without cache: ${time1.toFixed(2)}ms`)
      console.log(`With cache: ${time2.toFixed(2)}ms`)
      console.log(`Speedup: ${(time1 / time2).toFixed(2)}x`)

      // Cache should be significantly faster for repeated validations
      expect(time2).toBeLessThan(time1)
    })
  })
})



