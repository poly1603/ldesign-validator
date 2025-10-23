import type { ValidationRule, ValidationResult, ValidationContext } from '../types'
import { RuleCache } from './Cache'

/**
 * 批量验证结果
 */
export interface BatchValidationResult<T = any> {
  /**
   * 所有值是否都通过验证
   */
  valid: boolean

  /**
   * 每个值的验证结果
   */
  results: Array<{
    value: T
    result: ValidationResult
  }>

  /**
   * 验证失败的值
   */
  failures: Array<{
    value: T
    result: ValidationResult
  }>
}

/**
 * Validator 配置选项
 */
export interface ValidatorOptions {
  /**
   * 是否启用缓存
   * @default false
   */
  cache?: boolean

  /**
   * 缓存实例（如果不提供，将创建新实例）
   */
  cacheInstance?: RuleCache

  /**
   * 遇到第一个错误时停止验证
   * @default true
   */
  stopOnFirstError?: boolean
}

/**
 * Validator 核心类
 */
export class Validator<T = any> {
  private rules: ValidationRule<T>[] = []
  private cache?: RuleCache
  private stopOnFirstError: boolean

  constructor(options: ValidatorOptions = {}) {
    this.stopOnFirstError = options.stopOnFirstError ?? true

    if (options.cache) {
      this.cache = options.cacheInstance ?? new RuleCache()
    }
  }

  /**
   * 添加验证规则
   */
  rule(rule: ValidationRule<T>): this {
    this.rules.push(rule)
    return this
  }

  /**
   * 验证值
   */
  async validate(value: T, context?: ValidationContext): Promise<ValidationResult> {
    // 短路优化：如果没有规则，直接返回成功
    if (this.rules.length === 0) {
      return { valid: true }
    }

    for (const rule of this.rules) {
      // 检查是否必需
      if (rule.required && (value === null || value === undefined || value === '')) {
        return {
          valid: false,
          message: typeof rule.message === 'function'
            ? rule.message(value, context)
            : rule.message || '此字段是必填项',
          code: 'REQUIRED',
        }
      }

      // 跳过空值（非必需字段）
      if (value === null || value === undefined || value === '') {
        continue
      }

      // 尝试从缓存获取结果
      let result: ValidationResult | undefined

      if (this.cache && rule.name) {
        const cacheKey = this.cache.generateKey(value, rule.name)
        result = this.cache.get(cacheKey)
      }

      // 如果缓存未命中，执行验证器
      if (!result) {
        result = await rule.validator(value, context)

        // 保存到缓存
        if (this.cache && rule.name) {
          const cacheKey = this.cache.generateKey(value, rule.name)
          this.cache.set(cacheKey, result)
        }
      }

      // 短路：遇到错误立即返回
      if (!result.valid && this.stopOnFirstError) {
        return {
          ...result,
          message: typeof rule.message === 'function'
            ? rule.message(value, context)
            : rule.message || result.message,
        }
      }

      if (!result.valid) {
        return {
          ...result,
          message: typeof rule.message === 'function'
            ? rule.message(value, context)
            : rule.message || result.message,
        }
      }
    }

    return { valid: true }
  }

  /**
   * 批量验证多个值
   * @param values - 要验证的值数组
   * @param context - 验证上下文
   */
  async validateBatch(values: T[], context?: ValidationContext): Promise<BatchValidationResult<T>> {
    const results: Array<{ value: T, result: ValidationResult }> = []
    const failures: Array<{ value: T, result: ValidationResult }> = []

    for (const value of values) {
      const result = await this.validate(value, context)
      const item = { value, result }

      results.push(item)

      if (!result.valid) {
        failures.push(item)
      }
    }

    return {
      valid: failures.length === 0,
      results,
      failures,
    }
  }

  /**
   * 并行验证多个值
   * @param values - 要验证的值数组
   * @param context - 验证上下文
   */
  async validateParallel(values: T[], context?: ValidationContext): Promise<BatchValidationResult<T>> {
    // 并行执行所有验证
    const promises = values.map(async value => ({
      value,
      result: await this.validate(value, context),
    }))

    const results = await Promise.all(promises)
    const failures = results.filter(item => !item.result.valid)

    return {
      valid: failures.length === 0,
      results,
      failures,
    }
  }

  /**
   * 同步验证（不推荐用于异步规则）
   */
  validateSync(value: T, context?: ValidationContext): ValidationResult {
    // 短路优化：如果没有规则，直接返回成功
    if (this.rules.length === 0) {
      return { valid: true }
    }

    for (const rule of this.rules) {
      // 检查是否必需
      if (rule.required && (value === null || value === undefined || value === '')) {
        return {
          valid: false,
          message: typeof rule.message === 'function'
            ? rule.message(value, context)
            : rule.message || '此字段是必填项',
          code: 'REQUIRED',
        }
      }

      // 跳过空值
      if (value === null || value === undefined || value === '') {
        continue
      }

      // 尝试从缓存获取结果
      let result: ValidationResult | undefined

      if (this.cache && rule.name) {
        const cacheKey = this.cache.generateKey(value, rule.name)
        result = this.cache.get(cacheKey)
      }

      // 如果缓存未命中，执行验证器
      if (!result) {
        result = rule.validator(value, context)

        // 如果是 Promise，抛出错误
        if (result instanceof Promise) {
          throw new Error(`Rule "${rule.name}" is async, use validate() instead of validateSync()`)
        }

        // 保存到缓存
        if (this.cache && rule.name) {
          const cacheKey = this.cache.generateKey(value, rule.name)
          this.cache.set(cacheKey, result)
        }
      }

      // 短路：遇到错误立即返回
      if (!result.valid && this.stopOnFirstError) {
        return {
          ...result,
          message: typeof rule.message === 'function'
            ? rule.message(value, context)
            : rule.message || result.message,
        }
      }

      if (!result.valid) {
        return {
          ...result,
          message: typeof rule.message === 'function'
            ? rule.message(value, context)
            : rule.message || result.message,
        }
      }
    }

    return { valid: true }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.clear()
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return this.cache?.getStats()
  }

  /**
   * 获取规则数量
   */
  get ruleCount(): number {
    return this.rules.length
  }
}

/**
 * 创建 Validator 实例
 * @param options - 配置选项
 */
export function createValidator<T = any>(options?: ValidatorOptions): Validator<T> {
  return new Validator<T>(options)
}






