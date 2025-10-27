/**
 * 跨字段验证规则
 * 用于验证字段之间的关系和依赖
 */

import type { ValidatorFunction, ValidationContext } from '../types'

/**
 * 从上下文中获取字段值
 * @param fieldPath 字段路径，支持点号访问嵌套字段
 * @param context 验证上下文
 * @returns 字段值
 */
function getFieldValue(fieldPath: string, context?: ValidationContext): any {
  if (!context?.formData) {
    return undefined
  }

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

/**
 * 字段匹配验证
 * 验证当前字段值是否与另一个字段的值相等
 * 常用于确认密码、确认邮箱等场景
 * 
 * @param fieldPath 要匹配的字段路径
 * @param message 自定义错误消息
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const confirmPasswordValidator = createValidator<string>()
 *   .rule({ validator: rules.matchField('password', '两次密码输入不一致') })
 * 
 * await confirmPasswordValidator.validate('password123', {
 *   formData: {
 *     password: 'password123',
 *     confirmPassword: 'password123'
 *   }
 * })
 * ```
 */
export function matchField(fieldPath: string, message?: string): ValidatorFunction {
  return (value, context) => {
    const compareValue = getFieldValue(fieldPath, context)
    const valid = value === compareValue

    return {
      valid,
      message: valid ? undefined : message || `必须与字段 "${fieldPath}" 的值相同`,
      code: 'FIELD_MISMATCH',
      meta: { fieldPath, compareValue },
    }
  }
}

/**
 * 大于指定字段验证
 * 验证当前字段值是否大于另一个字段的值
 * 
 * @param fieldPath 要比较的字段路径
 * @param options 验证选项
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const endDateValidator = createValidator<Date>()
 *   .rule({ validator: rules.greaterThan('startDate', { message: '结束日期必须大于开始日期' }) })
 * 
 * await endDateValidator.validate(new Date('2024-12-31'), {
 *   formData: {
 *     startDate: new Date('2024-01-01'),
 *     endDate: new Date('2024-12-31')
 *   }
 * })
 * ```
 */
export function greaterThan(
  fieldPath: string,
  options?: {
    /**
     * 是否允许相等
     * @default false
     */
    allowEqual?: boolean
    /**
     * 自定义错误消息
     */
    message?: string
  }
): ValidatorFunction<number | Date> {
  return (value, context) => {
    const compareValue = getFieldValue(fieldPath, context)

    // 如果比较值不存在，跳过验证
    if (compareValue === null || compareValue === undefined) {
      return { valid: true }
    }

    // 转换为数字进行比较（支持 Date）
    const numValue = value instanceof Date ? value.getTime() : Number(value)
    const numCompare = compareValue instanceof Date ? compareValue.getTime() : Number(compareValue)

    // 检查是否为有效数字
    if (Number.isNaN(numValue) || Number.isNaN(numCompare)) {
      return {
        valid: false,
        message: '值必须是数字或日期',
        code: 'INVALID_TYPE',
      }
    }

    const valid = options?.allowEqual ? numValue >= numCompare : numValue > numCompare
    const operator = options?.allowEqual ? '>=' : '>'

    return {
      valid,
      message: valid ? undefined : options?.message || `必须${operator}字段 "${fieldPath}" 的值`,
      code: 'NOT_GREATER_THAN',
      meta: { fieldPath, compareValue, operator },
    }
  }
}

/**
 * 小于指定字段验证
 * 验证当前字段值是否小于另一个字段的值
 * 
 * @param fieldPath 要比较的字段路径
 * @param options 验证选项
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const minPriceValidator = createValidator<number>()
 *   .rule({ validator: rules.lessThan('maxPrice', { allowEqual: true }) })
 * ```
 */
export function lessThan(
  fieldPath: string,
  options?: {
    /**
     * 是否允许相等
     * @default false
     */
    allowEqual?: boolean
    /**
     * 自定义错误消息
     */
    message?: string
  }
): ValidatorFunction<number | Date> {
  return (value, context) => {
    const compareValue = getFieldValue(fieldPath, context)

    // 如果比较值不存在，跳过验证
    if (compareValue === null || compareValue === undefined) {
      return { valid: true }
    }

    // 转换为数字进行比较（支持 Date）
    const numValue = value instanceof Date ? value.getTime() : Number(value)
    const numCompare = compareValue instanceof Date ? compareValue.getTime() : Number(compareValue)

    // 检查是否为有效数字
    if (Number.isNaN(numValue) || Number.isNaN(numCompare)) {
      return {
        valid: false,
        message: '值必须是数字或日期',
        code: 'INVALID_TYPE',
      }
    }

    const valid = options?.allowEqual ? numValue <= numCompare : numValue < numCompare
    const operator = options?.allowEqual ? '<=' : '<'

    return {
      valid,
      message: valid ? undefined : options?.message || `必须${operator}字段 "${fieldPath}" 的值`,
      code: 'NOT_LESS_THAN',
      meta: { fieldPath, compareValue, operator },
    }
  }
}

/**
 * 日期晚于指定字段验证
 * 验证当前日期是否晚于另一个日期字段
 * 
 * @param fieldPath 要比较的日期字段路径
 * @param options 验证选项
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const endDateValidator = createValidator<Date>()
 *   .rule({ validator: rules.afterDate('startDate') })
 * ```
 */
export function afterDate(
  fieldPath: string,
  options?: {
    /**
     * 是否允许相等（同一天）
     * @default false
     */
    allowSameDate?: boolean
    /**
     * 自定义错误消息
     */
    message?: string
  }
): ValidatorFunction<string | Date> {
  return (value, context) => {
    const compareValue = getFieldValue(fieldPath, context)

    // 如果比较值不存在，跳过验证
    if (!compareValue) {
      return { valid: true }
    }

    // 转换为 Date 对象
    const date1 = value instanceof Date ? value : new Date(value)
    const date2 = compareValue instanceof Date ? compareValue : new Date(compareValue)

    // 检查是否为有效日期
    if (Number.isNaN(date1.getTime()) || Number.isNaN(date2.getTime())) {
      return {
        valid: false,
        message: '必须是有效的日期',
        code: 'INVALID_DATE',
      }
    }

    const valid = options?.allowSameDate
      ? date1.getTime() >= date2.getTime()
      : date1.getTime() > date2.getTime()

    return {
      valid,
      message: valid ? undefined : options?.message || `日期必须晚于 "${fieldPath}"`,
      code: 'DATE_NOT_AFTER',
      meta: { fieldPath, compareValue },
    }
  }
}

/**
 * 日期早于指定字段验证
 * 验证当前日期是否早于另一个日期字段
 * 
 * @param fieldPath 要比较的日期字段路径
 * @param options 验证选项
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const startDateValidator = createValidator<Date>()
 *   .rule({ validator: rules.beforeDate('endDate') })
 * ```
 */
export function beforeDate(
  fieldPath: string,
  options?: {
    /**
     * 是否允许相等（同一天）
     * @default false
     */
    allowSameDate?: boolean
    /**
     * 自定义错误消息
     */
    message?: string
  }
): ValidatorFunction<string | Date> {
  return (value, context) => {
    const compareValue = getFieldValue(fieldPath, context)

    // 如果比较值不存在，跳过验证
    if (!compareValue) {
      return { valid: true }
    }

    // 转换为 Date 对象
    const date1 = value instanceof Date ? value : new Date(value)
    const date2 = compareValue instanceof Date ? compareValue : new Date(compareValue)

    // 检查是否为有效日期
    if (Number.isNaN(date1.getTime()) || Number.isNaN(date2.getTime())) {
      return {
        valid: false,
        message: '必须是有效的日期',
        code: 'INVALID_DATE',
      }
    }

    const valid = options?.allowSameDate
      ? date1.getTime() <= date2.getTime()
      : date1.getTime() < date2.getTime()

    return {
      valid,
      message: valid ? undefined : options?.message || `日期必须早于 "${fieldPath}"`,
      code: 'DATE_NOT_BEFORE',
      meta: { fieldPath, compareValue },
    }
  }
}

/**
 * 字段依赖验证
 * 当指定字段有值时，当前字段也必须有值
 * 
 * @param fieldPath 依赖的字段路径
 * @param message 自定义错误消息
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const cityValidator = createValidator<string>()
 *   .rule({ validator: rules.requiredIf('country', '选择了国家时，必须选择城市') })
 * ```
 */
export function requiredIf(fieldPath: string, message?: string): ValidatorFunction {
  return (value, context) => {
    const dependValue = getFieldValue(fieldPath, context)

    // 如果依赖字段没有值，当前字段不是必需的
    if (!dependValue) {
      return { valid: true }
    }

    // 如果依赖字段有值，当前字段也必须有值
    const valid = value !== null && value !== undefined && value !== ''

    return {
      valid,
      message: valid ? undefined : message || `当 "${fieldPath}" 有值时，此字段为必填项`,
      code: 'REQUIRED_IF',
      meta: { fieldPath, dependValue },
    }
  }
}

/**
 * 字段排斥验证
 * 当前字段有值时，指定字段不能有值（两者互斥）
 * 
 * @param fieldPath 互斥的字段路径
 * @param message 自定义错误消息
 * @returns 验证器函数
 * 
 * @example
 * ```typescript
 * const emailValidator = createValidator<string>()
 *   .rule({ validator: rules.excludesWith('phone', '邮箱和手机号只能填写一个') })
 * ```
 */
export function excludesWith(fieldPath: string, message?: string): ValidatorFunction {
  return (value, context) => {
    // 当前字段没有值，不需要检查
    const hasValue = value !== null && value !== undefined && value !== ''
    if (!hasValue) {
      return { valid: true }
    }

    const excludeValue = getFieldValue(fieldPath, context)
    const excludeHasValue = excludeValue !== null && excludeValue !== undefined && excludeValue !== ''

    const valid = !excludeHasValue

    return {
      valid,
      message: valid ? undefined : message || `不能与字段 "${fieldPath}" 同时存在`,
      code: 'FIELD_EXCLUDES',
      meta: { fieldPath, excludeValue },
    }
  }
}




