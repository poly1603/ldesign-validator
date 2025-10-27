import { describe, expect, it } from 'vitest'
import { createSchemaValidator } from '../../src/schema/SchemaValidator'

describe('SchemaValidator', () => {
  describe('basic validation', () => {
    it('should validate simple schema', async () => {
      const schema = {
        name: { type: 'string' as const, required: true },
        age: { type: 'number' as const, min: 18, max: 100 },
      }

      const validator = createSchemaValidator(schema)

      const result1 = await validator.validate({
        name: 'John',
        age: 25,
      })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate({
        name: '',
        age: 25,
      })
      expect(result2.valid).toBe(false)
    })

    it('should validate email type', async () => {
      const schema = {
        email: { type: 'email' as const, required: true },
      }

      const validator = createSchemaValidator(schema)

      const result1 = await validator.validate({ email: 'test@example.com' })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate({ email: 'invalid' })
      expect(result2.valid).toBe(false)
    })
  })

  describe('array items validation', () => {
    it('should validate array items', async () => {
      const schema = {
        tags: {
          type: 'array' as const,
          items: {
            type: 'string' as const,
            minLength: 2,
            maxLength: 20,
          },
        },
      }

      const validator = createSchemaValidator(schema)

      const result1 = await validator.validate({
        tags: ['vue', 'react', 'angular'],
      })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate({
        tags: ['vue', 'a'], // 'a' 太短
      })
      expect(result2.valid).toBe(false)
      expect(result2.errors[0].message).toContain('[1]')
    })
  })

  describe('data transformation', () => {
    it('should transform data when autoTransform is enabled', async () => {
      const schema = {
        email: {
          type: 'email' as const,
          transform: ['trim', 'toLowerCase'],
        },
      }

      const validator = createSchemaValidator(schema, {
        autoTransform: true,
      })

      const result = await validator.validate({
        email: '  USER@EXAMPLE.COM  ',
      })

      expect(result.valid).toBe(true)
    })

    it('should support custom transform functions', async () => {
      const schema = {
        slug: {
          type: 'string' as const,
          transform: (value: string) => value.toLowerCase().replace(/\s+/g, '-'),
        },
      }

      const validator = createSchemaValidator(schema, {
        autoTransform: true,
      })

      const result = await validator.validate({
        slug: 'Hello World',
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('default values', () => {
    it('should apply default values', async () => {
      const schema = {
        age: {
          type: 'number' as const,
          default: 18,
        },
        active: {
          type: 'boolean' as const,
          default: true,
        },
      }

      const validator = createSchemaValidator(schema)

      const result = await validator.validate({})
      expect(result.valid).toBe(true)
    })
  })

  describe('pattern validation', () => {
    it('should validate regex patterns', async () => {
      const schema = {
        phone: {
          type: 'string' as const,
          pattern: /^1[3-9]\d{9}$/,
          message: '请输入有效的手机号',
        },
      }

      const validator = createSchemaValidator(schema)

      const result1 = await validator.validate({ phone: '13812345678' })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate({ phone: '12345' })
      expect(result2.valid).toBe(false)
      expect(result2.errors[0].message).toBe('请输入有效的手机号')
    })
  })

  describe('enum validation', () => {
    it('should validate enum values', async () => {
      const schema = {
        role: {
          type: 'string' as const,
          enum: ['admin', 'user', 'guest'],
        },
      }

      const validator = createSchemaValidator(schema)

      const result1 = await validator.validate({ role: 'admin' })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate({ role: 'superadmin' })
      expect(result2.valid).toBe(false)
    })
  })

  describe('custom validator', () => {
    it('should support custom validators', async () => {
      const schema = {
        username: {
          type: 'string' as const,
          validator: (value: string) => ({
            valid: !value.includes('admin'),
            message: '用户名不能包含 admin',
            code: 'INVALID_USERNAME',
          }),
        },
      }

      const validator = createSchemaValidator(schema)

      const result1 = await validator.validate({ username: 'john' })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate({ username: 'admin123' })
      expect(result2.valid).toBe(false)
    })
  })

  describe('stopOnFirstError option', () => {
    it('should stop on first error when enabled', async () => {
      const schema = {
        field1: { type: 'string' as const, required: true },
        field2: { type: 'string' as const, required: true },
        field3: { type: 'string' as const, required: true },
      }

      const validator = createSchemaValidator(schema, {
        stopOnFirstError: true,
      })

      const result = await validator.validate({})
      expect(result.errors).toHaveLength(1) // 只有一个错误
    })

    it('should collect all errors when disabled', async () => {
      const schema = {
        field1: { type: 'string' as const, required: true },
        field2: { type: 'string' as const, required: true },
        field3: { type: 'string' as const, required: true },
      }

      const validator = createSchemaValidator(schema, {
        stopOnFirstError: false,
      })

      const result = await validator.validate({})
      expect(result.errors).toHaveLength(3) // 所有错误
    })
  })

  describe('error mapping', () => {
    it('should create errorMap by field', async () => {
      const schema = {
        email: { type: 'email' as const, required: true },
        phone: { type: 'string' as const, pattern: /^\d+$/ },
      }

      const validator = createSchemaValidator(schema)

      const result = await validator.validate({
        email: 'invalid',
        phone: 'abc',
      })

      expect(result.valid).toBe(false)
      expect(result.errorMap.email).toBeDefined()
      expect(result.errorMap.phone).toBeDefined()
      expect(result.errorMap.email[0].field).toBe('email')
    })
  })

  describe('nested validation', () => {
    it('should validate nested objects', async () => {
      const schema = {
        user: {
          type: 'object' as const,
          required: true,
        },
      }

      const validator = createSchemaValidator(schema)

      const result1 = await validator.validate({
        user: { name: 'John' },
      })
      expect(result1.valid).toBe(true)

      const result2 = await validator.validate({
        user: null,
      })
      expect(result2.valid).toBe(false)
    })
  })
})



