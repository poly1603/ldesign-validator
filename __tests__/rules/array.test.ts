import { describe, expect, it } from 'vitest'
import { arrayOf, arrayUnique } from '../../src/rules/basic'
import { email } from '../../src/rules/format'

describe('Array Validation Rules', () => {
  describe('arrayOf', () => {
    it('should validate array elements', async () => {
      const validator = arrayOf(email)

      const result1 = await validator(['test@example.com', 'user@test.com'])
      expect(result1.valid).toBe(true)

      const result2 = await validator(['test@example.com', 'invalid-email'])
      expect(result2.valid).toBe(false)
      expect(result2.message).toContain('[1]')
    })

    it('should reject non-array values', async () => {
      const validator = arrayOf(email)

      const result = await validator('not-an-array' as any)
      expect(result.valid).toBe(false)
      expect(result.code).toBe('NOT_ARRAY')
    })

    it('should pass for empty arrays', async () => {
      const validator = arrayOf(email)

      const result = await validator([])
      expect(result.valid).toBe(true)
    })

    it('should support stopOnFirstError option', async () => {
      const validator = arrayOf(email, { stopOnFirstError: true })

      const result = await validator(['invalid1', 'invalid2', 'invalid3'])
      expect(result.valid).toBe(false)
      expect(result.meta?.errors).toHaveLength(1) // 只有第一个错误
    })

    it('should collect all errors when stopOnFirstError is false', async () => {
      const validator = arrayOf(email, { stopOnFirstError: false })

      const result = await validator(['invalid1', 'test@example.com', 'invalid2'])
      expect(result.valid).toBe(false)
      expect(result.meta?.errors?.length).toBeGreaterThan(1)
    })

    it('should support custom error message with index placeholder', async () => {
      const validator = arrayOf(email, {
        message: '第 {index} 个邮箱格式不正确',
      })

      const result = await validator(['test@example.com', 'invalid'])
      expect(result.valid).toBe(false)
      expect(result.message).toContain('第 1 个邮箱')
    })
  })

  describe('arrayUnique', () => {
    it('should validate array uniqueness', () => {
      const validator = arrayUnique()

      const result1 = validator(['a', 'b', 'c'])
      expect(result1.valid).toBe(true)

      const result2 = validator(['a', 'b', 'a'])
      expect(result2.valid).toBe(false)
      expect(result2.code).toBe('ARRAY_NOT_UNIQUE')
    })

    it('should reject non-array values', () => {
      const validator = arrayUnique()

      const result = validator('not-an-array' as any)
      expect(result.valid).toBe(false)
      expect(result.code).toBe('NOT_ARRAY')
    })

    it('should support custom compare function', () => {
      const validator = arrayUnique({
        compareFn: (a, b) => a.id === b.id,
      })

      const result1 = validator([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ])
      expect(result1.valid).toBe(true)

      const result2 = validator([
        { id: 1, name: 'a' },
        { id: 1, name: 'b' },
      ])
      expect(result2.valid).toBe(false)
    })

    it('should support custom error message', () => {
      const validator = arrayUnique({ message: '自定义错误消息' })

      const result = validator(['a', 'b', 'a'])
      expect(result.valid).toBe(false)
      expect(result.message).toBe('自定义错误消息')
    })

    it('should include duplicate info in meta', () => {
      const validator = arrayUnique()

      const result = validator(['a', 'b', 'a'])
      expect(result.valid).toBe(false)
      expect(result.meta?.duplicate).toBe('a')
      expect(result.meta?.index).toBe(2)
    })
  })
})



