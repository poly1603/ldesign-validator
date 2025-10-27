import type { ValidationResult } from '../types'

/**
 * 对象池配置选项
 */
export interface PoolOptions {
  /**
   * 池的初始大小
   * 启动时预分配的对象数量，减少冷启动开销
   * @default 10
   */
  initialSize?: number

  /**
   * 池的最大大小
   * 超过此大小的对象将不会被回收到池中
   * @default 100
   */
  maxSize?: number

  /**
   * 是否启用对象池
   * 禁用后将始终创建新对象
   * @default true
   */
  enabled?: boolean
}

/**
 * 验证结果对象池
 * 用于复用 ValidationResult 对象，减少内存分配和 GC 压力
 * 
 * 适用场景：
 * - 高频验证（每秒 100+ 次）
 * - 长时间运行的应用
 * - 内存敏感的环境
 * 
 * @example
 * ```typescript
 * const pool = new ResultPool({
 *   initialSize: 20,
 *   maxSize: 200
 * })
 * 
 * const validator = createValidator({ poolInstance: pool })
 * 
 * // 验证器会自动从池中获取和归还对象
 * await validator.validate('test@example.com')
 * 
 * // 查看统计信息
 * console.log(pool.getStats())
 * ```
 */
export class ResultPool {
  /** 对象池数组 */
  private pool: ValidationResult[] = []
  
  /** 池的最大大小 */
  private maxSize: number
  
  /** 是否启用对象池 */
  private enabled: boolean
  
  /** 累计获取对象次数 */
  private acquiredCount = 0
  
  /** 累计归还对象次数 */
  private releasedCount = 0
  
  /** 累计创建对象次数 */
  private createdCount = 0

  /**
   * 构造函数
   * @param options 对象池配置选项
   */
  constructor(options: PoolOptions = {}) {
    this.maxSize = options.maxSize ?? 100
    this.enabled = options.enabled ?? true

    // 预分配初始对象（减少冷启动开销）
    const initialSize = options.initialSize ?? 10
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createResult())
      this.createdCount++
    }
  }

  /**
   * 创建新的验证结果对象
   * @returns 新的 ValidationResult 对象
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
   * 将对象的所有属性重置为初始值，以便复用
   * @param result 要重置的验证结果对象
   */
  private resetResult(result: ValidationResult): void {
    result.valid = false
    result.message = undefined
    result.code = undefined
    result.meta = undefined
  }

  /**
   * 从池中获取对象
   * 如果池中有可用对象则复用，否则创建新对象
   * 
   * @returns 验证结果对象
   * 
   * @example
   * ```typescript
   * const result = pool.acquire()
   * result.valid = true
   * result.message = '验证通过'
   * ```
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
   * 对象会被重置并放回池中以便下次复用
   * 如果池已满，对象将被丢弃由 GC 回收
   * 
   * @param result 要归还的验证结果对象
   * 
   * @example
   * ```typescript
   * const result = pool.acquire()
   * // ... 使用对象 ...
   * pool.release(result) // 归还到池中
   * ```
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
   * @param results 要归还的验证结果对象数组
   */
  releaseMany(results: ValidationResult[]): void {
    for (const result of results) {
      this.release(result)
    }
  }

  /**
   * 清空池
   * 移除所有对象并重置统计信息
   */
  clear(): void {
    this.pool = []
    this.acquiredCount = 0
    this.releasedCount = 0
  }

  /**
   * 获取池的当前大小
   * 返回当前池中可用对象的数量
   */
  get size(): number {
    return this.pool.length
  }

  /**
   * 启用对象池
   * 启用后 acquire 和 release 操作将正常工作
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用对象池
   * 禁用后 acquire 始终创建新对象，release 不执行任何操作
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 获取对象池统计信息
   * 包含池大小、获取次数、复用率等信息
   * 
   * @returns 统计信息对象
   * 
   * @example
   * ```typescript
   * const stats = pool.getStats()
   * console.log(`对象复用率: ${stats.reuseRate}`)
   * console.log(`池大小: ${stats.poolSize}/${stats.maxSize}`)
   * ```
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      acquiredCount: this.acquiredCount,
      releasedCount: this.releasedCount,
      createdCount: this.createdCount,
      reuseRate: this.acquiredCount > 0
        ? `${((this.acquiredCount - this.createdCount) / this.acquiredCount * 100).toFixed(2)}%`
        : '0%',
      enabled: this.enabled,
    }
  }

  /**
   * 重置统计信息
   * 清除所有计数器，但保留池中的对象
   */
  resetStats(): void {
    this.acquiredCount = 0
    this.releasedCount = 0
    this.createdCount = 0
  }
}

/**
 * 全局对象池实例（单例）
 */
let globalPool: ResultPool | null = null

/**
 * 获取全局对象池实例
 * 如果不存在则创建新实例（单例模式）
 * 适合在多个验证器之间共享对象池
 * 
 * @returns 全局对象池实例
 * 
 * @example
 * ```typescript
 * const pool = getGlobalPool()
 * const validator = createValidator({ poolInstance: pool })
 * ```
 */
export function getGlobalPool(): ResultPool {
  if (!globalPool) {
    globalPool = new ResultPool()
  }
  return globalPool
}

/**
 * 设置自定义的全局对象池实例
 * 可用于替换默认配置的全局对象池
 * 
 * @param pool 自定义对象池实例
 * 
 * @example
 * ```typescript
 * const customPool = new ResultPool({
 *   initialSize: 50,
 *   maxSize: 500
 * })
 * setGlobalPool(customPool)
 * ```
 */
export function setGlobalPool(pool: ResultPool): void {
  globalPool = pool
}

/**
 * 清除全局对象池的所有内容
 * 移除所有对象并重置统计信息
 * 
 * @example
 * ```typescript
 * clearGlobalPool() // 清除所有池中对象和统计
 * ```
 */
export function clearGlobalPool(): void {
  if (globalPool) {
    globalPool.clear()
  }
}



