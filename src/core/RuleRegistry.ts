import type { ValidatorFunction } from '../types'

/**
 * 规则注册表（全局单例）
 * 用于全局注册和复用验证规则，便于在多个验证器之间共享规则
 * 
 * @example
 * ```typescript
 * import { RuleRegistry, rules } from '@ldesign/validator'
 * 
 * // 注册自定义规则
 * RuleRegistry.register('customEmail', rules.email)
 * 
 * // 获取规则
 * const emailRule = RuleRegistry.get('customEmail')
 * 
 * // 查看统计
 * console.log(RuleRegistry.getStats())
 * ```
 */
export class RuleRegistry {
  /** 规则存储 Map */
  private static rules = new Map<string, ValidatorFunction>()

  /**
   * 注册验证规则
   * 如果规则名称已存在，将会覆盖原有规则并发出警告
   * 
   * @param name 规则名称
   * @param validator 验证器函数
   * 
   * @example
   * ```typescript
   * RuleRegistry.register('email', rules.email)
   * RuleRegistry.register('customRule', (value) => ({
   *   valid: value.length > 0,
   *   message: '不能为空'
   * }))
   * ```
   */
  static register(name: string, validator: ValidatorFunction): void {
    if (this.rules.has(name)) {
      console.warn(`规则 "${name}" 已存在，将被覆盖`)
    }
    this.rules.set(name, validator)
  }

  /**
   * 批量注册规则
   * 一次性注册多个验证规则
   * 
   * @param rules 规则映射对象
   * 
   * @example
   * ```typescript
   * RuleRegistry.registerMany({
   *   email: rules.email,
   *   phone: rules.phone,
   *   customRule: (value) => ({ valid: true })
   * })
   * ```
   */
  static registerMany(rules: Record<string, ValidatorFunction>): void {
    for (const [name, validator] of Object.entries(rules)) {
      this.register(name, validator)
    }
  }

  /**
   * 获取验证规则
   * @param name 规则名称
   * @returns 验证器函数，如果不存在则返回 undefined
   * 
   * @example
   * ```typescript
   * const emailRule = RuleRegistry.get('email')
   * if (emailRule) {
   *   const result = await emailRule('test@example.com')
   * }
   * ```
   */
  static get(name: string): ValidatorFunction | undefined {
    return this.rules.get(name)
  }

  /**
   * 检查规则是否存在
   * @param name 规则名称
   * @returns 如果规则存在返回 true
   * 
   * @example
   * ```typescript
   * if (RuleRegistry.has('email')) {
   *   console.log('Email 规则已注册')
   * }
   * ```
   */
  static has(name: string): boolean {
    return this.rules.has(name)
  }

  /**
   * 删除（取消注册）规则
   * @param name 规则名称
   * @returns 如果删除成功返回 true
   * 
   * @example
   * ```typescript
   * RuleRegistry.unregister('customRule')
   * ```
   */
  static unregister(name: string): boolean {
    return this.rules.delete(name)
  }

  /**
   * 清空所有已注册的规则
   * 慎用：会清除所有规则包括内置规则
   * 
   * @example
   * ```typescript
   * RuleRegistry.clear() // 清空所有规则
   * ```
   */
  static clear(): void {
    this.rules.clear()
  }

  /**
   * 获取所有已注册的规则名称
   * @returns 规则名称数组
   * 
   * @example
   * ```typescript
   * const names = RuleRegistry.getRuleNames()
   * console.log(`已注册 ${names.length} 个规则:`, names)
   * ```
   */
  static getRuleNames(): string[] {
    return Array.from(this.rules.keys())
  }

  /**
   * 获取所有已注册的规则
   * 返回规则的副本，不会影响注册表
   * 
   * @returns 规则 Map 的副本
   * 
   * @example
   * ```typescript
   * const allRules = RuleRegistry.getAllRules()
   * console.log(`规则总数: ${allRules.size}`)
   * ```
   */
  static getAllRules(): Map<string, ValidatorFunction> {
    return new Map(this.rules)
  }

  /**
   * 获取注册表统计信息
   * @returns 统计信息对象
   * 
   * @example
   * ```typescript
   * const stats = RuleRegistry.getStats()
   * console.log(`已注册 ${stats.totalRules} 个规则`)
   * ```
   */
  static getStats() {
    return {
      totalRules: this.rules.size,
      ruleNames: this.getRuleNames(),
    }
  }
}

/**
 * 自动注册所有内置规则的辅助函数
 * 将所有内置的验证规则注册到全局注册表中
 * 
 * 注册的规则包括：
 * - 基础规则（required, minLength, maxLength 等）
 * - 格式规则（email, url, phone 等）
 * - 字符串规则（length, startsWith, endsWith 等）
 * - 类型规则（isString, isNumber, isArray 等）
 * 
 * @returns Promise，注册完成后 resolve
 * 
 * @example
 * ```typescript
 * import { registerBuiltInRules, RuleRegistry } from '@ldesign/validator'
 * 
 * await registerBuiltInRules()
 * 
 * const stats = RuleRegistry.getStats()
 * console.log(`已注册 ${stats.totalRules} 个规则`)
 * ```
 */
export async function registerBuiltInRules(): Promise<void> {
  // 动态导入所有规则模块（按需加载，优化性能）
  const [basicRules, formatRules, stringRules, typeRules] = await Promise.all([
    import('../rules/basic'),
    import('../rules/format'),
    import('../rules/string'),
    import('../rules/types'),
  ])

  // 注册基础规则
  RuleRegistry.registerMany(basicRules as any)

  // 注册格式规则
  RuleRegistry.registerMany(formatRules as any)

  // 注册字符串规则
  RuleRegistry.registerMany(stringRules as any)

  // 注册类型规则
  RuleRegistry.registerMany(typeRules as any)
}



