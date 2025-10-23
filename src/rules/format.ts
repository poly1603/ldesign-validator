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

/**
 * UUID 验证（支持 v1/v3/v4/v5）
 */
export const uuid: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const valid = uuidRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的 UUID',
    code: 'INVALID_UUID',
  }
}

/**
 * MAC 地址验证
 */
export const mac: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  // 支持多种格式: 00:1A:2B:3C:4D:5E, 00-1A-2B-3C-4D-5E, 001A.2B3C.4D5E
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$/
  const valid = macRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的 MAC 地址',
    code: 'INVALID_MAC',
  }
}

/**
 * 端口号验证（1-65535）
 */
export const port: ValidatorFunction<string | number> = (value) => {
  if (value === null || value === undefined || value === '') {
    return { valid: true }
  }

  const portNum = Number(value)
  const valid = !Number.isNaN(portNum) && Number.isInteger(portNum) && portNum >= 1 && portNum <= 65535

  return {
    valid,
    message: valid ? undefined : '端口号必须在 1-65535 之间',
    code: 'INVALID_PORT',
  }
}

/**
 * MD5 哈希验证
 */
export const md5: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const md5Regex = /^[a-f0-9]{32}$/i
  const valid = md5Regex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的 MD5 哈希',
    code: 'INVALID_MD5',
  }
}

/**
 * SHA1 哈希验证
 */
export const sha1: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const sha1Regex = /^[a-f0-9]{40}$/i
  const valid = sha1Regex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的 SHA1 哈希',
    code: 'INVALID_SHA1',
  }
}

/**
 * SHA256 哈希验证
 */
export const sha256: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const sha256Regex = /^[a-f0-9]{64}$/i
  const valid = sha256Regex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的 SHA256 哈希',
    code: 'INVALID_SHA256',
  }
}

/**
 * SHA512 哈希验证
 */
export const sha512: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const sha512Regex = /^[a-f0-9]{128}$/i
  const valid = sha512Regex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的 SHA512 哈希',
    code: 'INVALID_SHA512',
  }
}

/**
 * 十六进制字符串验证
 */
export const hex: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const hexRegex = /^[0-9A-Fa-f]+$/
  const valid = hexRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '只能包含十六进制字符（0-9, A-F）',
    code: 'NOT_HEX',
  }
}

/**
 * 十六进制颜色验证（#RGB, #RRGGBB, #RRGGBBAA）
 */
export const hexColor: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/
  const valid = hexColorRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的十六进制颜色值',
    code: 'INVALID_HEX_COLOR',
  }
}

/**
 * Base64 编码验证
 */
export const base64: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const base64Regex = /^[A-Za-z0-9+/]*(=|==)?$/
  const valid = base64Regex.test(value) && value.length % 4 === 0

  return {
    valid,
    message: valid ? undefined : '请输入有效的 Base64 编码',
    code: 'INVALID_BASE64',
  }
}

/**
 * JWT Token 验证
 */
export const jwt: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  // JWT 格式: header.payload.signature
  const parts = value.split('.')
  if (parts.length !== 3) {
    return {
      valid: false,
      message: '请输入有效的 JWT Token',
      code: 'INVALID_JWT',
    }
  }

  // 验证每部分都是 Base64
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/
  const valid = parts.every(part => base64UrlRegex.test(part))

  return {
    valid,
    message: valid ? undefined : '请输入有效的 JWT Token',
    code: 'INVALID_JWT',
  }
}

/**
 * IBAN（国际银行账号）验证
 */
export const iban: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  // 移除空格
  const cleanIban = value.replace(/\s/g, '').toUpperCase()

  // 基本格式验证：2位国家代码 + 2位校验码 + 最多30位账号
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/
  if (!ibanRegex.test(cleanIban)) {
    return {
      valid: false,
      message: '请输入有效的 IBAN',
      code: 'INVALID_IBAN',
    }
  }

  // MOD-97 校验
  const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4)
  const numericString = rearranged.replace(/[A-Z]/g, char => String(char.charCodeAt(0) - 55))

  let remainder = ''
  for (const digit of numericString) {
    remainder += digit
    remainder = String(Number.parseInt(remainder, 10) % 97)
  }

  const valid = Number.parseInt(remainder, 10) === 1

  return {
    valid,
    message: valid ? undefined : 'IBAN 校验失败',
    code: 'INVALID_IBAN_CHECK',
  }
}

