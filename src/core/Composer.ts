/**
 * 规则组合器
 * 提供更优雅的链式 API 来组合验证规则
 */

import type { ValidatorFunction } from '../types'
import { createValidator, type Validator } from './Validator'
import * as rules from '../rules'

/**
 * 规则组合器类
 * 提供流畅的 API 来构建复杂的验证规则
 * 
 * @example
 * ```typescript
 * import { compose } from '@ldesign/validator'
 * 
 * const validator = compose()
 *   .required()
 *   .email()
 *   .minLength(5)
 *   .build()
 * 
 * await validator.validate('user@example.com')
 * ```
 */
export class RuleComposer<T = any> {
  /** 验证规则列表 */
  private validatorRules: Array<{ name?: string; validator: ValidatorFunction<T> }> = []

  /**
   * 添加必填验证
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  required(message?: string): this {
    this.validatorRules.push({
      name: 'required',
      validator: message
        ? (value, context) => {
            const result = rules.required(value, context)
            return result.valid ? result : { ...result, message }
          }
        : rules.required,
    })
    return this
  }

  /**
   * 添加邮箱验证
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  email(message?: string): this {
    this.validatorRules.push({
      name: 'email',
      validator: message
        ? (value, context) => {
            const result = rules.email(value, context)
            return result.valid ? result : { ...result, message }
          }
        : rules.email,
    })
    return this
  }

  /**
   * 添加 URL 验证
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  url(message?: string): this {
    this.validatorRules.push({
      name: 'url',
      validator: message
        ? (value, context) => {
            const result = rules.url(value, context)
            return result.valid ? result : { ...result, message }
          }
        : rules.url,
    })
    return this
  }

  /**
   * 添加手机号验证
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  phone(message?: string): this {
    this.validatorRules.push({
      name: 'phone',
      validator: message
        ? (value, context) => {
            const result = rules.phone(value, context)
            return result.valid ? result : { ...result, message }
          }
        : rules.phone,
    })
    return this
  }

  /**
   * 添加最小长度验证
   * @param min 最小长度
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  minLength(min: number, message?: string): this {
    this.validatorRules.push({
      name: 'minLength',
      validator: rules.minLength(min),
    })
    return this
  }

  /**
   * 添加最大长度验证
   * @param max 最大长度
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  maxLength(max: number, message?: string): this {
    this.validatorRules.push({
      name: 'maxLength',
      validator: rules.maxLength(max),
    })
    return this
  }

  /**
   * 添加范围验证
   * @param min 最小值
   * @param max 最大值
   * @returns 返回自身以支持链式调用
   */
  range(min: number, max: number): this {
    this.validatorRules.push({
      name: 'range',
      validator: rules.range(min, max),
    })
    return this
  }

  /**
   * 添加正则验证
   * @param regex 正则表达式
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  pattern(regex: RegExp, message?: string): this {
    this.validatorRules.push({
      name: 'pattern',
      validator: rules.pattern(regex, message),
    })
    return this
  }

  /**
   * 添加枚举验证
   * @param values 允许的值数组
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  oneOf(values: any[], message?: string): this {
    this.validatorRules.push({
      name: 'oneOf',
      validator: rules.oneOf(values, message),
    })
    return this
  }

  /**
   * 添加字母验证
   * @returns 返回自身以支持链式调用
   */
  alpha(): this {
    this.validatorRules.push({
      name: 'alpha',
      validator: rules.alpha,
    })
    return this
  }

  /**
   * 添加字母和数字验证
   * @returns 返回自身以支持链式调用
   */
  alphanumeric(): this {
    this.validatorRules.push({
      name: 'alphanumeric',
      validator: rules.alphanumeric,
    })
    return this
  }

  /**
   * 添加数字验证
   * @returns 返回自身以支持链式调用
   */
  numeric(): this {
    this.validatorRules.push({
      name: 'numeric',
      validator: rules.numeric,
    })
    return this
  }

  /**
   * 添加强密码验证
   * @returns 返回自身以支持链式调用
   */
  strongPassword(): this {
    this.validatorRules.push({
      name: 'strongPassword',
      validator: rules.strongPassword,
    })
    return this
  }

  /**
   * 添加 UUID 验证
   * @returns 返回自身以支持链式调用
   */
  uuid(): this {
    this.validatorRules.push({
      name: 'uuid',
      validator: rules.uuid,
    })
    return this
  }

