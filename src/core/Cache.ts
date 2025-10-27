import type { ValidationResult } from '../types'
import { fastHash } from '../utils/hash'

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  /**
   * 最大缓存条目数
   * @default 1000
   */
  maxSize?: number

  /**
   * 缓存过期时间（毫秒）
   * @default undefined（永不过期）
   */
  ttl?: number

  /**
   * 是否启用缓存
   * @default true
   */
  enabled?: boolean

  /**
   * 是否自动清理过期条目
   * @default false
   */
  autoCleanup?: boolean

  /**
   * 自动清理间隔（毫秒）
   * @default 60000 (1分钟)
   */
  cleanupInterval?: number
}

/**
 * 缓存条目（带过期时间）
 */
interface CacheEntry {
  /** 缓存的验证结果 */
  value: ValidationResult
  /** 过期时间戳（可选） */
  expireAt?: number
}

/**
 * 验证结果缓存类
 * 使用 Map 实现的简单高效缓存，支持 TTL、自动清理等功能
 * 
 * @example
 * ```typescript
 * const cache = new RuleCache({
 *   maxSize: 5000,
 *   ttl: 60000, // 1分钟过期
 *   autoCleanup: true
 * })
 * 
 * const key = cache.generateKey('test@example.com', 'email')
 * cache.set(key, { valid: true })
 * const result = cache.get(key)
 * ```
 */
export class RuleCache {
  /** 缓存存储（键值对） */
  private cache: Map<string, CacheEntry>

  /** 最大缓存条目数 */
  private maxSize: number

  /** 缓存过期时间（毫秒） */
  private ttl?: number

  /** 是否启用缓存 */
  private enabled: boolean

  /** 缓存命中次数 */
  private hits = 0

  /** 缓存未命中次数 */
  private misses = 0

  /** 自动清理定时器 */
  private cleanupTimer?: NodeJS.Timeout

  /**
   * 构造函数
   * @param options 缓存配置选项
   */
  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000
    this.ttl = options.ttl
    this.enabled = options.enabled ?? true
    this.cache = new Map()

    // 启动自动清理
    if (options.autoCleanup && this.ttl) {
      const interval = options.cleanupInterval ?? 60000
      this.cleanupTimer = setInterval(() => {
        this.cleanExpired()
      }, interval)
    }
  }

  /**
   * 获取缓存值
   * 如果缓存命中且未过期，返回结果并增加命中计数
   * 
   * @param key 缓存键
   * @returns 缓存的验证结果，如果未找到或已过期则返回 undefined
   */
  get(key: string): ValidationResult | undefined {
    if (!this.enabled) {
      return undefined
    }

    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return undefined
    }

    // 检查是否过期
    if (entry.expireAt && entry.expireAt < Date.now()) {
      this.cache.delete(key)
      this.misses++
      return undefined
    }

    this.hits++
    return entry.value
  }

  /**
   * 设置缓存值
   * 如果缓存已满，会使用 FIFO 策略删除最早的条目
   * 
   * @param key 缓存键
   * @param value 验证结果
   */
  set(key: string, value: ValidationResult): void {
    if (!this.enabled) {
      return
    }

    // 如果缓存已满，删除最旧的条目（FIFO 策略）
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    // 计算过期时间
    const expireAt = this.ttl ? Date.now() + this.ttl : undefined

    // 添加到缓存
    this.cache.set(key, { value, expireAt })
  }

  /**
   * 生成缓存键
   * 使用快速哈希算法生成缓存键，性能优于 JSON.stringify
   * 
   * @param value 验证值
   * @param ruleName 规则名称
   * @param params 规则参数（可选）
   * @returns 缓存键字符串
   * 
   * @example
   * ```typescript
   * const key1 = cache.generateKey('test@example.com', 'email')
   * const key2 = cache.generateKey({ name: 'John' }, 'required', { strict: true })
   * ```
   */
  generateKey(value: any, ruleName: string, params?: any): string {
    // 使用快速哈希函数生成键
    return fastHash(value, ruleName, params)
  }

  /**
   * 清空所有缓存
   * 同时重置统计计数器
   * 
   * @example
   * ```typescript
   * cache.clear()
   * ```
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * 删除指定键的缓存
   * @param key 要删除的缓存键
   * @returns 如果删除成功返回 true，否则返回 false
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 检查缓存键是否存在且未过期
   * @param key 缓存键
   * @returns 如果存在且未过期返回 true
   */
  has(key: string): boolean {
    if (!this.enabled) {
      return false
    }

    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // 检查是否过期
    if (entry.expireAt && entry.expireAt < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 获取当前缓存条目数量
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 启用缓存
   * 启用后 get/set 操作将正常工作
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用缓存
   * 禁用后 get 始终返回 undefined，set 不执行任何操作
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 获取缓存统计信息
   * 包含命中率、大小、命中/未命中次数等
   * 
   * @returns 缓存统计对象
   * 
   * @example
   * ```typescript
   * const stats = cache.getStats()
   * console.log(`命中率: ${stats.hitRate}`)
   * console.log(`缓存大小: ${stats.size}/${stats.maxSize}`)
   * ```
   */
  getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate.toFixed(2)}%`,
      enabled: this.enabled,
    }
  }

  /**
   * 重置统计计数器
   * 清除命中和未命中的计数，但保留缓存数据
   */
  resetStats(): void {
    this.hits = 0
    this.misses = 0
  }

  /**
   * 清理所有过期的缓存条目
   * 如果未设置 TTL，此方法不执行任何操作
   * 
   * @returns 清理的条目数量
   * 
   * @example
   * ```typescript
   * const cleaned = cache.cleanExpired()
   * console.log(`清理了 ${cleaned} 个过期条目`)
   * ```
   */
  cleanExpired(): number {
    if (!this.ttl) {
      return 0
    }

    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expireAt && entry.expireAt < now) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * 销毁缓存实例
   * 停止自动清理定时器并清空所有缓存
   * 
   * @example
   * ```typescript
   * cache.destroy()
   * ```
   */
  destroy(): void {
    // 停止自动清理定时器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    // 清空缓存
    this.clear()
  }
}

/**
 * 全局缓存实例（单例）
 */
let globalCache: RuleCache | null = null

/**
 * 获取全局缓存实例
 * 如果不存在则创建新实例（单例模式）
 * 适合在多个验证器之间共享缓存
 * 
 * @returns 全局缓存实例
 * 
 * @example
 * ```typescript
 * const cache = getGlobalCache()
 * const validator = createValidator({ cacheInstance: cache })
 * ```
 */
export function getGlobalCache(): RuleCache {
  if (!globalCache) {
    globalCache = new RuleCache()
  }
  return globalCache
}

/**
 * 设置自定义的全局缓存实例
 * 可用于替换默认配置的全局缓存
 * 
 * @param cache 自定义缓存实例
 * 
 * @example
 * ```typescript
 * const customCache = new RuleCache({
 *   maxSize: 10000,
 *   ttl: 300000, // 5分钟
 *   autoCleanup: true
 * })
 * setGlobalCache(customCache)
 * ```
 */
export function setGlobalCache(cache: RuleCache): void {
  // 销毁旧的全局缓存
  if (globalCache) {
    globalCache.destroy()
  }
  globalCache = cache
}

/**
 * 清除全局缓存的所有内容
 * 不销毁缓存实例本身
 * 
 * @example
 * ```typescript
 * clearGlobalCache() // 清除所有缓存数据但保留实例
 * ```
 */
export function clearGlobalCache(): void {
  if (globalCache) {
    globalCache.clear()
  }
}