/**
 * ISBN（国际标准书号）验证（ISBN-10/ISBN-13）
 */
export const isbn: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  // 移除破折号和空格
  const cleanIsbn = value.replace(/[-\s]/g, '')

  if (cleanIsbn.length === 10) {
    // ISBN-10 验证
    let sum = 0
    for (let i = 0; i < 9; i++) {
      const digit = Number.parseInt(cleanIsbn[i], 10)
      if (Number.isNaN(digit)) {
        return {
          valid: false,
          message: '请输入有效的 ISBN',
          code: 'INVALID_ISBN',
        }
      }
      sum += digit * (10 - i)
    }

    const checkChar = cleanIsbn[9].toUpperCase()
    const checkDigit = checkChar === 'X' ? 10 : Number.parseInt(checkChar, 10)
    if (Number.isNaN(checkDigit)) {
      return {
        valid: false,
        message: '请输入有效的 ISBN',
        code: 'INVALID_ISBN',
      }
    }

    sum += checkDigit
    const valid = sum % 11 === 0

    return {
      valid,
      message: valid ? undefined : 'ISBN-10 校验失败',
      code: 'INVALID_ISBN_CHECK',
    }
  }
  else if (cleanIsbn.length === 13) {
    // ISBN-13 验证
    let sum = 0
    for (let i = 0; i < 13; i++) {
      const digit = Number.parseInt(cleanIsbn[i], 10)
      if (Number.isNaN(digit)) {
        return {
          valid: false,
          message: '请输入有效的 ISBN',
          code: 'INVALID_ISBN',
        }
      }
      sum += digit * (i % 2 === 0 ? 1 : 3)
    }

    const valid = sum % 10 === 0

    return {
      valid,
      message: valid ? undefined : 'ISBN-13 校验失败',
      code: 'INVALID_ISBN_CHECK',
    }
  }

  return {
    valid: false,
    message: 'ISBN 长度必须为 10 或 13 位',
    code: 'INVALID_ISBN_LENGTH',
  }
}

/**
 * ISSN（国际标准刊号）验证
 */
export const issn: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  // 移除破折号和空格
  const cleanIssn = value.replace(/[-\s]/g, '')

  if (cleanIssn.length !== 8) {
    return {
      valid: false,
      message: 'ISSN 长度必须为 8 位',
      code: 'INVALID_ISSN_LENGTH',
    }
  }

  // 计算校验位
  let sum = 0
  for (let i = 0; i < 7; i++) {
    const digit = Number.parseInt(cleanIssn[i], 10)
    if (Number.isNaN(digit)) {
      return {
        valid: false,
        message: '请输入有效的 ISSN',
        code: 'INVALID_ISSN',
      }
    }
    sum += digit * (8 - i)
  }

  const checkChar = cleanIssn[7].toUpperCase()
  const checkDigit = checkChar === 'X' ? 10 : Number.parseInt(checkChar, 10)
  if (Number.isNaN(checkDigit)) {
    return {
      valid: false,
      message: '请输入有效的 ISSN',
      code: 'INVALID_ISSN',
    }
  }

  sum += checkDigit
  const valid = sum % 11 === 0

  return {
    valid,
    message: valid ? undefined : 'ISSN 校验失败',
    code: 'INVALID_ISSN_CHECK',
  }
}

/**
 * IPv6 地址验证
 */
export const ipv6: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  // 完整 IPv6 格式
  const fullIpv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i

  // 压缩 IPv6 格式（包含 ::）
  const compressedIpv6Regex = /^(([0-9a-f]{1,4}:){1,7}:|([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:))$/i

  const valid = fullIpv6Regex.test(value) || compressedIpv6Regex.test(value)

  return {
    valid,
    message: valid ? undefined : '请输入有效的 IPv6 地址',
    code: 'INVALID_IPV6',
  }
}

/**
 * 纯小写字母验证
 */
export const lowercase: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const lowercaseRegex = /^[a-z]+$/
  const valid = lowercaseRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '只能包含小写字母',
    code: 'NOT_LOWERCASE',
  }
}

/**
 * 纯大写字母验证
 */
export const uppercase: ValidatorFunction<string> = (value) => {
  if (!value) {
    return { valid: true }
  }

  const uppercaseRegex = /^[A-Z]+$/
  const valid = uppercaseRegex.test(value)

  return {
    valid,
    message: valid ? undefined : '只能包含大写字母',
    code: 'NOT_UPPERCASE',
  }
}






