import type { ValidatorFunction } from '../types'

/**
 * 字符串类型验证
 */
export const isString: ValidatorFunction = (value) => {
  const valid = typeof value === 'string'

  return {
    valid,
    message: valid ? undefined : '必须是字符串类型',
    code: 'NOT_STRING',
  }
}

/**
 * 数字类型验证
 */
export const isNumber: ValidatorFunction = (value) => {
  const valid = typeof value === 'number' && !Number.isNaN(value)

  return {
    valid,
    message: valid ? undefined : '必须是数字类型',
    code: 'NOT_NUMBER',
  }
}

/**
 * 布尔类型验证
 */
export const isBoolean: ValidatorFunction = (value) => {
  const valid = typeof value === 'boolean'

  return {
    valid,
    message: valid ? undefined : '必须是布尔类型',
    code: 'NOT_BOOLEAN',
  }
}

/**
 * 数组类型验证
 */
export const isArray: ValidatorFunction = (value) => {
  const valid = Array.isArray(value)

  return {
    valid,
    message: valid ? undefined : '必须是数组类型',
    code: 'NOT_ARRAY',
  }
}

/**
 * 对象类型验证（不包括 null 和数组）
 */
export const isObject: ValidatorFunction = (value) => {
  const valid = typeof value === 'object' && value !== null && !Array.isArray(value)

  return {
    valid,
    message: valid ? undefined : '必须是对象类型',
    code: 'NOT_OBJECT',
  }
}

/**
 * null 检查
 */
export const isNull: ValidatorFunction = (value) => {
  const valid = value === null

  return {
    valid,
    message: valid ? undefined : '必须是 null',
    code: 'NOT_NULL',
  }
}

/**
 * undefined 检查
 */
export const isUndefined: ValidatorFunction = (value) => {
  const valid = value === undefined

  return {
    valid,
    message: valid ? undefined : '必须是 undefined',
    code: 'NOT_UNDEFINED',
  }
}

/**
 * 函数类型验证
 */
export const isFunction: ValidatorFunction = (value) => {
  const valid = typeof value === 'function'

  return {
    valid,
    message: valid ? undefined : '必须是函数类型',
    code: 'NOT_FUNCTION',
  }
}

/**
 * Symbol 类型验证
 */
export const isSymbol: ValidatorFunction = (value) => {
  const valid = typeof value === 'symbol'

  return {
    valid,
    message: valid ? undefined : '必须是 Symbol 类型',
    code: 'NOT_SYMBOL',
  }
}

/**
 * Date 对象验证
 */
export const isDate: ValidatorFunction = (value) => {
  const valid = value instanceof Date && !Number.isNaN(value.getTime())

  return {
    valid,
    message: valid ? undefined : '必须是有效的 Date 对象',
    code: 'NOT_DATE',
  }
}



