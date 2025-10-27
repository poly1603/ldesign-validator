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
  Transformer,
  createTransformer,
  transformers,
  RuleComposer,
  compose,
  presets,
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
  TransformFunction,
} from './core'

// 导出 Schema 验证器
export { SchemaValidator, createSchemaValidator } from './schema'
export type { SchemaValidatorOptions } from './schema/SchemaValidator'

// 导出所有内置规则
export * as rules from './rules'

// 导出正则工具
export * from './utils/regex'

// 导出工具函数
export { debounce, throttle } from './utils/throttle'
export { fastHash, simpleKey, CacheKeyStrategy } from './utils/hash'

// 导出适配器
export { ResultAdapter } from './adapters/ResultAdapter'
export type {
  AntdValidationResult,
  ElementValidationResult,
  VeeValidateResult,
} from './adapters/ResultAdapter'






