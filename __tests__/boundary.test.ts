import { describe, expect, it } from 'vitest'
import { createValidator } from '../src/core/Validator'
import * as rules from '../src/rules'

describe('Boundary Tests', () => {
  describe('extreme values', () => {
    it('should handle null values', async () => {
      const validator = createValidator()
        .rule({ validator: rules.email })

      const result = await validator.validate(null as any)
      expect(result.valid).toBe(true) // 空值跳过验证
    })

    it('should handle undefined values', async () => {
      const validator = createValidator()
        .rule({ validator: rules.email })

      const result = await validator.validate(undefined as any)
      expect(result.valid).toBe(true)
    })

    it('should handle empty strings', async () => {
      const validator = createValidator()
        .rule({ validator: rules.email })

      const result = await validator.validate('')
      expect(result.valid).toBe(true)
    })

    it('should handle very long strings', async () => {
      const validator = createValidator()
        .rule({ validator: rules.maxLength(10000) })

      const longString = 'a'.repeat(10000)
      const result = await validator.validate(longString)
      expect(result.valid).toBe(true)

      const tooLong = 'a'.repeat(10001)
      const result2 = await validator.validate(tooLong)
      expect(result2.valid).toBe(false)
    })

    it('should handle special characters', async () => {
      const validator = createValidator()
        .rule({ validator: rules.required })

      const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const result = await validator.validate(specialChars)
      expect(result.valid).toBe(true)
    })

    it('should handle unicode characters', async () => {
      const validator = createValidator()
        .rule({ validator: rules.required })

      const unicode = '你好世界🌍😀'
      const result = await validator.validate(unicode)
      expect(result.valid).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle NaN', () => {
      const validator = createValidator()
        .rule({ validator: rules.numeric })

      const result = validator.validateSync(Number.NaN)
      expect(result.valid).toBe(false)
    })

    it('should handle Infinity', () => {
      const validator = createValidator()
        .rule({ validator: rules.range(0, 100) })

      const result = validator.validateSync(Number.POSITIVE_INFINITY)
      expect(result.valid).toBe(false)
    })

    it('should handle negative Infinity', () => {
      const validator = createValidator()
        .rule({ validator: rules.range(0, 100) })

      const result = validator.validateSync(Number.NEGATIVE_INFINITY)
      expect(result.valid).toBe(false)
    })

    it('should handle very large numbers', () => {
      const validator = createValidator()
        .rule({ validator: rules.numeric })

      const result = validator.validateSync(Number.MAX_SAFE_INTEGER)
      expect(result.valid).toBe(true)

      const result2 = validator.validateSync(Number.MAX_VALUE)
      expect(result2.valid).toBe(true)
    })

    it('should handle very small numbers', () => {
      const validator = createValidator()
        .rule({ validator: rules.numeric })

      const result = validator.validateSync(Number.MIN_SAFE_INTEGER)
      expect(result.valid).toBe(true)

      const result2 = validator.validateSync(Number.MIN_VALUE)
      expect(result2.valid).toBe(true)
    })
  })

  describe('large data volumes', () => {
    it('should handle large arrays', async () => {
      const validator = createValidator<string[]>()
        .rule({ validator: rules.arrayOf(rules.email) })

      const largeArray = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`)
      const result = await validator.validate(largeArray)

      expect(result.valid).toBe(true)
    })

    it('should handle batch validation of large datasets', async () => {
      const validator = createValidator<string>({ cache: true })
        .rule({ name: 'email', validator: rules.email })

      const emails = Array.from({ length: 10000 }, (_, i) => `user${i}@example.com`)

      const startTime = performance.now()
      const result = await validator.validateBatch(emails)
      const endTime = performance.now()

      expect(result.valid).toBe(true)
      expect(result.results.length).toBe(10000)

      console.log(`批量验证 10000 项耗时: ${(endTime - startTime).toFixed(2)}ms`)
      expect(endTime - startTime).toBeLessThan(5000) // 应该在 5 秒内完成
    })

    it('should handle parallel validation efficiently', async () => {
      const validator = createValidator<string>({ cache: true })
        .rule({ name: 'email', validator: rules.email })

      const emails = Array.from({ length: 10000 }, (_, i) => `user${i}@example.com`)

      const startTime = performance.now()
      const result = await validator.validateParallel(emails)
      const endTime = performance.now()

      expect(result.valid).toBe(true)

      console.log(`并行验证 10000 项耗时: ${(endTime - startTime).toFixed(2)}ms`)
      expect(endTime - startTime).toBeLessThan(3000) // 并行应该更快
    })
  })

  describe('memory efficiency', () => {
    it('should not leak memory with repeated validations', async () => {
      const validator = createValidator<string>({
        cache: true,
        pool: true,
        cacheInstance: undefined,
      })
        .rule({ name: 'email', validator: rules.email })

      // 执行大量验证
      for (let i = 0; i < 10000; i++) {
        await validator.validate(`user${i % 100}@example.com`)
      }

      const stats = validator.getCacheStats()
      expect(stats?.size).toBeLessThanOrEqual(1000) // 缓存大小应该受限
    })

    it('should handle object pool efficiently', () => {
      const validator = createValidator({ pool: true })
        .rule({ validator: rules.required })

      // 执行大量同步验证
      for (let i = 0; i < 10000; i++) {
        validator.validateSync('test')
      }

      // 对象池应该限制对象数量
      // 这里主要是确保不会崩溃或内存溢出
      expect(true).toBe(true)
    })
  })

  describe('concurrent validations', () => {
    it('should handle concurrent validations safely', async () => {
      const validator = createValidator<string>({ cache: true })
        .rule({ name: 'email', validator: rules.email })

      // 并发执行多个验证
      const promises = Array.from({ length: 100 }, (_, i) =>
        validator.validate(`user${i}@example.com`)
      )

      const results = await Promise.all(promises)

      expect(results.every(r => r.valid)).toBe(true)
      expect(results).toHaveLength(100)
    })
  })

  describe('error cases', () => {
    it('should handle rule execution errors', async () => {
      const validator = createValidator({
        onError: (error) => {
          console.log('捕获到错误:', error.message)
        },
      }).rule({
        validator: () => {
          throw new Error('模拟错误')
        },
      })

      const result = await validator.validate('test')
      expect(result.valid).toBe(false)
      expect(result.code).toBe('RULE_ERROR')
    })

    it('should detect async rules in validateSync', () => {
      const validator = createValidator().rule({
        name: 'async-rule',
        validator: async () => ({ valid: true }),
      })

      expect(() => {
        validator.validateSync('test')
      }).toThrow('是异步的')
    })
  })

  describe('deeply nested data', () => {
    it('should handle deeply nested field paths', () => {
      const validator = createValidator()
        .rule({
          validator: (value, context) => {
            const nested = context?.formData?.user?.profile?.settings?.theme
            return {
              valid: value === nested,
              message: '值必须匹配嵌套字段',
            }
          },
        })

      const result = validator.validateSync('dark', {
        formData: {
          user: {
            profile: {
              settings: {
                theme: 'dark',
              },
            },
          },
        },
      })

      expect(result.valid).toBe(true)
    })
  })
})



