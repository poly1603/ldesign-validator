import { describe, expect, it } from 'vitest'
import { ResultPool, getGlobalPool, setGlobalPool, clearGlobalPool } from '../../src/core/Pool'

describe('ResultPool', () => {
  describe('basic functionality', () => {
    it('should acquire and release objects', () => {
      const pool = new ResultPool({ initialSize: 5 })

      expect(pool.size).toBe(5)

      const result = pool.acquire()
      expect(pool.size).toBe(4)

      pool.release(result)
      expect(pool.size).toBe(5)
    })

    it('should reset objects when releasing', () => {
      const pool = new ResultPool()

      const result = pool.acquire()
      result.valid = true
      result.message = 'test'
      result.code = 'TEST'
      result.meta = { test: true }

      pool.release(result)

      const reused = pool.acquire()
      expect(reused.valid).toBe(false)
      expect(reused.message).toBeUndefined()
      expect(reused.code).toBeUndefined()
      expect(reused.meta).toBeUndefined()
    })

    it('should create new objects when pool is empty', () => {
      const pool = new ResultPool({ initialSize: 0 })

      expect(pool.size).toBe(0)

      const result = pool.acquire()
      expect(result).toBeDefined()
      expect(pool.size).toBe(0) // 池仍然为空
    })
  })

  describe('pool size limits', () => {
    it('should respect maxSize when releasing', () => {
      const pool = new ResultPool({ initialSize: 0, maxSize: 3 })

      const results = [
        pool.acquire(),
        pool.acquire(),
        pool.acquire(),
        pool.acquire(),
      ]

      results.forEach(r => pool.release(r))

      expect(pool.size).toBe(3) // 最多只能存 3 个
    })
  })

  describe('statistics', () => {
    it('should track acquire and release counts', () => {
      const pool = new ResultPool({ initialSize: 2 })

      pool.acquire()
      pool.acquire()
      pool.acquire() // 创建新对象

      const stats = pool.getStats()
      expect(stats.acquiredCount).toBe(3)
      expect(stats.createdCount).toBe(3) // 2 初始 + 1 新建
    })

    it('should calculate reuse rate correctly', () => {
      const pool = new ResultPool({ initialSize: 5 })

      // 获取 10 次，只创建 5 次新对象
      for (let i = 0; i < 10; i++) {
        const result = pool.acquire()
        pool.release(result)
      }

      const stats = pool.getStats()
      expect(stats.acquiredCount).toBe(10)
      expect(Number.parseFloat(stats.reuseRate)).toBeGreaterThan(0)
    })

    it('should reset stats', () => {
      const pool = new ResultPool()

      pool.acquire()
      pool.acquire()

      pool.resetStats()

      const stats = pool.getStats()
      expect(stats.acquiredCount).toBe(0)
      expect(stats.createdCount).toBe(0)
    })
  })

  describe('enable/disable', () => {
    it('should respect enabled flag', () => {
      const pool = new ResultPool({ enabled: false })

      const result = pool.acquire()
      const sizeBefore = pool.size

      pool.release(result)

      expect(pool.size).toBe(sizeBefore) // 未归还
    })

    it('should allow runtime enable/disable', () => {
      const pool = new ResultPool()

      const result1 = pool.acquire()
      pool.release(result1)
      expect(pool.size).toBeGreaterThan(0)

      pool.disable()
      const result2 = pool.acquire()
      pool.release(result2)

      pool.enable()
      const result3 = pool.acquire()
      pool.release(result3)
      expect(pool.size).toBeGreaterThan(0)
    })
  })

  describe('batch operations', () => {
    it('should release many objects at once', () => {
      const pool = new ResultPool({ initialSize: 0 })

      const results = [
        pool.acquire(),
        pool.acquire(),
        pool.acquire(),
      ]

      pool.releaseMany(results)

      expect(pool.size).toBe(3)
    })
  })

  describe('clear', () => {
    it('should clear pool and reset stats', () => {
      const pool = new ResultPool({ initialSize: 5 })

      pool.acquire()
      pool.acquire()

      pool.clear()

      expect(pool.size).toBe(0)
      const stats = pool.getStats()
      expect(stats.acquiredCount).toBe(0)
    })
  })

  describe('global pool', () => {
    it('should get global pool instance', () => {
      const pool1 = getGlobalPool()
      const pool2 = getGlobalPool()

      expect(pool1).toBe(pool2) // 单例
    })

    it('should set custom global pool', () => {
      const customPool = new ResultPool({ maxSize: 500 })
      setGlobalPool(customPool)

      const pool = getGlobalPool()
      expect(pool).toBe(customPool)
    })

    it('should clear global pool', () => {
      const pool = getGlobalPool()
      const result = pool.acquire()
      pool.release(result)

      clearGlobalPool()

      expect(pool.size).toBe(0)
    })
  })
})



