import type { ValidationRule, ValidationResult, ValidationContext } from '../types'
import { RuleCache } from './Cache'
import { ResultPool } from './Pool'

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
   * 是否启用对象池
   * @default false
   */
  pool?: boolean

  /**
   * 对象池实例（如果不提供，将创建新实例）
   */
  poolInstance?: ResultPool

  /**
   * 遇到第一个错误时停止验证
   * @default true
   */
  stopOnFirstError?: boolean

  /**
   * 规则执行错误处理钩子
   * @param error 错误对象
   * @param rule 出错的规则
   * @param value 验证的值
   */
  onError?: (error: Error, rule: ValidationRule<any>, value: any) => void
}

/**
 * Validator 核心类
 * 用于验证数据的核心类，支持链式调用、缓存、对象池等功能
 * 
 * @example
 * ```typescript
 * const validator = createValidator<string>({ cache: true })
 *   .rule({ name: 'email', validator: rules.email })
 * 
 * const result = await validator.validate('user@example.com')
 * ```
 */
export class Validator<T = any> {
  /** 验证规则列表 */
  private rules: ValidationRule<T>[] = []

  /** 缓存实例（可选） */
  private cache?: RuleCache

  /** 对象池实例（可选） */
  private pool?: ResultPool

  /** 是否在遇到第一个错误时停止验证 */
  private stopOnFirstError: boolean

  /** 规则执行错误处理钩子 */
  private onError?: (error: Error, rule: ValidationRule<any>, value: any) => void

  /**
   * 构造函数
   * @param options 验证器配置选项
   */
  constructor(options: ValidatorOptions = {}) {
    this.stopOnFirstError = options.stopOnFirstError ?? true
    this.onError = options.onError

    // 初始化缓存
    if (options.cache) {
      this.cache = options.cacheInstance ?? new RuleCache()
    }

    // 初始化对象池
    if (options.pool) {
      this.pool = options.poolInstance ?? new ResultPool()
    }
  }

  /**
   * 添加验证规则
   * @param rule 验证规则
   * @returns 返回自身以支持链式调用
   * 
   * @example
   * ```typescript
   * validator
   *   .rule({ name: 'required', validator: rules.required })
   *   .rule({ name: 'email', validator: rules.email })
   * ```
   */
  rule(rule: ValidationRule<T>): this {
    this.rules.push(rule)
    return this
  }

  /**
   * 检查值是否为空（必填验证用）
   * @param value 要检查的值
   * @returns 如果值为空则返回 true
   */
  private isEmpty(value: any): boolean {
    return value === null || value === undefined || value === ''
  }

  /**
   * 检查必填规则
   * @param value 要验证的值
   * @param rule 验证规则
   * @param context 验证上下文
   * @returns 如果必填验证失败则返回错误结果，否则返回 undefined
   */
  private checkRequired(
    value: T,
    rule: ValidationRule<T>,
    context?: ValidationContext
  ): ValidationResult | undefined {
    if (rule.required && this.isEmpty(value)) {
      return this.createResult(false, {
        message: typeof rule.message === 'function'
          ? rule.message(value, context)
          : rule.message || '此字段是必填项',
        code: 'REQUIRED',
      })
    }
    return undefined
  }

  /**
   * 从缓存获取验证结果
   * @param value 验证值
   * @param rule 验证规则
   * @returns 缓存的结果或 undefined
   */
  private getCachedResult(value: T, rule: ValidationRule<T>): ValidationResult | undefined {
    if (this.cache && rule.name) {
      const cacheKey = this.cache.generateKey(value, rule.name)
      return this.cache.get(cacheKey)
    }
    return undefined
  }

  /**
   * 保存验证结果到缓存
   * @param value 验证值
   * @param rule 验证规则
   * @param result 验证结果
   */
  private setCachedResult(value: T, rule: ValidationRule<T>, result: ValidationResult): void {
    if (this.cache && rule.name) {
      const cacheKey = this.cache.generateKey(value, rule.name)
      this.cache.set(cacheKey, result)
    }
  }

