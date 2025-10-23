import type { ValidatorFunction } from '../types'

/**
 * 规则注册表
 * 用于全局注册和复用验证规则
 */
export class RuleRegistry {
  private static rules = new Map<string, ValidatorFunction>()

  /**
   * 注册验证规则
   * @param name - 规则名称
   * @param validator - 验证器函数
   */
  static register(name: string, validator: ValidatorFunction): void {
    if (this.rules.has(name)) {
      console.warn(`Rule "${name}" is already registered. It will be overwritten.`)
    }
    this.rules.set(name, validator)
  }

  /**
   * 批量注册规则
   * @param rules - 规则映射对象
   */
  static registerMany(rules: Record<string, ValidatorFunction>): void {
    for (const [name, validator] of Object.entries(rules)) {
      this.register(name, validator)
    }
  }

  /**
   * 获取验证规则
   * @param name - 规则名称
   */
  static get(name: string): ValidatorFunction | undefined {
    return this.rules.get(name)
  }

  /**
   * 检查规则是否存在
   * @param name - 规则名称
   */
  static has(name: string): boolean {
    return this.rules.has(name)
  }

  /**
   * 删除规则
   * @param name - 规则名称
   */
  static unregister(name: string): boolean {
    return this.rules.delete(name)
  }

  /**
   * 清空所有规则
   */
  static clear(): void {
    this.rules.clear()
  }

  /**
   * 获取所有已注册的规则名称
   */
  static getRuleNames(): string[] {
    return Array.from(this.rules.keys())
  }

  /**
   * 获取所有已注册的规则
   */
  static getAllRules(): Map<string, ValidatorFunction> {
    return new Map(this.rules)
  }

  /**
   * 获取注册表统计信息
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
 */
export async function registerBuiltInRules(): Promise<void> {
  // 动态导入所有规则模块
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



