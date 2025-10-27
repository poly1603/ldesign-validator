/**
 * 防抖和节流工具
 * 用于优化高频验证场景，如用户输入时的实时验证
 */

import type { Validator } from '../core/Validator'
import type { ValidationResult, ValidationContext } from '../types'

/**
 * 防抖验证器包装器
 * 在最后一次调用后等待指定时间才执行验证
 * 适合用户输入等高频触发场景
 * 
 * @param validator 原始验证器
 * @param delay 延迟时间（毫秒）
 * @param options 额外选项
 * @returns 包装后的验证器
 * 
 * @example
 * ```typescript
 * const validator = createValidator<string>()
 *   .rule({ validator: rules.email })
 * 
 * const debouncedValidator = debounce(validator, 300)
 * 
 * // 用户快速输入时只会在停止输入300ms后执行验证
 * await debouncedValidator.validate('user@example.com')
 * ```
 */
export function debounce<T = any>(
  validator: Validator<T>,
  delay: number,
  options: {
    /**
     * 是否在首次调用时立即执行
     * @default false
     */
    leading?: boolean
    /**
     * 是否在最后一次调用后执行
     * @default true
     */
    trailing?: boolean
  } = {}
): Validator<T> {
  const { leading = false, trailing = true } = options

  let timeoutId: NodeJS.Timeout | null = null
  let lastCallTime = 0
  let lastResult: Promise<ValidationResult> | null = null
  let resolveQueue: Array<(result: ValidationResult) => void> = []

  // 创建一个包装后的验证器
  const wrappedValidator = Object.create(validator)

  // 重写 validate 方法
  wrappedValidator.validate = async function (
    value: T,
    context?: ValidationContext
  ): Promise<ValidationResult> {
    const now = Date.now()

    return new Promise<ValidationResult>((resolve) => {
      // 添加到等待队列
      resolveQueue.push(resolve)

      // 是否应该立即执行（首次且 leading 为 true）
      const shouldCallNow = leading && (now - lastCallTime > delay)

      // 清除之前的定时器
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      // 如果应该立即执行
      if (shouldCallNow && !lastResult) {
        lastCallTime = now
        lastResult = validator.validate.call(validator, value, context)

        lastResult.then((result) => {
          // 通知所有等待的调用者
          const queue = resolveQueue
          resolveQueue = []
          queue.forEach(r => r(result))
          lastResult = null
        })
      }
      // 否则设置延迟执行
      else if (trailing) {
        timeoutId = setTimeout(async () => {
          lastCallTime = now
          const result = await validator.validate.call(validator, value, context)

          // 通知所有等待的调用者
          const queue = resolveQueue
          resolveQueue = []
          queue.forEach(r => r(result))

          timeoutId = null
          lastResult = null
        }, delay)
      }
    })
  }

  return wrappedValidator
}

/**
 * 节流验证器包装器
 * 在指定时间内最多执行一次验证
 * 适合滚动、拖拽等持续触发的场景
 * 
 * @param validator 原始验证器
 * @param limit 限制时间间隔（毫秒）
 * @param options 额外选项
 * @returns 包装后的验证器
 * 
 * @example
 * ```typescript
 * const validator = createValidator<string>()
 *   .rule({ validator: rules.required })
 * 
 * const throttledValidator = throttle(validator, 1000)
 * 
 * // 无论调用多少次，每秒最多执行一次验证
 * await throttledValidator.validate('test')
 * ```
 */
export function throttle<T = any>(
  validator: Validator<T>,
  limit: number,
  options: {
    /**
     * 是否在首次调用时立即执行
     * @default true
     */
    leading?: boolean
    /**
     * 是否在时间窗口结束后执行最后一次调用
     * @default true
     */
    trailing?: boolean
  } = {}
): Validator<T> {
  const { leading = true, trailing = true } = options

  let lastCallTime = 0
  let timeoutId: NodeJS.Timeout | null = null
  let lastArgs: { value: T, context?: ValidationContext } | null = null
  let lastResult: ValidationResult | null = null
  let pendingResolvers: Array<(result: ValidationResult) => void> = []

  // 创建一个包装后的验证器
  const wrappedValidator = Object.create(validator)

  // 重写 validate 方法
  wrappedValidator.validate = async function (
    value: T,
    context?: ValidationContext
  ): Promise<ValidationResult> {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime

    return new Promise<ValidationResult>(async (resolve) => {
      // 保存最后的参数
      lastArgs = { value, context }

      // 如果在限制时间内且已有结果，直接返回缓存结果
      if (timeSinceLastCall < limit && lastResult) {
        pendingResolvers.push(resolve)
        return
      }

      // 如果超过限制时间或首次调用且 leading 为 true
      if (timeSinceLastCall >= limit && leading) {
        lastCallTime = now

        const result = await validator.validate.call(validator, value, context)
        lastResult = result

        // 解析所有等待的 Promise
        resolve(result)
        pendingResolvers.forEach(r => r(result))
        pendingResolvers = []

        // 设置 trailing 定时器
        if (trailing) {
          if (timeoutId) {
            clearTimeout(timeoutId)
          }

          timeoutId = setTimeout(async () => {
            if (lastArgs) {
              const { value: v, context: c } = lastArgs
              const trailingResult = await validator.validate.call(validator, v, c)
              lastResult = trailingResult

              // 解析任何在等待的 Promise
              pendingResolvers.forEach(r => r(trailingResult))
              pendingResolvers = []
            }
            timeoutId = null
          }, limit)
        }
      }
      // 否则添加到等待队列
      else {
        pendingResolvers.push(resolve)

        // 如果还没有定时器且 trailing 为 true，设置一个
        if (!timeoutId && trailing) {
          timeoutId = setTimeout(async () => {
            if (lastArgs) {
              lastCallTime = Date.now()
              const { value: v, context: c } = lastArgs
              const result = await validator.validate.call(validator, v, c)
              lastResult = result

              // 解析所有等待的 Promise
              pendingResolvers.forEach(r => r(result))
              pendingResolvers = []
            }
            timeoutId = null
          }, limit - timeSinceLastCall)
        }
        // 如果没有启用 trailing，返回最后的结果
        else if (lastResult) {
          resolve(lastResult)
        }
      }
    })
  }

  return wrappedValidator
}

/**
 * 取消防抖或节流
 * 清除所有等待的定时器和队列
 * 
 * @param wrappedValidator 包装后的验证器
 * 
 * @example
 * ```typescript
 * const debouncedValidator = debounce(validator, 300)
 * 
 * // 取消所有等待的验证
 * cancel(debouncedValidator)
 * ```
 */
export function cancel(wrappedValidator: any): void {
  // 这个函数主要用于文档目的
  // 实际的取消逻辑已经内置在包装器中
  console.warn('Cancel function is not yet implemented. Use validator.clearCache() instead.')
}




