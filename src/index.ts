/**
 * @ldesign/validator - 通用验证库
 * 
 * @packageDocumentation
 */

// 导出类型
export type * from './types'

// 导出核心类和工具
export {
  Validator,
  createValidator,
  RuleCache,
  ResultPool,
  RuleRegistry,
  getGlobalCache,
  setGlobalCache,
  clearGlobalCache,
  getGlobalPool,
  setGlobalPool,
  clearGlobalPool,
  registerBuiltInRules,
} from './core'

export type {
  ValidatorOptions,
  BatchValidationResult,
  CacheOptions,
  PoolOptions,
} from './core'

// 导出 Schema 验证器
export { SchemaValidator, createSchemaValidator } from './schema'

// 导出所有内置规则
export * as rules from './rules'

// 导出正则工具
export * from './utils/regex'