  /**
   * 创建验证结果对象
   * @param valid 是否通过验证
   * @param options 其他选项
   * @returns 验证结果对象
   */
  private createResult(
    valid: boolean,
    options?: { message?: string; code?: string; meta?: any }
  ): ValidationResult {
    // 如果启用了对象池，从池中获取对象
    if (this.pool) {
      const result = this.pool.acquire()
      result.valid = valid
      result.message = options?.message
      result.code = options?.code
      result.meta = options?.meta
      return result
    }

    // 否则直接创建新对象
    return {
      valid,
      message: options?.message,
      code: options?.code,
      meta: options?.meta,
    }
  }

  /**
   * 合并规则消息和验证结果消息
   * @param result 原始验证结果
   * @param rule 验证规则
   * @param value 验证值
   * @param context 验证上下文
   * @returns 合并后的验证结果
   */
  private mergeRuleMessage(
    result: ValidationResult,
    rule: ValidationRule<T>,
    value: T,
    context?: ValidationContext
  ): ValidationResult {
    const message = typeof rule.message === 'function'
      ? rule.message(value, context)
      : rule.message || result.message

    return {
      ...result,
      message,
    }
  }

  /**
   * 执行单个验证规则（带错误处理）
   * @param rule 验证规则
   * @param value 验证值
   * @param context 验证上下文
   * @param isAsync 是否异步执行
   * @returns 验证结果或 Promise
   */
  private executeRule(
    rule: ValidationRule<T>,
    value: T,
    context?: ValidationContext,
    isAsync = true
  ): ValidationResult | Promise<ValidationResult> {
    try {
      const result = rule.validator(value, context)

      // 如果是异步模式且结果是 Promise，正常返回
      if (isAsync && result instanceof Promise) {
        return result.catch(error => {
          // 处理异步验证中的错误
          if (this.onError) {
            this.onError(error, rule, value)
          }
          return this.createResult(false, {
            message: '验证规则执行出错',
            code: 'RULE_ERROR',
            meta: { error: error.message },
          })
        })
      }

      // 同步模式下不允许返回 Promise
      if (!isAsync && result instanceof Promise) {
        throw new Error(`规则 "${rule.name || 'unknown'}" 是异步的，请使用 validate() 而非 validateSync()`)
      }

      return result
    }
    catch (error) {
      // 处理同步验证中的错误
      if (this.onError) {
        this.onError(error as Error, rule, value)
      }
      return this.createResult(false, {
        message: '验证规则执行出错',
        code: 'RULE_ERROR',
        meta: { error: (error as Error).message },
      })
    }
  }

  /**
   * 验证值（异步）
   * @param value 要验证的值
   * @param context 验证上下文（可选）
   * @returns 验证结果的 Promise
   * 
   * @example
   * ```typescript
   * const result = await validator.validate('user@example.com')
   * if (result.valid) {
   *   console.log('验证通过')
   * } else {
   *   console.log('验证失败:', result.message)
   * }
   * ```
   */
  async validate(value: T, context?: ValidationContext): Promise<ValidationResult> {
    // 短路优化：如果没有规则，直接返回成功
    if (this.rules.length === 0) {
      return this.createResult(true)
    }

    for (const rule of this.rules) {
      // 检查必填规则
      const requiredResult = this.checkRequired(value, rule, context)
      if (requiredResult) {
        return requiredResult
      }

      // 跳过空值（非必需字段）
      if (this.isEmpty(value)) {
        continue
      }

      // 尝试从缓存获取结果
      let result = this.getCachedResult(value, rule)

      // 如果缓存未命中，执行验证器
      if (!result) {
        result = await this.executeRule(rule, value, context, true)

        // 保存到缓存
        this.setCachedResult(value, rule, result)
      }

      // 如果验证失败
      if (!result.valid) {
        const finalResult = this.mergeRuleMessage(result, rule, value, context)

        // 如果需要在第一个错误时停止，立即返回
        if (this.stopOnFirstError) {
          return finalResult
        }

        // 否则返回第一个错误（但继续执行后续规则的副作用）
        return finalResult
      }
    }

    return this.createResult(true)
  }

