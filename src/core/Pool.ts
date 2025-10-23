import type { ValidationResult } from '../types'

/**
 * 对象池配置选项
 */
export interface PoolOptions {
  /**
   * 池的初始大小
   * @default 10
   */
  initialSize?: number

  /**
   * 池的最大大小
   * @default 100
   */
  maxSize?: number

  /**
   * 是否启用对象池
   * @default true
   */
  enabled?: boolean
}

/**
 * 验证结果对象池
 * 用于复用 ValidationResult 对象，减少内存分配和 GC 压力
 */
export class ResultPool {
  private pool: ValidationResult[] = []
  private maxSize: number
  private enabled: boolean
  private acquiredCount = 0
  private releasedCount = 0
  private createdCount = 0

  constructor(options: PoolOptions = {}) {
    this.maxSize = options.maxSize ?? 100
    this.enabled = options.enabled ?? true

    // 预分配初始对象
    const initialSize = options.initialSize ?? 10
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createResult())
      this.createdCount++
    }
  }

  /**
   * 创建新的验证结果对象
   */
  private createResult(): ValidationResult {
    return {
      valid: false,
      message: undefined,
      code: undefined,
      meta: undefined,
    }
  }

  /**
   * 重置验证结果对象
   */
  private resetResult(result: ValidationResult): void {
    result.valid = false
    result.message = undefined
    result.code = undefined
    result.meta = undefined
  }

  /**
   * 从池中获取对象
   */
  acquire(): ValidationResult {
    if (!this.enabled) {
      this.createdCount++
      return this.createResult()
    }

    this.acquiredCount++

    // 如果池中有可用对象，直接返回
    if (this.pool.length > 0) {
      const result = this.pool.pop()!
      this.resetResult(result)
      return result
    }

    // 池为空，创建新对象
    this.createdCount++
    return this.createResult()
  }

  /**
   * 将对象归还到池中
   */
  release(result: ValidationResult): void {
    if (!this.enabled) {
      return
    }

    this.releasedCount++

    // 如果池未满，归还对象
    if (this.pool.length < this.maxSize) {
      this.resetResult(result)
      this.pool.push(result)
    }
    // 池已满，让对象被 GC 回收
  }

  /**
   * 批量归还对象
   */
  releaseMany(results: ValidationResult[]): void {
    for (const result of results) {
      this.release(result)
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = []
    this.acquiredCount = 0
    this.releasedCount = 0
  }

  /**
   * 获取池的当前大小
   */
  get size(): number {
    return this.pool.length
  }

  /**
   * 启用对象池
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用对象池
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      acquiredCount: this.acquiredCount,
      releasedCount: this.releasedCount,
      createdCount: this.createdCount,
      reuseRate: this.acquiredCount > 0
        ? ((this.acquiredCount - this.createdCount) / this.acquiredCount * 100).toFixed(2) + '%'
        : '0%',
      enabled: this.enabled,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.acquiredCount = 0
    this.releasedCount = 0
    this.createdCount = 0
  }
}

/**
 * 全局对象池实例
 */
let globalPool: ResultPool | null = null

/**
 * 获取全局对象池实例
 */
export function getGlobalPool(): ResultPool {
  if (!globalPool) {
    globalPool = new ResultPool()
  }
  return globalPool
}

/**
 * 设置全局对象池实例
 */
export function setGlobalPool(pool: ResultPool): void {
  globalPool = pool
}

/**
 * 清除全局对象池
 */
export function clearGlobalPool(): void {
  if (globalPool) {
    globalPool.clear()
  }
}



