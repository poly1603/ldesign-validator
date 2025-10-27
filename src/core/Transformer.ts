/**
 * 数据转换器
 * 用于在验证前对数据进行清理和转换
 */

/**
 * 转换函数类型
 */
export type TransformFunction<T = any> = (value: T) => any

/**
 * 数据转换器类
 * 支持链式调用，可以组合多个转换操作
 * 
 * @example
 * ```typescript
 * import { createTransformer } from '@ldesign/validator'
 * 
 * const transformer = createTransformer<string>()
 *   .trim()
 *   .toLowerCase()
 *   .transform()
 * 
 * const result = transformer('  Hello World  ')
 * console.log(result) // 'hello world'
 * ```
 */
export class Transformer<T = any> {
  /** 转换函数链 */
  private transforms: TransformFunction[] = []

  /**
   * 添加自定义转换函数
   * @param fn 转换函数
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.custom((value) => value.replace(/\s+/g, '-'))
   * ```
   */
  custom(fn: TransformFunction<T>): this {
    this.transforms.push(fn)
    return this
  }

  /**
   * 去除字符串首尾空格
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.trim().transform()('  hello  ') // 'hello'
   * ```
   */
  trim(): this {
    this.transforms.push((value: any) => {
      return typeof value === 'string' ? value.trim() : value
    })
    return this
  }

  /**
   * 转换为小写
   * @returns 返回自身以支持链式调用
   */
  toLowerCase(): this {
    this.transforms.push((value: any) => {
      return typeof value === 'string' ? value.toLowerCase() : value
    })
    return this
  }

  /**
   * 转换为大写
   * @returns 返回自身以支持链式调用
   */
  toUpperCase(): this {
    this.transforms.push((value: any) => {
      return typeof value === 'string' ? value.toUpperCase() : value
    })
    return this
  }

  /**
   * 转换为数字
   * 如果转换失败，返回 NaN
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.toNumber().transform()('123') // 123
   * transformer.toNumber().transform()('abc') // NaN
   * ```
   */
  toNumber(): this {
    this.transforms.push((value: any) => {
      if (typeof value === 'number') {
        return value
      }
      return Number(value)
    })
    return this
  }

  /**
   * 转换为整数
   * 使用 parseInt，支持指定进制
   * @param radix 进制（2-36），默认 10
   * @returns 返回自身以支持链式调用
   */
  toInteger(radix = 10): this {
    this.transforms.push((value: any) => {
      if (typeof value === 'number' && Number.isInteger(value)) {
        return value
      }
      return Number.parseInt(String(value), radix)
    })
    return this
  }

  /**
   * 转换为浮点数
   * @returns 返回自身以支持链式调用
   */
  toFloat(): this {
    this.transforms.push((value: any) => {
      if (typeof value === 'number') {
        return value
      }
      return Number.parseFloat(String(value))
    })
    return this
  }

  /**
   * 转换为布尔值
   * 'true', '1', 1, true 转换为 true
   * 其他值转换为 false
   * @returns 返回自身以支持链式调用
   */
  toBoolean(): this {
    this.transforms.push((value: any) => {
      if (typeof value === 'boolean') {
        return value
      }
      if (typeof value === 'string') {
        const lower = value.toLowerCase()
        return lower === 'true' || lower === '1'
      }
      if (typeof value === 'number') {
        return value === 1
      }
      return Boolean(value)
    })
    return this
  }

  /**
   * 转换为日期对象
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.toDate().transform()('2024-01-01') // Date object
   * ```
   */
  toDate(): this {
    this.transforms.push((value: any) => {
      if (value instanceof Date) {
        return value
      }
      return new Date(value)
    })
    return this
  }

  /**
   * 替换字符串
   * @param searchValue 要搜索的值（字符串或正则）
   * @param replaceValue 替换值
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.replace(/\s+/g, '-').transform()('hello world') // 'hello-world'
   * ```
   */
  replace(searchValue: string | RegExp, replaceValue: string): this {
    this.transforms.push((value: any) => {
      return typeof value === 'string' ? value.replace(searchValue, replaceValue) : value
    })
    return this
  }

  /**
   * 移除字符串中的特定字符
   * @param chars 要移除的字符（字符串或正则）
   * @returns 返回自身以支持链式调用
   */
  remove(chars: string | RegExp): this {
    return this.replace(chars, '')
  }

  /**
   * 限制字符串长度
   * @param maxLength 最大长度
   * @param suffix 超出时的后缀（默认 '...'）
   * @returns 返回自身以支持链式调用
   */
  truncate(maxLength: number, suffix = '...'): this {
    this.transforms.push((value: any) => {
      if (typeof value !== 'string') {
        return value
      }
      if (value.length <= maxLength) {
        return value
      }
      return value.slice(0, maxLength - suffix.length) + suffix
    })
    return this
  }

  /**
   * 分割字符串为数组
   * @param separator 分隔符
   * @returns 返回自身以支持链式调用
   */
  split(separator: string | RegExp): this {
    this.transforms.push((value: any) => {
      return typeof value === 'string' ? value.split(separator) : value
    })
    return this
  }

