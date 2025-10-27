import type { ValidationResult, ValidatorFunction } from '../types'

/**
 * 必填验证
 * 验证值不能为 null、undefined 或空字符串
 * 
 * @example
 * ```typescript
 * const validator = createValidator()
 *   .rule({ validator: rules.required })
 * 
 * await validator.validate('hello') // 通过
 * await validator.validate('') // 失败
 * await validator.validate(null) // 失败
 * ```
 */
export const required: ValidatorFunction = (value) => {
  const valid = value !== null && value !== undefined && value !== ''
  return {
    valid,
    message: valid ? undefined : '此字段是必填项',
    code: 'REQUIRED',
  }
}

/**
 * 字符串最小长度验证
 * 验证字符串长度是否大于等于指定值
 * 
 * @param min 最小长度
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const validator = createValidator()
 *   .rule({ validator: rules.minLength(8) })
 * 
 * await validator.validate('password') // 通过（8个字符）
 * await validator.validate('pass') // 失败（4个字符）
 * ```
 */
export function minLength(min: number): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }
    const valid = value.length >= min
    return {
      valid,
      message: valid ? undefined : `最小长度为 ${min} 个字符`,
      code: 'MIN_LENGTH',
    }
  }
}

/**
 * 字符串最大长度验证
 * 验证字符串长度是否小于等于指定值
 * 
 * @param max 最大长度
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const validator = createValidator()
 *   .rule({ validator: rules.maxLength(20) })
 * 
 * await validator.validate('short') // 通过
 * await validator.validate('this is a very long text that exceeds limit') // 失败
 * ```
 */
export function maxLength(max: number): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }
    const valid = value.length <= max
    return {
      valid,
      message: valid ? undefined : `最大长度为 ${max} 个字符`,
      code: 'MAX_LENGTH',
    }
  }
}

/**
 * 数字范围验证
 */
export function range(min: number, max: number): ValidatorFunction<number> {
  return (value) => {
    if (value === null || value === undefined) {
      return { valid: true }
    }
    const valid = value >= min && value <= max
    return {
      valid,
      message: valid ? undefined : `数值必须在 ${min} 到 ${max} 之间`,
      code: 'RANGE',
    }
  }
}

/**
 * 最小值验证
 */
export function min(minValue: number): ValidatorFunction<number> {
  return (value) => {
    if (value === null || value === undefined) {
      return { valid: true }
    }
    const valid = value >= minValue
    return {
      valid,
      message: valid ? undefined : `数值不能小于 ${minValue}`,
      code: 'MIN',
    }
  }
}

/**
 * 最大值验证
 */
export function max(maxValue: number): ValidatorFunction<number> {
  return (value) => {
    if (value === null || value === undefined) {
      return { valid: true }
    }
    const valid = value <= maxValue
    return {
      valid,
      message: valid ? undefined : `数值不能大于 ${maxValue}`,
      code: 'MAX',
    }
  }
}

/**
 * 正则表达式验证
 */
export function pattern(regex: RegExp, message?: string): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }
    const valid = regex.test(value)
    return {
      valid,
      message: valid ? undefined : message || '格式不正确',
      code: 'PATTERN',
    }
  }
}

/**
 * 枚举值验证
 */
export function oneOf<T>(values: T[], message?: string): ValidatorFunction<T> {
  return (value) => {
    const valid = values.includes(value)
    return {
      valid,
      message: valid ? undefined : message || `值必须是 ${values.join(', ')} 之一`,
      code: 'ONE_OF',
    }
  }
}

/**
 * 数组长度验证
 */
export function arrayLength(min?: number, max?: number): ValidatorFunction<any[]> {
  return (value) => {
    if (!Array.isArray(value)) {
      return { valid: false, message: '必须是数组', code: 'NOT_ARRAY' }
    }

    if (min !== undefined && value.length < min) {
      return {
        valid: false,
        message: `数组长度不能少于 ${min}`,
        code: 'ARRAY_MIN_LENGTH',
      }
    }

    if (max !== undefined && value.length > max) {
      return {
        valid: false,
        message: `数组长度不能超过 ${max}`,
        code: 'ARRAY_MAX_LENGTH',
      }
    }

    return { valid: true }
  }
}

/**
 * 类型验证
 * @param expectedType 期望的类型
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const validator = createValidator()
 *   .rule({ validator: type('string') })
 * ```
 */
