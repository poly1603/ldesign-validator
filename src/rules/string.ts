import type { ValidatorFunction } from '../types'

/**
 * 精确长度验证
 */
export function length(exactLength: number): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }

    const valid = value.length === exactLength

    return {
      valid,
      message: valid ? undefined : `长度必须为 ${exactLength} 个字符`,
      code: 'EXACT_LENGTH',
    }
  }
}

/**
 * 前缀验证
 */
export function startsWith(prefix: string, message?: string): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }

    const valid = value.startsWith(prefix)

    return {
      valid,
      message: valid ? undefined : message || `必须以 "${prefix}" 开头`,
      code: 'STARTS_WITH',
    }
  }
}

/**
 * 后缀验证
 */
export function endsWith(suffix: string, message?: string): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }

    const valid = value.endsWith(suffix)

    return {
      valid,
      message: valid ? undefined : message || `必须以 "${suffix}" 结尾`,
      code: 'ENDS_WITH',
    }
  }
}

/**
 * 包含子串验证
 */
export function contains(substring: string, message?: string): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }

    const valid = value.includes(substring)

    return {
      valid,
      message: valid ? undefined : message || `必须包含 "${substring}"`,
      code: 'CONTAINS',
    }
  }
}

/**
 * 不包含子串验证
 */
export function notContains(substring: string, message?: string): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }

    const valid = !value.includes(substring)

    return {
      valid,
      message: valid ? undefined : message || `不能包含 "${substring}"`,
      code: 'NOT_CONTAINS',
    }
  }
}

/**
 * 去除首尾空格后验证（返回转换后的验证器）
 */
export function trim(): ValidatorFunction<string> {
  return (value) => {
    if (!value) {
      return { valid: true }
    }

    const trimmed = value.trim()
    const valid = trimmed === value

    return {
      valid,
      message: valid ? undefined : '不能包含首尾空格',
      code: 'TRIM',
    }
  }
}



