import { describe, expect, it } from 'vitest'
import { compose, presets } from '../../src/core/Composer'

describe('RuleComposer', () => {
  describe('basic composition', () => {
    it('should compose rules with fluent API', async () => {
      const validator = compose<string>()
        .required()
        .email()
        .minLength(5)
        .build()

      const result1 = await validator.validate('user@example.com')
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate('ab')
      expect(result2.valid).toBe(false)
    })

    it('should support custom messages', async () => {
      const validator = compose<string>()
        .required('邮箱不能为空')
        .email('邮箱格式不正确')
        .build()

      const result = await validator.validate('')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('邮箱不能为空')
    })

    it('should support cache and pool options', async () => {
      const validator = compose<string>()
        .email()
        .build({ cache: true, pool: true })

      await validator.validate('test@example.com')
      await validator.validate('test@example.com')

      const stats = validator.getCacheStats()
      expect(stats?.hits).toBeGreaterThan(0)
    })
  })

  describe('various rule types', () => {
    it('should support string rules', async () => {
      const validator = compose<string>()
        .minLength(3)
        .maxLength(10)
        .alpha()
        .build()

      expect((await validator.validate('hello')).valid).toBe(true)
      expect((await validator.validate('ab')).valid).toBe(false)
      expect((await validator.validate('hello123')).valid).toBe(false)
    })

    it('should support numeric rules', async () => {
      const validator = compose<number>()
        .numeric()
        .range(0, 100)
        .build()

      expect((await validator.validate(50)).valid).toBe(true)
      expect((await validator.validate(150)).valid).toBe(false)
    })

    it('should support pattern validation', async () => {
      const validator = compose<string>()
        .pattern(/^\d{6}$/, '必须是6位数字')
        .build()

      expect((await validator.validate('123456')).valid).toBe(true)
      expect((await validator.validate('12345')).valid).toBe(false)
    })

    it('should support enum validation', async () => {
      const validator = compose<string>()
        .oneOf(['admin', 'user', 'guest'])
        .build()

      expect((await validator.validate('admin')).valid).toBe(true)
      expect((await validator.validate('superadmin')).valid).toBe(false)
    })
  })

  describe('advanced rules', () => {
    it('should support URL validation', async () => {
      const validator = compose<string>()
        .url()
        .build()

      expect((await validator.validate('https://example.com')).valid).toBe(true)
      expect((await validator.validate('not-a-url')).valid).toBe(false)
    })

    it('should support phone validation', async () => {
      const validator = compose<string>()
        .phone()
        .build()

      expect((await validator.validate('13812345678')).valid).toBe(true)
      expect((await validator.validate('12345')).valid).toBe(false)
    })

    it('should support UUID validation', async () => {
      const validator = compose<string>()
        .uuid()
        .build()

      expect((await validator.validate('550e8400-e29b-41d4-a716-446655440000')).valid).toBe(true)
      expect((await validator.validate('invalid')).valid).toBe(false)
    })

    it('should support domain validation', async () => {
      const validator = compose<string>()
        .domain()
        .build()

      expect((await validator.validate('example.com')).valid).toBe(true)
      expect((await validator.validate('invalid')).valid).toBe(false)
    })

    it('should support slug validation', async () => {
      const validator = compose<string>()
        .slug()
        .build()

      expect((await validator.validate('hello-world')).valid).toBe(true)
      expect((await validator.validate('Hello World')).valid).toBe(false)
    })

    it('should support semver validation', async () => {
      const validator = compose<string>()
        .semver()
        .build()

      expect((await validator.validate('1.0.0')).valid).toBe(true)
      expect((await validator.validate('1.0')).valid).toBe(false)
    })
  })

  describe('cross-field rules', () => {
    it('should support matchField', async () => {
      const validator = compose<string>()
        .matchField('password')
        .build()

      const result = await validator.validate('password123', {
        formData: { password: 'password123' },
      })
      expect(result.valid).toBe(true)
    })

    it('should support requiredIf', async () => {
      const validator = compose<string>()
        .requiredIf('country')
        .build()

      const result1 = await validator.validate('', {
        formData: { country: '' },
      })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate('', {
        formData: { country: 'China' },
      })
      expect(result2.valid).toBe(false)
    })
  })

  describe('custom rules', () => {
    it('should support custom validators', async () => {
      const validator = compose<string>()
        .custom('no-admin', (value) => ({
          valid: !value.includes('admin'),
          message: '不能包含 admin',
          code: 'NO_ADMIN',
        }))
        .build()

      expect((await validator.validate('user')).valid).toBe(true)
      expect((await validator.validate('admin123')).valid).toBe(false)
    })
  })

  describe('composer management', () => {
    it('should track rule count', () => {
      const composer = compose()
        .required()
        .email()
        .minLength(5)

      expect(composer.ruleCount).toBe(3)
    })

    it('should clear rules', () => {
      const composer = compose()
        .required()
        .email()

      expect(composer.ruleCount).toBe(2)

      composer.clear()

      expect(composer.ruleCount).toBe(0)
    })
  })

  describe('presets', () => {
    it('should have email preset', async () => {
      const validator = presets.email()

      expect((await validator.validate('test@example.com')).valid).toBe(true)
      expect((await validator.validate('')).valid).toBe(false)
      expect((await validator.validate('invalid')).valid).toBe(false)
    })

    it('should have password preset', async () => {
      const validator = presets.password()

      expect((await validator.validate('Password@123')).valid).toBe(true)
      expect((await validator.validate('weak')).valid).toBe(false)
    })

    it('should have username preset', async () => {
      const validator = presets.username()

      expect((await validator.validate('john123')).valid).toBe(true)
      expect((await validator.validate('ab')).valid).toBe(false)
    })

    it('should have phone preset', async () => {
      const validator = presets.phone()

      expect((await validator.validate('13812345678')).valid).toBe(true)
      expect((await validator.validate('12345')).valid).toBe(false)
    })

    it('should have url preset', async () => {
      const validator = presets.url()

      expect((await validator.validate('https://example.com')).valid).toBe(true)
      expect((await validator.validate('invalid')).valid).toBe(false)
    })
  })
})