export function type(expectedType: string): ValidatorFunction {
  return (value) => {
    const actualType = typeof value
    const valid = actualType === expectedType
    return {
      valid,
      message: valid ? undefined : `类型错误，期望 ${expectedType}，实际 ${actualType}`,
      code: 'TYPE_MISMATCH',
    }
  }
}

/**
 * 数组元素验证
 * 验证数组中的每个元素是否符合指定的验证器
 * 
 * @param itemValidator 元素验证器函数
 * @param options 验证选项
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * import { createValidator, rules } from '@ldesign/validator'
 * 
 * // 验证邮箱数组
 * const emailListValidator = createValidator<string[]>()
 *   .rule({ validator: rules.arrayOf(rules.email) })
 * 
 * await emailListValidator.validate(['user1@example.com', 'user2@example.com'])
 * 
 * // 验证数字数组范围
 * const numberListValidator = createValidator<number[]>()
 *   .rule({ validator: rules.arrayOf(rules.range(0, 100)) })
 * ```
 */
export function arrayOf(
  itemValidator: ValidatorFunction,
  options?: {
    /**
     * 是否在第一个错误时停止验证
     * @default true
     */
    stopOnFirstError?: boolean
    /**
     * 自定义错误消息模板
     * 可以使用 {index} 占位符表示错误元素的索引
     */
    message?: string
  }
): ValidatorFunction<any[]> {
  const stopOnFirst = options?.stopOnFirstError ?? true

  return async (value, context) => {
    // 检查是否为数组
    if (!Array.isArray(value)) {
      return {
        valid: false,
        message: '必须是数组类型',
        code: 'NOT_ARRAY',
      }
    }

    // 空数组默认通过
    if (value.length === 0) {
      return { valid: true }
    }

    const errors: Array<{ index: number, message?: string, code?: string }> = []

    // 验证每个元素
    for (let i = 0; i < value.length; i++) {
      const item = value[i]
      const result = await itemValidator(item, context)

      if (!result.valid) {
        errors.push({
          index: i,
          message: result.message,
          code: result.code,
        })

        // 如果需要在第一个错误时停止
        if (stopOnFirst) {
          break
        }
      }
    }

    // 如果有错误
    if (errors.length > 0) {
      const firstError = errors[0]
      let message = options?.message

      // 如果有自定义消息模板，替换占位符
      if (message) {
        message = message.replace('{index}', String(firstError.index))
      }
      else {
        message = `数组元素 [${firstError.index}] 验证失败: ${firstError.message || '未知错误'}`
      }

      return {
        valid: false,
        message,
        code: firstError.code || 'ARRAY_ITEM_INVALID',
        meta: { errors },
      }
    }

    return { valid: true }
  }
}

/**
 * 数组唯一性验证
 * 验证数组中的所有元素是否唯一（无重复）
 * 
 * @param options 验证选项
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const validator = createValidator<string[]>()
 *   .rule({ validator: rules.arrayUnique() })
 * 
 * await validator.validate(['a', 'b', 'c']) // 通过
 * await validator.validate(['a', 'b', 'a']) // 失败：有重复元素
 * ```
 */
export function arrayUnique<T = any>(options?: {
  /**
   * 自定义比较函数，用于判断两个元素是否相等
   * 默认使用 === 比较
   */
  compareFn?: (a: T, b: T) => boolean
  /**
   * 自定义错误消息
   */
  message?: string
}): ValidatorFunction<T[]> {
  return (value) => {
    if (!Array.isArray(value)) {
      return {
        valid: false,
        message: '必须是数组类型',
        code: 'NOT_ARRAY',
      }
    }

    const compareFn = options?.compareFn || ((a, b) => a === b)
    const seen = new Set<any>()

    for (let i = 0; i < value.length; i++) {
      const item = value[i]

      // 如果没有自定义比较函数，使用 Set 快速检查
      if (!options?.compareFn) {
        if (seen.has(item)) {
          return {
            valid: false,
            message: options?.message || `数组包含重复元素: ${item}`,
            code: 'ARRAY_NOT_UNIQUE',
            meta: { duplicate: item, index: i },
          }
        }
        seen.add(item)
      }
      // 使用自定义比较函数
      else {
        for (let j = 0; j < i; j++) {
          if (compareFn(item, value[j])) {
            return {
              valid: false,
              message: options?.message || `数组包含重复元素（索引 ${j} 和 ${i}）`,
              code: 'ARRAY_NOT_UNIQUE',
              meta: { duplicate: item, indices: [j, i] },
            }
          }
        }
      }
    }

    return { valid: true }
  }
}






