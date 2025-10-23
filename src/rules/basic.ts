import type { ValidationResult, ValidatorFunction } from '../types'

/**
 * 必填验证
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






