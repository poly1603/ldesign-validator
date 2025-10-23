import { describe, expect, it } from 'vitest'
import * as rules from '../../src/rules/basic'

describe('Basic Rules', () => {
  describe('required', () => {
    it('should pass for non-empty values', () => {
      expect(rules.required('hello').valid).toBe(true)
      expect(rules.required(123).valid).toBe(true)
      expect(rules.required(true).valid).toBe(true)
    })

    it('should fail for empty values', () => {
      expect(rules.required('').valid).toBe(false)
      expect(rules.required(null).valid).toBe(false)
      expect(rules.required(undefined).valid).toBe(false)
    })
  })

  describe('minLength', () => {
    it('should validate minimum length', () => {
      expect(rules.minLength(3)('hello').valid).toBe(true)
      expect(rules.minLength(3)('hi').valid).toBe(false)
    })
  })

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      expect(rules.maxLength(10)('hello').valid).toBe(true)
      expect(rules.maxLength(3)('hello').valid).toBe(false)
    })
  })

  describe('min', () => {
    it('should validate minimum value', () => {
      expect(rules.min(10)(15).valid).toBe(true)
      expect(rules.min(10)(5).valid).toBe(false)
    })
  })

  describe('max', () => {
    it('should validate maximum value', () => {
      expect(rules.max(100)(50).valid).toBe(true)
      expect(rules.max(100)(150).valid).toBe(false)
    })
  })

  describe('range', () => {
    it('should validate value in range', () => {
      expect(rules.range(1, 10)(5).valid).toBe(true)
      expect(rules.range(1, 10)(0).valid).toBe(false)
      expect(rules.range(1, 10)(11).valid).toBe(false)
    })
  })

  describe('pattern', () => {
    it('should validate regex patterns', () => {
      expect(rules.pattern(/^\d+$/)('123').valid).toBe(true)
      expect(rules.pattern(/^\d+$/)('abc').valid).toBe(false)
    })
  })

  describe('oneOf', () => {
    it('should validate value in list', () => {
      expect(rules.oneOf(['a', 'b', 'c'])('a').valid).toBe(true)
      expect(rules.oneOf(['a', 'b', 'c'])('d').valid).toBe(false)
    })
  })

  describe('type', () => {
    it('should validate types', () => {
      expect(rules.type('string')('hello').valid).toBe(true)
      expect(rules.type('number')(123).valid).toBe(true)
      expect(rules.type('string')(123).valid).toBe(false)
    })
  })
})