  /**
   * 添加域名验证
   * @returns 返回自身以支持链式调用
   */
  domain(): this {
    this.validatorRules.push({
      name: 'domain',
      validator: rules.domain,
    })
    return this
  }

  /**
   * 添加 slug 验证
   * @returns 返回自身以支持链式调用
   */
  slug(): this {
    this.validatorRules.push({
      name: 'slug',
      validator: rules.slug,
    })
    return this
  }

  /**
   * 添加语义化版本验证
   * @returns 返回自身以支持链式调用
   */
  semver(): this {
    this.validatorRules.push({
      name: 'semver',
      validator: rules.semver,
    })
    return this
  }

  /**
   * 添加字段匹配验证
   * @param fieldPath 要匹配的字段路径
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  matchField(fieldPath: string, message?: string): this {
    this.validatorRules.push({
      name: 'matchField',
      validator: rules.matchField(fieldPath, message),
    })
    return this
  }

  /**
   * 添加条件必填验证
   * @param fieldPath 依赖的字段路径
   * @param message 自定义错误消息
   * @returns 返回自身以支持链式调用
   */
  requiredIf(fieldPath: string, message?: string): this {
    this.validatorRules.push({
      name: 'requiredIf',
      validator: rules.requiredIf(fieldPath, message),
    })
    return this
  }

  /**
   * 添加自定义验证器
   * @param name 规则名称
   * @param validator 验证器函数
   * @returns 返回自身以支持链式调用
   */
  custom(name: string, validator: ValidatorFunction<T>): this {
    this.validatorRules.push({ name, validator })
    return this
  }

  /**
   * 构建最终的验证器
   * @param options 验证器配置选项
   * @returns Validator 实例
   * 
   * @example
   * ```typescript
   * const validator = compose()
   *   .required()
   *   .email()
   *   .minLength(5)
   *   .build({ cache: true, pool: true })
   * ```
   */
  build(options?: {
    cache?: boolean
    pool?: boolean
    stopOnFirstError?: boolean
  }): Validator<T> {
    const validator = createValidator<T>(options)

    for (const { name, validator: validatorFn } of this.validatorRules) {
      validator.rule({ name, validator: validatorFn })
    }

    return validator
  }

  /**
   * 获取已添加的规则数量
   */
  get ruleCount(): number {
    return this.validatorRules.length
  }

  /**
   * 清除所有规则
   * @returns 返回自身以支持链式调用
   */
  clear(): this {
    this.validatorRules = []
    return this
  }
}

/**
 * 创建规则组合器实例
 * @returns RuleComposer 实例
 * 
 * @example
 * ```typescript
 * import { compose } from '@ldesign/validator'
 * 
 * // 链式构建验证器
 * const emailValidator = compose<string>()
 *   .required('邮箱不能为空')
 *   .email('邮箱格式不正确')
 *   .minLength(5)
 *   .build({ cache: true })
 * 
 * const result = await emailValidator.validate('user@example.com')
 * ```
 */
export function compose<T = any>(): RuleComposer<T> {
  return new RuleComposer<T>()
}

/**
 * 常用验证器组合预设
 */
export const presets = {
  /**
   * 邮箱验证器预设
   * 必填 + 邮箱格式验证
   */
  email: () => compose<string>()
    .required('邮箱不能为空')
    .email('邮箱格式不正确')
    .build({ cache: true }),

  /**
   * 密码验证器预设
   * 必填 + 最小长度 + 强密码
   */
  password: () => compose<string>()
    .required('密码不能为空')
    .minLength(8, '密码至少8个字符')
    .strongPassword()
    .build(),

  /**
   * 用户名验证器预设
   * 必填 + 长度限制 + 字母数字
   */
  username: () => compose<string>()
    .required('用户名不能为空')
    .minLength(3, '用户名至少3个字符')
    .maxLength(20, '用户名最多20个字符')
    .alphanumeric()
    .build({ cache: true }),

  /**
   * 手机号验证器预设
   * 必填 + 手机号格式
   */
  phone: () => compose<string>()
    .required('手机号不能为空')
    .phone('手机号格式不正确')
    .build({ cache: true }),

  /**
   * URL 验证器预设
   * 必填 + URL 格式
   */
  url: () => compose<string>()
    .required('URL 不能为空')
    .url('URL 格式不正确')
    .build({ cache: true }),
}



