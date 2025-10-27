/**
 * 验证结果
 */
export interface ValidationResult {
  /**
   * 是否通过验证
   */
  valid: boolean

  /**
   * 错误消息
   */
  message?: string

  /**
   * 错误代码
   */
  code?: string

  /**
   * 附加数据
   */
  meta?: any
}

/**
 * 验证器函数
 */
export type ValidatorFunction<T = any> = (
  value: T,
  context?: ValidationContext,
) => ValidationResult | Promise<ValidationResult>

/**
 * 验证规则
 */
export interface ValidationRule<T = any> {
  /**
   * 规则名称
   */
  name?: string

  /**
   * 验证器函数
   */
  validator: ValidatorFunction<T>

  /**
   * 错误消息模板
   */
  message?: string | ((value: T, context?: ValidationContext) => string)

  /**
   * 是否必需
   */
  required?: boolean

  /**
   * 触发时机
   * @default 'change'
   */
  trigger?: 'change' | 'blur' | 'submit'
}

/**
 * 验证上下文
 */
export interface ValidationContext {
  /**
   * 字段名
   */
  field?: string

  /**
   * 字段标签
   */
  label?: string

  /**
   * 表单数据
   */
  formData?: Record<string, any>

  /**
   * 附加参数
   */
  params?: any
}

/**
 * Schema 验证规则
 */
export interface SchemaRule {
  /**
   * 字段类型
   */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'url'

  /**
   * 是否必需
   */
  required?: boolean

  /**
   * 最小值/长度
   */
  min?: number

  /**
   * 最大值/长度
   */
  max?: number

  /**
   * 正则表达式
   */
  pattern?: RegExp

  /**
   * 枚举值
   */
  enum?: any[]

  /**
   * 自定义验证器
   */
  validator?: ValidatorFunction

  /**
   * 错误消息
   */
  message?: string

  /**
   * 子 Schema（用于对象）
   */
  schema?: Schema

  /**
   * 数组元素验证规则
   */
  items?: SchemaRule

  /**
   * 数据转换
   * 可以是转换器名称数组或自定义转换函数
   */
  transform?: string[] | ((value: any) => any)

  /**
   * 默认值
   */
  default?: any
}

/**
 * Schema 定义
 */
export type Schema = Record<string, SchemaRule | SchemaRule[]>

/**
 * 验证错误
 */
export interface ValidationError {
  /**
   * 字段名
   */
  field: string

  /**
   * 错误消息
   */
  message: string

  /**
   * 错误代码
   */
  code?: string

  /**
   * 规则名称
   */
  rule?: string
}

/**
 * Schema 验证结果
 */
export interface SchemaValidationResult {
  /**
   * 是否通过验证
   */
  valid: boolean

  /**
   * 错误列表
   */
  errors: ValidationError[]

  /**
   * 错误映射（按字段）
   */
  errorMap: Record<string, ValidationError[]>
}