  /**
   * 批量验证多个值（顺序执行）
   * 适合需要依赖前序结果的场景
   * 
   * @param values 要验证的值数组
   * @param context 验证上下文
   * @returns 批量验证结果
   * 
   * @example
   * ```typescript
   * const values = ['user1@example.com', 'invalid', 'user2@example.com']
   * const result = await validator.validateBatch(values)
   * console.log(`验证通过: ${result.results.length - result.failures.length}/${result.results.length}`)
   * ```
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
   * 比 validateBatch 更快，适合独立验证场景
   * 
   * @param values 要验证的值数组
   * @param context 验证上下文
   * @returns 批量验证结果
   * 
   * @example
   * ```typescript
   * const emails = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`)
   * const result = await validator.validateParallel(emails)
   * console.log(`耗时更短，适合大量数据`)
   * ```
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
   * @param value 要验证的值
   * @param context 验证上下文（可选）
   * @returns 验证结果
   * @throws 如果规则是异步的，会抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const result = validator.validateSync('user@example.com')
   *   console.log(result.valid)
   * } catch (error) {
   *   console.error('包含异步规则，请使用 validate()')
   * }
   * ```
   */
  validateSync(value: T, context?: ValidationContext): ValidationResult {
    // 短路优化：如果没有规则，直接返回成功
    if (this.rules.length === 0) {
      return this.createResult(true)
    }

    for (const rule of this.rules) {
      // 检查必填规则
      const requiredResult = this.checkRequired(value, rule, context)
      if (requiredResult) {
        return requiredResult
      }

      // 跳过空值（非必需字段）
      if (this.isEmpty(value)) {
        continue
      }

      // 尝试从缓存获取结果
      let result = this.getCachedResult(value, rule)

      // 如果缓存未命中，执行验证器
      if (!result) {
        const executeResult = this.executeRule(rule, value, context, false)

        // executeRule 已经处理了 Promise 检查，这里直接使用结果
        result = executeResult as ValidationResult

        // 保存到缓存
        this.setCachedResult(value, rule, result)
      }

      // 如果验证失败
      if (!result.valid) {
        const finalResult = this.mergeRuleMessage(result, rule, value, context)

        // 如果需要在第一个错误时停止，立即返回
        if (this.stopOnFirstError) {
          return finalResult
        }

        // 否则返回第一个错误
        return finalResult
      }
    }

    return this.createResult(true)
  }

  /**
   * 清除验证器缓存
   * 当验证规则发生变化时，建议调用此方法清除旧缓存
   * 
   * @example
   * ```typescript
   * validator.clearCache()
   * ```
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.clear()
    }
  }

  /**
   * 获取缓存统计信息
   * 用于监控缓存性能和命中率
   * 
   * @returns 缓存统计信息，包括命中率、大小等
   * 
   * @example
   * ```typescript
   * const stats = validator.getCacheStats()
   * console.log(`缓存命中率: ${stats?.hitRate}`)
   * console.log(`缓存大小: ${stats?.size}/${stats?.maxSize}`)
   * ```
   */
  getCacheStats() {
    return this.cache?.getStats()
  }

  /**
   * 获取验证器中的规则数量
   */
  get ruleCount(): number {
    return this.rules.length
  }
}

/**
 * 创建 Validator 实例的工厂函数
 * 推荐使用此函数而非直接 new Validator()
 * 
 * @param options 验证器配置选项
 * @returns Validator 实例
 * 
 * @example
 * ```typescript
 * // 基础用法
 * const validator = createValidator<string>()
 *   .rule({ validator: rules.email })
 * 
 * // 启用缓存和对象池
 * const optimizedValidator = createValidator<string>({
 *   cache: true,
 *   pool: true,
 *   stopOnFirstError: true
 * })
 * ```
 */
export function createValidator<T = any>(options?: ValidatorOptions): Validator<T> {
  return new Validator<T>(options)
}






