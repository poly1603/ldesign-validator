import { describe, expect, it } from 'vitest'
import { fastHash, simpleKey, CacheKeyStrategy } from '../../src/utils/hash'

describe('Hash Utilities', () => {
  describe('fastHash', () => {
    it('should generate consistent hashes for same input', () => {
      const hash1 = fastHash('test@example.com', 'email')
      const hash2 = fastHash('test@example.com', 'email')

      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different inputs', () => {
      const hash1 = fastHash('test1@example.com', 'email')
      const hash2 = fastHash('test2@example.com', 'email')

      expect(hash1).not.toBe(hash2)
    })

    it('should generate different hashes for different rule names', () => {
      const hash1 = fastHash('test', 'rule1')
      const hash2 = fastHash('test', 'rule2')

      expect(hash1).not.toBe(hash2)
    })

    it('should handle object values', () => {
      const hash1 = fastHash({ name: 'John', age: 30 }, 'custom')
      const hash2 = fastHash({ name: 'John', age: 30 }, 'custom')

      expect(hash1).toBe(hash2)
    })

    it('should handle array values', () => {
      const hash1 = fastHash([1, 2, 3], 'array')
      const hash2 = fastHash([1, 2, 3], 'array')

      expect(hash1).toBe(hash2)
    })

    it('should handle large objects efficiently', () => {
      const largeObj = {}
      for (let i = 0; i < 1000; i++) {
        largeObj[`key${i}`] = `value${i}`
      }

      const startTime = performance.now()
      const hash = fastHash(largeObj, 'test')
      const endTime = performance.now()

      expect(hash).toBeDefined()
      expect(endTime - startTime).toBeLessThan(10) // 应该很快
    })

    it('should handle params', () => {
      const hash1 = fastHash('test', 'custom', { strict: true })
      const hash2 = fastHash('test', 'custom', { strict: false })

      expect(hash1).not.toBe(hash2)
    })

    it('should handle primitive types', () => {
      expect(fastHash('string', 'test')).toBeDefined()
      expect(fastHash(123, 'test')).toBeDefined()
      expect(fastHash(true, 'test')).toBeDefined()
      expect(fastHash(null, 'test')).toBeDefined()
      expect(fastHash(undefined, 'test')).toBeDefined()
    })
  })

  describe('simpleKey', () => {
    it('should generate simple string keys', () => {
      const key = simpleKey('test@example.com', 'email')

      expect(key).toContain('email')
      expect(key).toContain('test@example.com')
    })

    it('should generate consistent keys', () => {
      const key1 = simpleKey('test', 'rule')
      const key2 = simpleKey('test', 'rule')

      expect(key1).toBe(key2)
    })

    it('should include params', () => {
      const key1 = simpleKey('test', 'rule', { a: 1 })
      const key2 = simpleKey('test', 'rule', { a: 2 })

      expect(key1).not.toBe(key2)
    })
  })

  describe('CacheKeyStrategy', () => {
    it('should provide FAST_HASH strategy', () => {
      const key = CacheKeyStrategy.FAST_HASH('test', 'rule')
      expect(key).toBeDefined()
      expect(typeof key).toBe('string')
    })

    it('should provide SIMPLE strategy', () => {
      const key = CacheKeyStrategy.SIMPLE('test', 'rule')
      expect(key).toBeDefined()
      expect(key).toContain('test')
    })

    it('should provide JSON strategy', () => {
      const key = CacheKeyStrategy.JSON({ name: 'test' }, 'rule')
      expect(key).toBeDefined()
      expect(key).toContain('test')
    })

    it('should compare strategy performance', () => {
      const value = { a: 1, b: 2, c: 3, d: 4, e: 5 }

      // FAST_HASH
      const start1 = performance.now()
      for (let i = 0; i < 1000; i++) {
        CacheKeyStrategy.FAST_HASH(value, 'rule')
      }
      const time1 = performance.now() - start1

      // JSON
      const start2 = performance.now()
      for (let i = 0; i < 1000; i++) {
        CacheKeyStrategy.JSON(value, 'rule')
      }
      const time2 = performance.now() - start2

      console.log(`FAST_HASH: ${time1.toFixed(2)}ms`)
      console.log(`JSON: ${time2.toFixed(2)}ms`)
      console.log(`性能提升: ${(time2 / time1).toFixed(2)}x`)

      // FAST_HASH 应该更快
      expect(time1).toBeLessThan(time2)
    })
  })
})



