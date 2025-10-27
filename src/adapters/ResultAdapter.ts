/**
 * 验证结果适配器
 * 将验证结果转换为不同 UI 框架所需的格式
 */

import type { ValidationResult, SchemaValidationResult } from '../types'

/**
 * Ant Design Form 验证结果格式
 */
export interface AntdValidationResult {
  validateStatus?: 'success' | 'error' | 'warning' | 'validating'
  help?: string
  hasFeedback?: boolean
}

/**
 * Element Plus Form 验证结果格式
 */
export interface ElementValidationResult {
  message?: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

/**
 * VeeValidate 验证结果格式
 */
export interface VeeValidateResult {
  valid: boolean
  errors: string[]
}

/**
 * 验证结果转换器类
 * 提供多种 UI 框架的结果格式转换
 * 
 * @example
 * ```typescript
 * import { ResultAdapter } from '@ldesign/validator'
 * 
 * const result = await validator.validate('invalid-email')
 * const antdFormat = ResultAdapter.toAntd(result)
 * const elementFormat = ResultAdapter.toElement(result)
 * ```
 */
export class ResultAdapter {
  /**
   * 转换为 Ant Design Form 格式
   * @param result 验证结果
   * @returns Ant Design 格式的验证结果
   * 
   * @example
   * ```typescript
   * const result = await validator.validate('test@example.com')
   * const antdResult = ResultAdapter.toAntd(result)
   * // { validateStatus: 'success', help: undefined, hasFeedback: true }
   * ```
   */
  static toAntd(result: ValidationResult): AntdValidationResult {
    return {
      validateStatus: result.valid ? 'success' : 'error',
      help: result.message,
      hasFeedback: true,
    }
  }

  /**
   * 转换为 Element Plus Form 格式
   * @param result 验证结果
   * @returns Element Plus 格式的验证结果
   * 
   * @example
   * ```typescript
   * const result = await validator.validate('invalid')
   * const elementResult = ResultAdapter.toElement(result)
   * // { message: '验证失败', type: 'error' }
   * ```
   */
  static toElement(result: ValidationResult): ElementValidationResult {
    return {
      message: result.message,
      type: result.valid ? 'success' : 'error',
    }
  }

  /**
   * 转换为 VeeValidate 格式
   * @param result 验证结果
   * @returns VeeValidate 格式的验证结果
   * 
   * @example
   * ```typescript
   * const result = await validator.validate('test')
   * const veeResult = ResultAdapter.toVeeValidate(result)
   * // { valid: true, errors: [] }
   * ```
   */
  static toVeeValidate(result: ValidationResult): VeeValidateResult {
    return {
      valid: result.valid,
      errors: result.message ? [result.message] : [],
    }
  }

  /**
   * Schema 验证结果转换为 Ant Design Form 格式
   * @param result Schema 验证结果
   * @returns 字段错误映射
   * 
   * @example
   * ```typescript
   * const result = await schemaValidator.validate(formData)
   * const antdErrors = ResultAdapter.schemaToAntd(result)
   * // { email: { validateStatus: 'error', help: '邮箱格式不正确' } }
   * ```
   */
  static schemaToAntd(result: SchemaValidationResult): Record<string, AntdValidationResult> {
    const fieldErrors: Record<string, AntdValidationResult> = {}

    for (const [field, errors] of Object.entries(result.errorMap)) {
      if (errors.length > 0) {
        fieldErrors[field] = {
          validateStatus: 'error',
          help: errors[0].message,
          hasFeedback: true,
        }
      }
    }

    return fieldErrors
  }

  /**
   * Schema 验证结果转换为 Element Plus Form 格式
   * @param result Schema 验证结果
   * @returns 字段错误映射
   */
  static schemaToElement(result: SchemaValidationResult): Record<string, ElementValidationResult> {
    const fieldErrors: Record<string, ElementValidationResult> = {}

    for (const [field, errors] of Object.entries(result.errorMap)) {
      if (errors.length > 0) {
        fieldErrors[field] = {
          message: errors[0].message,
          type: 'error',
        }
      }
    }

    return fieldErrors
  }

  /**
   * Schema 验证结果转换为 VeeValidate 格式
   * @param result Schema 验证结果
   * @returns 字段错误映射
   */
  static schemaToVeeValidate(result: SchemaValidationResult): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {}

    for (const [field, errors] of Object.entries(result.errorMap)) {
      fieldErrors[field] = errors.map(e => e.message)
    }

    return fieldErrors
  }

  /**
   * 转换为通用错误格式
   * 适合自定义 UI 框架使用
   * 
   * @param result 验证结果
   * @returns 通用错误格式
   */
  static toGeneric(result: ValidationResult): {
    success: boolean
    error?: string
    code?: string
    meta?: any
  } {
    return {
      success: result.valid,
      error: result.message,
      code: result.code,
      meta: result.meta,
    }
  }
}



