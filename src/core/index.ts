/**
 * 核心模块导出
 */

export { Validator, createValidator } from './Validator'
export type { ValidatorOptions, BatchValidationResult } from './Validator'

export { RuleCache, getGlobalCache, setGlobalCache, clearGlobalCache } from './Cache'
export type { CacheOptions } from './Cache'

export { ResultPool, getGlobalPool, setGlobalPool, clearGlobalPool } from './Pool'
export type { PoolOptions } from './Pool'

export { RuleRegistry, registerBuiltInRules } from './RuleRegistry'






