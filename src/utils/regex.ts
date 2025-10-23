/**
 * 正则表达式缓存池
 * 预编译常用的正则表达式以提升性能
 */

/**
 * 常用正则表达式缓存
 */
export const REGEX_CACHE = {
  // 格式验证
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
  phone: /^1[3-9]\d{9}$/,
  idCard: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
  ipv4: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  ipv6Full: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
  ipv6Compressed: /^(([0-9a-f]{1,4}:){1,7}:|([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:))$/i,
  postalCode: /^\d{6}$/,

  // 字符类型
  alpha: /^[A-Za-z]+$/,
  alphanumeric: /^[A-Za-z0-9]+$/,
  numeric: /^\d+$/,
  lowercase: /^[a-z]+$/,
  uppercase: /^[A-Z]+$/,

  // 哈希和编码
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  md5: /^[a-f0-9]{32}$/i,
  sha1: /^[a-f0-9]{40}$/i,
  sha256: /^[a-f0-9]{64}$/i,
  sha512: /^[a-f0-9]{128}$/i,
  hex: /^[0-9A-Fa-f]+$/,
  hexColor: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
  base64: /^[A-Za-z0-9+/]*(=|==)?$/,
  base64Url: /^[A-Za-z0-9_-]+$/,

  // 网络相关
  mac: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$/,
  iban: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/,

  // 信用卡和银行
  creditCard: /^\d{13,19}$/,

  // 书号和刊号
  isbn10: /^\d{9}[\dX]$/,
  isbn13: /^\d{13}$/,
  issn: /^\d{7}[\dX]$/,
} as const

/**
 * 动态正则表达式缓存
 * 用于缓存动态生成的正则表达式
 */
const dynamicRegexCache = new Map<string, RegExp>()

/**
 * 最大缓存大小
 */
const MAX_CACHE_SIZE = 100

/**
 * 获取或创建正则表达式
 * @param pattern - 正则表达式字符串或 RegExp 对象
 * @param flags - 正则表达式标志
 */
export function getOrCreateRegex(pattern: string | RegExp, flags?: string): RegExp {
  // 如果已经是 RegExp 对象，直接返回
  if (pattern instanceof RegExp) {
    return pattern
  }

  // 生成缓存键
  const cacheKey = flags ? `${pattern}::${flags}` : pattern

  // 检查缓存
  if (dynamicRegexCache.has(cacheKey)) {
    return dynamicRegexCache.get(cacheKey)!
  }

  // 创建新的正则表达式
  const regex = new RegExp(pattern, flags)

  // 添加到缓存（如果缓存未满）
  if (dynamicRegexCache.size < MAX_CACHE_SIZE) {
    dynamicRegexCache.set(cacheKey, regex)
  }
  else {
    // 缓存已满，删除最早的条目（简单的 FIFO 策略）
    const firstKey = dynamicRegexCache.keys().next().value
    dynamicRegexCache.delete(firstKey)
    dynamicRegexCache.set(cacheKey, regex)
  }

  return regex
}

/**
 * 清除动态正则表达式缓存
 */
export function clearRegexCache(): void {
  dynamicRegexCache.clear()
}

/**
 * 获取缓存统计信息
 */
export function getRegexCacheStats() {
  return {
    size: dynamicRegexCache.size,
    maxSize: MAX_CACHE_SIZE,
    keys: Array.from(dynamicRegexCache.keys()),
  }
}

/**
 * 常用正则表达式测试辅助函数
 */
export const regexTest = {
  /**
   * 测试邮箱格式
   */
  email: (value: string): boolean => REGEX_CACHE.email.test(value),

  /**
   * 测试 URL 格式
   */
  url: (value: string): boolean => {
    try {
      // 使用 URL API 更准确
      new URL(value)
      return true
    }
    catch {
      return false
    }
  },

  /**
   * 测试手机号格式（中国大陆）
   */
  phone: (value: string): boolean => REGEX_CACHE.phone.test(value),

  /**
   * 测试 IPv4 格式
   */
  ipv4: (value: string): boolean => REGEX_CACHE.ipv4.test(value),

  /**
   * 测试 IPv6 格式
   */
  ipv6: (value: string): boolean =>
    REGEX_CACHE.ipv6Full.test(value) || REGEX_CACHE.ipv6Compressed.test(value),

  /**
   * 测试 UUID 格式
   */
  uuid: (value: string): boolean => REGEX_CACHE.uuid.test(value),

  /**
   * 测试 MAC 地址格式
   */
  mac: (value: string): boolean => REGEX_CACHE.mac.test(value),

  /**
   * 测试十六进制颜色格式
   */
  hexColor: (value: string): boolean => REGEX_CACHE.hexColor.test(value),

  /**
   * 测试 Base64 格式
   */
  base64: (value: string): boolean =>
    REGEX_CACHE.base64.test(value) && value.length % 4 === 0,
}



