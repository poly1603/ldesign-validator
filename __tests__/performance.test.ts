import { describe, expect, it } from 'vitest'
import { createValidator } from '../src/core/Validator'
import * as rules from '../src/rules'

describe('Performance Tests', () => {
  it('should handle 10,000 validations in reasonable time', async () => {
    const validator = createValidator<string>({ cache: true })
      .rule({ name: 'email', validator: rules.email })

    const startTime = performance.now()

    // Run 10,000 validations
    for (let i = 0; i < 10000; i++) {
      await validator.validate('user@example.com')
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    console.log(`10,000 validations took ${duration.toFixed(2)}ms`)
    console.log(`Average: ${(duration / 10000).toFixed(4)}ms per validation`)

    // Should complete in less than 1 second with cache
    expect(duration).toBeLessThan(1000)
  })

  it('should have high cache hit rate', async () => {
    const validator = createValidator<string>({ cache: true })
      .rule({ name: 'email', validator: rules.email })

    // Warm up cache
    const testEmails = [
      'user1@example.com',
      'user2@example.com',
      'user3@example.com',
    ]

    // Run multiple times
    for (let i = 0; i < 100; i++) {
      for (const email of testEmails) {
        await validator.validate(email)
      }
    }

    const stats = validator.getCacheStats()
    console.log('Cache stats:', stats)

    expect(stats).toBeDefined()
    if (stats) {
      const hitRate = Number.parseFloat(stats.hitRate)
      expect(hitRate).toBeGreaterThan(80) // >80% hit rate
    }
  })

  it('should handle batch validation efficiently', async () => {
    const validator = createValidator<string>()
      .rule({ validator: rules.email })

    const testData = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`)

    const startTime = performance.now()
    const result = await validator.validateBatch(testData)
    const endTime = performance.now()

    console.log(`Batch validation of 1000 items took ${(endTime - startTime).toFixed(2)}ms`)

    expect(result.valid).toBe(true)
    expect(result.results.length).toBe(1000)
  })

  it('should handle parallel validation efficiently', async () => {
    const validator = createValidator<string>()
      .rule({ validator: rules.email })

    const testData = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`)

    const startTime = performance.now()
    const result = await validator.validateParallel(testData)
    const endTime = performance.now()

    console.log(`Parallel validation of 1000 items took ${(endTime - startTime).toFixed(2)}ms`)

    expect(result.valid).toBe(true)
    expect(result.results.length).toBe(1000)
  })
})



