import type { ValidatorFunction, ValidationContext, ValidationResult } from '../types'

/**
 * 条件验证选项
 */
export interface WhenOptions {
  /**
   * 条件为真时的验证规则
   */
  then: ValidatorFunction
  /**
   * 条件为假时的验证规则（可选）
   */
  otherwise?: ValidatorFunction
}

/**
 * 条件验证
 * @param condition - 条件函数，返回 boolean
 * @param options - 验证选项
 */
export function when(
  condition: (value: any, context?: ValidationContext) => boolean,
  options: WhenOptions,
): ValidatorFunction {
  return async (value, context) => {
    const shouldApplyThen = condition(value, context)

    if (shouldApplyThen) {
      return await options.then(value, context)
    }
    else if (options.otherwise) {
      return await options.otherwise(value, context)
    }

    return { valid: true }
  }
}

/**
 * 字段引用 - 从上下文中获取其他字段的值
 * @param fieldPath - 字段路径，支持点号访问嵌套字段（如 'user.name'）
 */
export function ref(fieldPath: string): (context?: ValidationContext) => any {
  return (context?: ValidationContext) => {
    if (!context?.formData) {
      return undefined
    }

    // 支持嵌套路径访问
    const keys = fieldPath.split('.')
    let value: any = context.formData

    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined
      }
      value = value[key]
    }

    return value
  }
}

/**
 * 规则与组合 - 所有规则都必须通过
 */
export function and(...rules: ValidatorFunction[]): ValidatorFunction {
  return async (value, context) => {
    for (const rule of rules) {
      const result = await rule(value, context)
      if (!result.valid) {
        return result
      }
    }

    return { valid: true }
  }
}

/**
 * 规则或组合 - 至少一个规则通过
 */
export function or(...rules: ValidatorFunction[]): ValidatorFunction {
  return async (value, context) => {
    const errors: string[] = []

    for (const rule of rules) {
      const result = await rule(value, context)
      if (result.valid) {
        return { valid: true }
      }
      if (result.message) {
        errors.push(result.message)
      }
    }

    return {
      valid: false,
      message: `所有规则验证失败: ${errors.join('; ')}`,
      code: 'OR_ALL_FAILED',
    }
  }
}

/**
 * 规则非 - 规则必须不通过
 */
export function not(rule: ValidatorFunction, message?: string): ValidatorFunction {
  return async (value, context) => {
    const result = await rule(value, context)

    return {
      valid: !result.valid,
      message: !result.valid ? undefined : message || '值不应通过此验证',
      code: 'NOT',
    }
  }
}

/**
 * 自定义验证器工厂
 * @param fn - 自定义验证函数，返回 boolean 或 ValidationResult
 * @param message - 错误消息
 * @param code - 错误代码
 */
export function custom(
  fn: (value: any, context?: ValidationContext) => boolean | ValidationResult | Promise<boolean | ValidationResult>,
  message?: string,
  code?: string,
): ValidatorFunction {
  return async (value, context) => {
    const result = await fn(value, context)

    // 如果返回 boolean
    if (typeof result === 'boolean') {
      return {
        valid: result,
        message: result ? undefined : message || '自定义验证失败',
        code: code || 'CUSTOM',
      }
    }

    // 如果返回 ValidationResult
    return result
  }
}

/**
 * 惰性规则 - 延迟执行的验证规则
 * @param fn - 返回验证器函数的函数
 */
export function lazy(
  fn: (value: any, context?: ValidationContext) => ValidatorFunction,
): ValidatorFunction {
  return async (value, context) => {
    const validator = fn(value, context)
    return await validator(value, context)
  }
}

/**
 * 条件路由配置
 */
export interface ConditionalRoute {
  /**
   * 条件函数
   */
  condition: (value: any, context?: ValidationContext) => boolean
  /**
   * 条件为真时的验证规则
   */
  validator: ValidatorFunction
}

/**
 * 多条件路由验证
 * @param routes - 条件路由数组
 * @param defaultValidator - 默认验证器（所有条件都不满足时）
 */
export function conditional(
  routes: ConditionalRoute[],
  defaultValidator?: ValidatorFunction,
): ValidatorFunction {
  return async (value, context) => {
    // 查找第一个满足条件的路由
    for (const route of routes) {
      if (route.condition(value, context)) {
        return await route.validator(value, context)
      }
    }

    // 如果没有匹配的路由，使用默认验证器
    if (defaultValidator) {
      return await defaultValidator(value, context)
    }

    return { valid: true }
  }
}



