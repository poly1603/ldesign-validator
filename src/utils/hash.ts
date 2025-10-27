/**
 * 快速哈希工具
 * 用于生成缓存键，比 JSON.stringify 更快且占用内存更少
 */

/**
 * 简单快速的字符串哈希函数（基于 djb2 算法）
 * 
 * @param str 要哈希的字符串
 * @returns 哈希值（数字）
 */
function djb2Hash(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i) // hash * 33 + c
  }
  return hash >>> 0 // 转换为无符号整数
}

/**
 * 将值转换为字符串用于哈希
 * 比 JSON.stringify 更快，但精度稍低
 * 
 * @param value 任意值
 * @returns 字符串表示
 */
function valueToString(value: any): string {
  // 处理基本类型
  if (value === null) {
    return 'null'
  }
  if (value === undefined) {
    return 'undefined'
  }

  const type = typeof value

  // 处理原始类型
  if (type === 'string' || type === 'number' || type === 'boolean') {
    return String(value)
  }

  // 处理数组
  if (Array.isArray(value)) {
    // 对于小数组，直接拼接
    if (value.length <= 10) {
      return `[${value.map(v => valueToString(v)).join(',')}]`
    }
    // 对于大数组，只使用长度和前几个元素
    return `[${value.length}:${value.slice(0, 3).map(v => valueToString(v)).join(',')}]`
  }

  // 处理对象
  if (type === 'object') {
    const keys = Object.keys(value)
    // 对于小对象，序列化所有键值对
    if (keys.length <= 10) {
      return `{${keys.sort().map(k => `${k}:${valueToString(value[k])}`).join(',')}}`
    }
    // 对于大对象，只使用部分键值对
    return `{${keys.length}:${keys.slice(0, 3).sort().map(k => `${k}:${valueToString(value[k])}`).join(',')}}`
  }

  // 处理函数、Symbol 等
  return String(value)
}

/**
 * 生成快速哈希缓存键
 * 性能优于 JSON.stringify，适合缓存场景
 * 
 * @param value 要验证的值
 * @param ruleName 规则名称
 * @param params 额外参数（可选）
 * @returns 哈希后的缓存键
 * 
 * @example
 * ```typescript
 * const key1 = fastHash('test@example.com', 'email')
 * const key2 = fastHash({ name: 'John' }, 'required', { strict: true })
 * ```
 */
export function fastHash(value: any, ruleName: string, params?: any): string {
  const valueStr = valueToString(value)
  const paramsStr = params ? valueToString(params) : ''

  // 组合字符串并哈希
  const combined = `${ruleName}:${valueStr}:${paramsStr}`
  const hash = djb2Hash(combined)

  // 返回十六进制字符串，更短更高效
  return hash.toString(36)
}

/**
 * 生成简单缓存键（不使用哈希）
 * 适合值较小且简单的场景
 * 
 * @param value 要验证的值
 * @param ruleName 规则名称
 * @param params 额外参数（可选）
 * @returns 缓存键字符串
 */
export function simpleKey(value: any, ruleName: string, params?: any): string {
  const valueStr = valueToString(value)
  const paramsStr = params ? valueToString(params) : ''
  return `${ruleName}:${valueStr}:${paramsStr}`
}

/**
 * 缓存键生成策略
 */
export const CacheKeyStrategy = {
  /**
   * 快速哈希策略（推荐）
   * 适合大多数场景，性能和内存占用平衡
   */
  FAST_HASH: fastHash,

  /**
   * 简单拼接策略
   * 适合值较小的场景，最快但可能占用更多内存
   */
  SIMPLE: simpleKey,

  /**
   * JSON 序列化策略（不推荐）
   * 精确但慢，仅用于需要绝对精确的场景
   */
  JSON: (value: any, ruleName: string, params?: any): string => {
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value)
    const paramsStr = params ? JSON.stringify(params) : ''
    return `${ruleName}:${valueStr}:${paramsStr}`
  },
} as const




