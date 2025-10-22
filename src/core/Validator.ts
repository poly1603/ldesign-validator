import type { ValidationRule, ValidationResult, ValidationContext } from '../types'

/**
 * Validator 核心类
 */
export class Validator<T = any> {
  private rules: ValidationRule<T>[] = []

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

      // 执行验证器
      const result = await rule.validator(value, context)

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
   * 同步验证（不推荐用于异步规则）
   */
  validateSync(value: T, context?: ValidationContext): ValidationResult {
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

      // 执行验证器（同步）
      const result = rule.validator(value, context)

      // 如果是 Promise，抛出错误
      if (result instanceof Promise) {
        throw new Error(`Rule "${rule.name}" is async, use validate() instead of validateSync()`)
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
}

/**
 * 创建 Validator 实例
 */
export function createValidator<T = any>(): Validator<T> {
  return new Validator<T>()
}

