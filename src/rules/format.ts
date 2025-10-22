import type { ValidationResult, ValidatorFunction } from '../types'

/**
 * Email 验证
 */
export const email: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const valid = emailRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的邮箱地址',
    code: 'INVALID_EMAIL',
  }
}

/**
 * URL 验证
 */
export const url: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  try {
    new URL(value)
    return { valid: true }
  }
  catch {
    return {
      valid: false,
      message: '请输入有效的 URL',
      code: 'INVALID_URL',
    }
  }
}

/**
 * 手机号验证（中国大陆）
 */
export const phone: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  const valid = phoneRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的手机号码',
    code: 'INVALID_PHONE',
  }
}

/**
 * 身份证号验证（中国大陆）
 */
export const idCard: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  // 18 位身份证号验证
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

  if (!idCardRegex.test(value)) {
    return {
      valid: false,
      message: '请输入有效的身份证号码',
      code: 'INVALID_ID_CARD',
    }
  }

  // 校验码验证
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += Number.parseInt(value[i]) * weights[i]
  }

  const checkCode = checkCodes[sum % 11]
  const valid = value[17].toUpperCase() === checkCode

  return {
    valid,
    message: valid ? undefined : '身份证号码校验位错误',
    code: 'INVALID_ID_CARD_CHECK',
  }
}

/**
 * IP 地址验证（IPv4）
 */
export const ipv4: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const ipRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  const valid = ipRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的 IPv4 地址',
    code: 'INVALID_IPV4',
  }
}

/**
 * 数字验证
 */
export const numeric: ValidatorFunction<string | number> = (value) => {
  if (value === null || value === undefined || value === '') {
    return { valid: true }
  }

  const valid = !Number.isNaN(Number(value))

  return {
    valid,
    message: valid ? undefined : '请输入有效的数字',
    code: 'NOT_NUMERIC',
  }
}

/**
 * 整数验证
 */
export const integer: ValidatorFunction<string | number> = (value) => {
  if (value === null || value === undefined || value === '') {
    return { valid: true }
  }

  const num = Number(value)
  const valid = !Number.isNaN(num) && Number.isInteger(num)

  return {
    valid,
    message: valid ? undefined : '请输入整数',
    code: 'NOT_INTEGER',
  }
}

/**
 * 字母验证
 */
export const alpha: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const alphaRegex = /^[A-Za-z]+$/
  const valid = alphaRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '只能包含字母',
    code: 'NOT_ALPHA',
  }
}

/**
 * 字母和数字验证
 */
export const alphanumeric: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const alphanumericRegex = /^[A-Za-z0-9]+$/
  const valid = alphanumericRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '只能包含字母和数字',
    code: 'NOT_ALPHANUMERIC',
  }
}

/**
 * 日期验证
 */
export const date: ValidatorFunction<string | Date> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const dateObj = value instanceof Date ? value : new Date(value)
  const valid = !Number.isNaN(dateObj.getTime())

  return {
    valid,
    message: valid ? undefined : '请输入有效的日期',
    code: 'INVALID_DATE',
  }
}

/**
 * JSON 验证
 */
export const json: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  try {
    JSON.parse(value)
    return { valid: true }
  }
  catch {
    return {
      valid: false,
      message: '请输入有效的 JSON',
      code: 'INVALID_JSON',
    }
  }
}

/**
 * 信用卡号验证（Luhn 算法）
 */
export const creditCard: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  // 移除空格和破折号
  const cardNumber = value.replace(/[\s-]/g, '')

  // 检查格式
  if (!/^\d{13,19}$/.test(cardNumber)) {
    return {
      valid: false,
      message: '请输入有效的信用卡号',
      code: 'INVALID_CREDIT_CARD',
    }
  }

  // Luhn 算法验证
  let sum = 0
  let isEven = false

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(cardNumber[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  const valid = sum % 10 === 0

  return {
    valid,
    message: valid ? undefined : '信用卡号校验失败',
    code: 'INVALID_CREDIT_CARD_CHECK',
  }
}

/**
 * 邮政编码验证（中国大陆）
 */
export const postalCode: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const postalCodeRegex = /^\d{6}$/
  const valid = postalCodeRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的邮政编码',
    code: 'INVALID_POSTAL_CODE',
  }
}

/**
 * 密码强度验证
 * 至少 8 个字符，包含大小写字母、数字和特殊字符
 */
export const strongPassword: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const hasLower = /[a-z]/.test(value)
  const hasUpper = /[A-Z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
  const isLongEnough = value.length >= 8

  const valid = hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough

  if (!valid) {
    let message = '密码必须包含：'
    const missing = []
    if (!isLongEnough) {
      missing.push('至少8个字符')
    }
    if (!hasLower) {
      missing.push('小写字母')
    }
    if (!hasUpper) {
      missing.push('大写字母')
    }
    if (!hasNumber) {
      missing.push('数字')
    }
    if (!hasSpecial) {
      missing.push('特殊字符')
    }
    message += missing.join('、')

    return {
      valid: false,
      message,
      code: 'WEAK_PASSWORD',
    }
  }

  return { valid: true }
}

/**
 * 相等验证（用于确认密码）
 */
export function equals(compareValue: any, message?: string): ValidatorFunction {
  return (value) => {
    const valid = value === compareValue

    return {
      valid,
      message: valid ? undefined : message || '两次输入不一致',
      code: 'NOT_EQUAL',
    }
  }
}

