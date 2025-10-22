import type { Schema, SchemaRule, SchemaValidationResult, ValidationError, ValidationContext } from '../types'
import * as rules from '../rules'

/**
 * Schema 验证器
 */
export class SchemaValidator {
  private schema: Schema

  constructor(schema: Schema) {
    this.schema = schema
  }

  /**
   * 验证数据
   */
  async validate(data: Record<string, any>, context?: ValidationContext): Promise<SchemaValidationResult> {
    const errors: ValidationError[] = []
    const errorMap: Record<string, ValidationError[]> = {}

    for (const [field, ruleOrRules] of Object.entries(this.schema)) {
      const fieldRules = Array.isArray(ruleOrRules) ? ruleOrRules : [ruleOrRules]
      const value = data[field]

      for (const rule of fieldRules) {
        const result = await this.validateField(field, value, rule, {
          ...context,
          field,
          formData: data,
        })

        if (!result.valid) {
          const error: ValidationError = {
            field,
            message: result.message || '验证失败',
            code: result.code,
            rule: rule.type,
          }

          errors.push(error)

          if (!errorMap[field]) {
            errorMap[field] = []
          }
          errorMap[field].push(error)

          // 遇到错误停止验证该字段
          break
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      errorMap,
    }
  }

  /**
   * 验证单个字段
   */
  private async validateField(
    field: string,
    value: any,
    rule: SchemaRule,
    context: ValidationContext,
  ): Promise<{ valid: boolean, message?: string, code?: string }> {
    // 必填验证
    if (rule.required) {
      const requiredResult = rules.required(value, context)
      if (!requiredResult.valid) {
        return {
          valid: false,
          message: rule.message || requiredResult.message,
          code: 'REQUIRED',
        }
      }
    }

    // 空值跳过
    if (value === null || value === undefined || value === '') {
      return { valid: true }
    }

    // 类型验证
    if (rule.type) {
      const typeResult = await this.validateType(value, rule.type)
      if (!typeResult.valid) {
        return {
          valid: false,
          message: rule.message || typeResult.message,
          code: typeResult.code,
        }
      }
    }

    // 最小值/长度验证
    if (rule.min !== undefined) {
      if (typeof value === 'string' || Array.isArray(value)) {
        const minLengthResult = rules.minLength(rule.min)(value, context)
        if (!minLengthResult.valid) {
          return {
            valid: false,
            message: rule.message || minLengthResult.message,
            code: 'MIN_LENGTH',
          }
        }
      }
      else if (typeof value === 'number') {
        const minResult = rules.min(rule.min)(value, context)
        if (!minResult.valid) {
          return {
            valid: false,
            message: rule.message || minResult.message,
            code: 'MIN',
          }
        }
      }
    }

    // 最大值/长度验证
    if (rule.max !== undefined) {
      if (typeof value === 'string' || Array.isArray(value)) {
        const maxLengthResult = rules.maxLength(rule.max)(value, context)
        if (!maxLengthResult.valid) {
          return {
            valid: false,
            message: rule.message || maxLengthResult.message,
            code: 'MAX_LENGTH',
          }
        }
      }
      else if (typeof value === 'number') {
        const maxResult = rules.max(rule.max)(value, context)
        if (!maxResult.valid) {
          return {
            valid: false,
            message: rule.message || maxResult.message,
            code: 'MAX',
          }
        }
      }
    }

    // 正则验证
    if (rule.pattern) {
      const patternResult = rules.pattern(rule.pattern, rule.message)(value, context)
      if (!patternResult.valid) {
        return {
          valid: false,
          message: rule.message || patternResult.message,
          code: 'PATTERN',
        }
      }
    }

    // 枚举验证
    if (rule.enum) {
      const enumResult = rules.oneOf(rule.enum, rule.message)(value, context)
      if (!enumResult.valid) {
        return {
          valid: false,
          message: rule.message || enumResult.message,
          code: 'ENUM',
        }
      }
    }

    // 自定义验证器
    if (rule.validator) {
      const customResult = await rule.validator(value, context)
      if (!customResult.valid) {
        return {
          valid: false,
          message: rule.message || customResult.message,
          code: customResult.code,
        }
      }
    }

    return { valid: true }
  }

  /**
   * 类型验证
   */
  private async validateType(value: any, type: string): Promise<{ valid: boolean, message?: string, code?: string }> {
    switch (type) {
      case 'email':
        return rules.email(value)
      case 'url':
        return rules.url(value)
      case 'number':
        return rules.numeric(value)
      case 'date':
        return rules.date(value)
      default: {
        const actualType = Array.isArray(value) ? 'array' : typeof value
        const valid = actualType === type
        return {
          valid,
          message: valid ? undefined : `类型错误，期望 ${type}，实际 ${actualType}`,
          code: 'TYPE_MISMATCH',
        }
      }
    }
  }
}

/**
 * 创建 Schema 验证器
 */
export function createSchemaValidator(schema: Schema): SchemaValidator {
  return new SchemaValidator(schema)
}

