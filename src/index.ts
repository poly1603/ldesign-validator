/**
 * @ldesign/validator - 通用验证库
 * 
 * @packageDocumentation
 */

// 导出类型
export type * from './types'

// 导出核心
export { Validator, createValidator } from './core'

// 导出 Schema 验证器
export { SchemaValidator, createSchemaValidator } from './schema'

// 导出所有内置规则
export * as rules from './rules'



