import type { Schema, SchemaRule, SchemaValidationResult, ValidationError, ValidationContext } from '../types'
import * as rules from '../rules'
import { type Transformer, createTransformer } from '../core/Transformer'

/**
 * Schema 验证器选项
 */
export interface SchemaValidatorOptions {
  /**
   * 是否在第一个错误时停止验证
   * @default false
   */
  stopOnFirstError?: boolean

  /**
   * 是否自动转换数据
   * @default false
   */
  autoTransform?: boolean
}

/**
 * Schema 验证器
 * 用于验证对象数据结构，支持转换器、数组元素验证等高级功能
 * 
 * @example
 * ```typescript
 * const schema = {
 *   email: {
 *     type: 'email',
 *     required: true,
 *     transform: ['trim', 'toLowerCase']
 *   },
 *   tags: {
 *     type: 'array',
 *     items: { type: 'string', minLength: 2 }
 *   }
 * }
 * 
 * const validator = createSchemaValidator(schema, { autoTransform: true })
 * const result = await validator.validate({ email: '  USER@EXAMPLE.COM  ', tags: ['vue', 'react'] })
 * ```
 */
export class SchemaValidator {
  private schema: Schema
  private options: SchemaValidatorOptions

  constructor(schema: Schema, options: SchemaValidatorOptions = {}) {
    this.schema = schema
    this.options = {
      stopOnFirstError: options.stopOnFirstError ?? false,
      autoTransform: options.autoTransform ?? false,
    }
  }

  /**
   * 验证数据
   * @param data 要验证的数据对象
   * @param context 验证上下文
   * @returns 验证结果
   */
  async validate(data: Record<string, any>, context?: ValidationContext): Promise<SchemaValidationResult> {
    const errors: ValidationError[] = []
    const errorMap: Record<string, ValidationError[]> = {}
    const transformedData = { ...data }

    for (const [field, ruleOrRules] of Object.entries(this.schema)) {
      const fieldRules = Array.isArray(ruleOrRules) ? ruleOrRules : [ruleOrRules]
      let value = data[field]

      for (const rule of fieldRules) {
        // 应用默认值
        if (value === undefined && rule.default !== undefined) {
          value = rule.default
          transformedData[field] = value
        }

        // 应用数据转换
        if (this.options.autoTransform && rule.transform) {
          value = this.applyTransform(value, rule.transform)
          transformedData[field] = value
        }

        const result = await this.validateField(field, value, rule, {
          ...context,
          field,
          formData: transformedData,
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

          // 如果设置了停止选项，立即返回
          if (this.options.stopOnFirstError) {
            return {
              valid: false,
              errors,
              errorMap,
            }
          }

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
   * 应用数据转换
   * @param value 原始值
   * @param transform 转换配置
   * @returns 转换后的值
   */
  private applyTransform(value: any, transform: string[] | ((value: any) => any)): any {
    // 如果是自定义函数，直接调用
    if (typeof transform === 'function') {
      return transform(value)
    }

    // 如果是转换器名称数组，应用预设转换
    if (Array.isArray(transform)) {
      const transformer = createTransformer()
      
      for (const name of transform) {
        switch (name) {
          case 'trim':
            transformer.trim()
            break
          case 'toLowerCase':
            transformer.toLowerCase()
            break
          case 'toUpperCase':
            transformer.toUpperCase()
            break
          case 'toNumber':
            transformer.toNumber()
            break
          case 'toInteger':
            transformer.toInteger()
            break
          case 'toFloat':
            transformer.toFloat()
            break
          case 'toBoolean':
            transformer.toBoolean()
            break
          case 'toDate':
            transformer.toDate()
            break
          default:
            console.warn(`Unknown transformer: ${name}`)
        }
      }

      return transformer.transform(value)
    }

    return value
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

    // 数组元素验证
    if (rule.items && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const itemResult = await this.validateField(
          `${field}[${i}]`,
          value[i],
          rule.items,
          context
        )
        
        if (!itemResult.valid) {
          return {
            valid: false,
            message: rule.message || `数组元素 [${i}] 验证失败: ${itemResult.message}`,
            code: itemResult.code || 'ARRAY_ITEM_INVALID',
          }
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
 * @param schema Schema 定义
 * @param options 验证器选项
 * @returns SchemaValidator 实例
 * 
 * @example
 * ```typescript
 * const schema = {
 *   email: {
 *     type: 'email',
 *     required: true,
 *     transform: ['trim', 'toLowerCase']
 *   },
 *   age: {
 *     type: 'number',
 *     min: 18,
 *     max: 100,
 *     default: 18
 *   },
 *   tags: {
 *     type: 'array',
 *     items: {
 *       type: 'string',
 *       minLength: 2
 *     }
 *   }
 * }
 * 
 * const validator = createSchemaValidator(schema, {
 *   autoTransform: true,
 *   stopOnFirstError: false
 * })
 * 
 * const result = await validator.validate({
 *   email: '  USER@EXAMPLE.COM  ',
 *   tags: ['vue', 'react', 'angular']
 * })
 * ```
 */
export function createSchemaValidator(schema: Schema, options?: SchemaValidatorOptions): SchemaValidator {
  return new SchemaValidator(schema, options)
}






