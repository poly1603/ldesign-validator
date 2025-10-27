import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { RuleCache, getGlobalCache, setGlobalCache, clearGlobalCache } from '../../src/core/Cache'

describe('RuleCache', () => {
  describe('basic functionality', () => {
    it('should get and set cache values', () => {
      const cache = new RuleCache()
      const key = cache.generateKey('test@example.com', 'email')
      const result = { valid: true }

      cache.set(key, result)
      const cached = cache.get(key)

      expect(cached).toEqual(result)
      expect(cache.size).toBe(1)
    })

    it('should return undefined for non-existent keys', () => {
      const cache = new RuleCache()
      const result = cache.get('non-existent-key')

      expect(result).toBeUndefined()
    })

    it('should track cache hits and misses', () => {
      const cache = new RuleCache()
      const key = cache.generateKey('test', 'rule')

      cache.get(key) // miss
      cache.set(key, { valid: true })
      cache.get(key) // hit

      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe('50.00%')
    })
  })

  describe('cache size limit', () => {
    it('should respect maxSize limit', () => {
      const cache = new RuleCache({ maxSize: 3 })

      cache.set('key1', { valid: true })
      cache.set('key2', { valid: true })
      cache.set('key3', { valid: true })
      cache.set('key4', { valid: true }) // 超出限制

      expect(cache.size).toBe(3)
      expect(cache.has('key1')).toBe(false) // 最早的被移除
      expect(cache.has('key4')).toBe(true)
    })
  })

  describe('TTL (Time To Live)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should expire entries after TTL', () => {
      const cache = new RuleCache({ ttl: 1000 }) // 1秒过期
      const key = cache.generateKey('test', 'rule')

      cache.set(key, { valid: true })
      expect(cache.get(key)).toBeDefined()

      // 前进时间 1.5 秒
      vi.advanceTimersByTime(1500)

      expect(cache.get(key)).toBeUndefined()
    })

    it('should clean expired entries', () => {
      const cache = new RuleCache({ ttl: 1000 })

      cache.set('key1', { valid: true })
      cache.set('key2', { valid: true })

      expect(cache.size).toBe(2)

      // 前进时间
      vi.advanceTimersByTime(1500)

      const cleaned = cache.cleanExpired()
      expect(cleaned).toBe(2)
      expect(cache.size).toBe(0)
    })
  })

  describe('auto cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should auto cleanup expired entries', () => {
      const cache = new RuleCache({
        ttl: 1000,
        autoCleanup: true,
        cleanupInterval: 2000,
      })

      cache.set('key1', { valid: true })
      expect(cache.size).toBe(1)

      // 前进到过期
      vi.advanceTimersByTime(1500)

      // 前进到清理时间
      vi.advanceTimersByTime(2000)

      expect(cache.size).toBe(0)
    })
  })

  describe('enable/disable', () => {
    it('should respect enabled flag', () => {
      const cache = new RuleCache({ enabled: false })

      cache.set('key', { valid: true })
      const result = cache.get('key')

      expect(result).toBeUndefined()
      expect(cache.size).toBe(0)
    })

    it('should allow runtime enable/disable', () => {
      const cache = new RuleCache()

      cache.set('key1', { valid: true })
      expect(cache.get('key1')).toBeDefined()

      cache.disable()
      cache.set('key2', { valid: true })
      expect(cache.get('key2')).toBeUndefined()

      cache.enable()
      cache.set('key3', { valid: true })
      expect(cache.get('key3')).toBeDefined()
    })
  })

  describe('cache operations', () => {
    it('should clear all cache', () => {
      const cache = new RuleCache()

      cache.set('key1', { valid: true })
      cache.set('key2', { valid: true })

      expect(cache.size).toBe(2)

      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.getStats().hits).toBe(0)
      expect(cache.getStats().misses).toBe(0)
    })

    it('should delete specific key', () => {
      const cache = new RuleCache()

      cache.set('key1', { valid: true })
      cache.set('key2', { valid: true })

      expect(cache.delete('key1')).toBe(true)
      expect(cache.delete('non-existent')).toBe(false)
      expect(cache.size).toBe(1)
    })

    it('should check if key exists', () => {
      const cache = new RuleCache()

      cache.set('key', { valid: true })

      expect(cache.has('key')).toBe(true)
      expect(cache.has('non-existent')).toBe(false)
    })
  })

  describe('destroy', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should stop auto cleanup timer', () => {
      const cache = new RuleCache({
        ttl: 1000,
        autoCleanup: true,
        cleanupInterval: 1000,
      })

      cache.destroy()

      // 定时器应该已停止
      vi.advanceTimersByTime(2000)
      expect(cache.size).toBe(0)
    })
  })

  describe('global cache', () => {
    it('should get global cache instance', () => {
      const cache1 = getGlobalCache()
      const cache2 = getGlobalCache()

      expect(cache1).toBe(cache2) // 单例
    })

    it('should set custom global cache', () => {
      const customCache = new RuleCache({ maxSize: 5000 })
      setGlobalCache(customCache)

      const cache = getGlobalCache()
      expect(cache).toBe(customCache)
    })

    it('should clear global cache', () => {
      const cache = getGlobalCache()
      cache.set('key', { valid: true })

      clearGlobalCache()

      expect(cache.size).toBe(0)
    })
  })

  describe('fast hash key generation', () => {
    it('should generate consistent keys', () => {
      const cache = new RuleCache()

      const key1 = cache.generateKey('test', 'email')
      const key2 = cache.generateKey('test', 'email')

      expect(key1).toBe(key2)
    })

    it('should generate different keys for different values', () => {
      const cache = new RuleCache()

      const key1 = cache.generateKey('test1', 'email')
      const key2 = cache.generateKey('test2', 'email')

      expect(key1).not.toBe(key2)
    })

    it('should include params in key', () => {
      const cache = new RuleCache()

      const key1 = cache.generateKey('test', 'custom', { strict: true })
      const key2 = cache.generateKey('test', 'custom', { strict: false })

      expect(key1).not.toBe(key2)
    })
  })
})



