import type { ValidationResult } from '../types'

/**
 * LRU 缓存节点
 */
interface CacheNode {
  key: string
  value: ValidationResult
  prev: CacheNode | null
  next: CacheNode | null
}

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
}

/**
 * 缓存条目（带过期时间）
 */
interface CacheEntry {
  value: ValidationResult
  expireAt?: number
}

/**
 * LRU 缓存实现
 * 用于缓存验证结果，提升重复验证性能
 */
export class RuleCache {
  private cache: Map<string, CacheEntry>
  private head: CacheNode | null = null
  private tail: CacheNode | null = null
  private maxSize: number
  private ttl?: number
  private enabled: boolean
  private hits = 0
  private misses = 0

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000
    this.ttl = options.ttl
    this.enabled = options.enabled ?? true
    this.cache = new Map()
  }

  /**
   * 获取缓存值
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
   */
  set(key: string, value: ValidationResult): void {
    if (!this.enabled) {
      return
    }

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    // 计算过期时间
    const expireAt = this.ttl ? Date.now() + this.ttl : undefined

    // 添加到缓存
    this.cache.set(key, { value, expireAt })
  }

  /**
   * 生成缓存键
   * @param value - 验证值
   * @param ruleName - 规则名称
   * @param params - 规则参数（可选）
   */
  generateKey(value: any, ruleName: string, params?: any): string {
    // 将值转换为字符串（处理对象和数组）
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value)

    // 如果有参数，也包含在键中
    const paramsStr = params ? JSON.stringify(params) : ''

    return `${ruleName}:${valueStr}:${paramsStr}`
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null
    this.hits = 0
    this.misses = 0
  }

  /**
   * 删除指定键的缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 检查缓存是否存在
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
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 启用缓存
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用缓存
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      enabled: this.enabled,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.hits = 0
    this.misses = 0
  }

  /**
   * 清理过期条目
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
}

/**
 * 全局缓存实例
 */
let globalCache: RuleCache | null = null

/**
 * 获取全局缓存实例
 */
export function getGlobalCache(): RuleCache {
  if (!globalCache) {
    globalCache = new RuleCache()
  }
  return globalCache
}

/**
 * 设置全局缓存实例
 */
export function setGlobalCache(cache: RuleCache): void {
  globalCache = cache
}

/**
 * 清除全局缓存
 */
export function clearGlobalCache(): void {
  if (globalCache) {
    globalCache.clear()
  }
}



