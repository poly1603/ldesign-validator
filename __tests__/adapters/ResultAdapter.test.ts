import { describe, expect, it } from 'vitest'
import { ResultAdapter } from '../../src/adapters/ResultAdapter'
import type { ValidationResult, SchemaValidationResult } from '../../src/types'

describe('ResultAdapter', () => {
  describe('toAntd', () => {
    it('should convert valid result to Ant Design format', () => {
      const result: ValidationResult = {
        valid: true,
      }

      const antdResult = ResultAdapter.toAntd(result)

      expect(antdResult.validateStatus).toBe('success')
      expect(antdResult.help).toBeUndefined()
      expect(antdResult.hasFeedback).toBe(true)
    })

    it('should convert invalid result to Ant Design format', () => {
      const result: ValidationResult = {
        valid: false,
        message: '邮箱格式不正确',
        code: 'INVALID_EMAIL',
      }

      const antdResult = ResultAdapter.toAntd(result)

      expect(antdResult.validateStatus).toBe('error')
      expect(antdResult.help).toBe('邮箱格式不正确')
      expect(antdResult.hasFeedback).toBe(true)
    })
  })

  describe('toElement', () => {
    it('should convert valid result to Element Plus format', () => {
      const result: ValidationResult = {
        valid: true,
      }

      const elementResult = ResultAdapter.toElement(result)

      expect(elementResult.type).toBe('success')
      expect(elementResult.message).toBeUndefined()
    })

    it('should convert invalid result to Element Plus format', () => {
      const result: ValidationResult = {
        valid: false,
        message: '邮箱格式不正确',
      }

      const elementResult = ResultAdapter.toElement(result)

      expect(elementResult.type).toBe('error')
      expect(elementResult.message).toBe('邮箱格式不正确')
    })
  })

  describe('toVeeValidate', () => {
    it('should convert valid result to VeeValidate format', () => {
      const result: ValidationResult = {
        valid: true,
      }

      const veeResult = ResultAdapter.toVeeValidate(result)

      expect(veeResult.valid).toBe(true)
      expect(veeResult.errors).toEqual([])
    })

    it('should convert invalid result to VeeValidate format', () => {
      const result: ValidationResult = {
        valid: false,
        message: '邮箱格式不正确',
      }

      const veeResult = ResultAdapter.toVeeValidate(result)

      expect(veeResult.valid).toBe(false)
      expect(veeResult.errors).toEqual(['邮箱格式不正确'])
    })
  })

  describe('toGeneric', () => {
    it('should convert to generic format', () => {
      const result: ValidationResult = {
        valid: false,
        message: '验证失败',
        code: 'VALIDATION_ERROR',
        meta: { field: 'email' },
      }

      const generic = ResultAdapter.toGeneric(result)

      expect(generic.success).toBe(false)
      expect(generic.error).toBe('验证失败')
      expect(generic.code).toBe('VALIDATION_ERROR')
      expect(generic.meta).toEqual({ field: 'email' })
    })
  })

  describe('schema result conversion', () => {
    it('should convert schema result to Ant Design format', () => {
      const schemaResult: SchemaValidationResult = {
        valid: false,
        errors: [
          { field: 'email', message: '邮箱格式不正确', code: 'INVALID_EMAIL' },
          { field: 'age', message: '年龄必须大于18', code: 'MIN' },
        ],
        errorMap: {
          email: [{ field: 'email', message: '邮箱格式不正确', code: 'INVALID_EMAIL' }],
          age: [{ field: 'age', message: '年龄必须大于18', code: 'MIN' }],
        },
      }

      const antdErrors = ResultAdapter.schemaToAntd(schemaResult)

      expect(antdErrors.email).toBeDefined()
      expect(antdErrors.email.validateStatus).toBe('error')
      expect(antdErrors.email.help).toBe('邮箱格式不正确')
      expect(antdErrors.age).toBeDefined()
    })

    it('should convert schema result to Element Plus format', () => {
      const schemaResult: SchemaValidationResult = {
        valid: false,
        errors: [
          { field: 'email', message: '邮箱格式不正确' },
        ],
        errorMap: {
          email: [{ field: 'email', message: '邮箱格式不正确' }],
        },
      }

      const elementErrors = ResultAdapter.schemaToElement(schemaResult)

      expect(elementErrors.email).toBeDefined()
      expect(elementErrors.email.type).toBe('error')
      expect(elementErrors.email.message).toBe('邮箱格式不正确')
    })

    it('should convert schema result to VeeValidate format', () => {
      const schemaResult: SchemaValidationResult = {
        valid: false,
        errors: [
          { field: 'email', message: '邮箱格式不正确' },
          { field: 'email', message: '邮箱不能为空' },
        ],
        errorMap: {
          email: [
            { field: 'email', message: '邮箱格式不正确' },
            { field: 'email', message: '邮箱不能为空' },
          ],
        },
      }

      const veeErrors = ResultAdapter.schemaToVeeValidate(schemaResult)

      expect(veeErrors.email).toBeDefined()
      expect(veeErrors.email).toHaveLength(2)
      expect(veeErrors.email).toContain('邮箱格式不正确')
    })
  })
})