  /**
   * 连接数组为字符串
   * @param separator 分隔符（默认 ','）
   * @returns 返回自身以支持链式调用
   */
  join(separator = ','): this {
    this.transforms.push((value: any) => {
      return Array.isArray(value) ? value.join(separator) : value
    })
    return this
  }

  /**
   * 提取数字
   * 从字符串中提取所有数字并连接
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.extractNumbers().transform()('abc123def456') // '123456'
   * ```
   */
  extractNumbers(): this {
    this.transforms.push((value: any) => {
      if (typeof value !== 'string') {
        return value
      }
      const numbers = value.match(/\d+/g)
      return numbers ? numbers.join('') : ''
    })
    return this
  }

  /**
   * 移除 HTML 标签
   * @returns 返回自身以支持链式调用
   */
  stripHtml(): this {
    this.transforms.push((value: any) => {
      return typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : value
    })
    return this
  }

  /**
   * 规范化空白字符
   * 将多个连续空白字符替换为单个空格
   * @returns 返回自身以支持链式调用
   */
  normalizeWhitespace(): this {
    this.transforms.push((value: any) => {
      return typeof value === 'string' ? value.replace(/\s+/g, ' ') : value
    })
    return this
  }

  /**
   * 首字母大写
   * @returns 返回自身以支持链式调用
   */
  capitalize(): this {
    this.transforms.push((value: any) => {
      if (typeof value !== 'string' || value.length === 0) {
        return value
      }
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    })
    return this
  }

  /**
   * 驼峰命名转换
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.toCamelCase().transform()('hello-world') // 'helloWorld'
   * ```
   */
  toCamelCase(): this {
    this.transforms.push((value: any) => {
      if (typeof value !== 'string') {
        return value
      }
      return value.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    })
    return this
  }

  /**
   * 蛇形命名转换
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.toSnakeCase().transform()('helloWorld') // 'hello_world'
   * ```
   */
  toSnakeCase(): this {
    this.transforms.push((value: any) => {
      if (typeof value !== 'string') {
        return value
      }
      return value
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '')
    })
    return this
  }

  /**
   * 短横线命名转换
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * transformer.toKebabCase().transform()('helloWorld') // 'hello-world'
   * ```
   */
  toKebabCase(): this {
    this.transforms.push((value: any) => {
      if (typeof value !== 'string') {
        return value
      }
      return value
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')
    })
    return this
  }

  /**
   * 默认值转换
   * 如果值为 null、undefined 或空字符串，使用默认值
   * @param defaultValue 默认值
   * @returns 返回自身以支持链式调用
   */
  default(defaultValue: any): this {
    this.transforms.push((value: any) => {
      return (value === null || value === undefined || value === '') ? defaultValue : value
    })
    return this
  }

  /**
   * 执行所有转换并返回结果
   * @param value 要转换的值
   * @returns 转换后的值
   * 
   * @example
   * ```typescript
   * const transformer = createTransformer()
   *   .trim()
   *   .toLowerCase()
   * 
   * const result = transformer.transform('  HELLO  ')
   * console.log(result) // 'hello'
   * ```
   */
  transform(value?: T): any {
    // 如果没有提供值，返回一个转换函数
    if (arguments.length === 0) {
      return (v: T) => this.transforms.reduce((acc, fn) => fn(acc), v)
    }

    // 否则直接执行转换
    return this.transforms.reduce((acc, fn) => fn(acc), value)
  }

  /**
   * 清除所有转换函数
   * @returns 返回自身以支持链式调用
   */
  clear(): this {
    this.transforms = []
    return this
  }

  /**
   * 获取转换函数数量
   */
  get length(): number {
    return this.transforms.length
  }
}

/**
 * 创建数据转换器实例
 * @returns Transformer 实例
 * 
 * @example
 * ```typescript
 * const transformer = createTransformer<string>()
 *   .trim()
 *   .toLowerCase()
 *   .replace(/\s+/g, '-')
 * 
 * const result = transformer.transform('  Hello World  ')
 * console.log(result) // 'hello-world'
 * ```
 */
export function createTransformer<T = any>(): Transformer<T> {
  return new Transformer<T>()
}

/**
 * 常用转换器预设
 */
export const transformers = {
  /**
   * 邮箱转换器：去除空格、转小写
   */
  email: () => createTransformer<string>().trim().toLowerCase(),

  /**
   * 用户名转换器：去除空格、转小写、移除特殊字符
   */
  username: () => createTransformer<string>()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, ''),

  /**
   * 电话号码转换器：只保留数字
   */
  phone: () => createTransformer<string>().extractNumbers(),

  /**
   * URL Slug 转换器：转小写、空格转连字符
   */
  slug: () => createTransformer<string>()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, ''),

  /**
   * 价格转换器：转为数字，保留2位小数
   */
  price: () => createTransformer<string>()
    .toNumber()
    .custom((value: number) => Number.isNaN(value) ? 0 : Number(value.toFixed(2))),
}




