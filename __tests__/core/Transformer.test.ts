import { describe, expect, it } from 'vitest'
import { createTransformer, transformers } from '../../src/core/Transformer'

describe('Transformer', () => {
  describe('basic transformations', () => {
    it('should trim strings', () => {
      const transformer = createTransformer().trim()

      const result = transformer.transform('  hello  ')
      expect(result).toBe('hello')
    })

    it('should convert to lowercase', () => {
      const transformer = createTransformer().toLowerCase()

      const result = transformer.transform('HELLO')
      expect(result).toBe('hello')
    })

    it('should convert to uppercase', () => {
      const transformer = createTransformer().toUpperCase()

      const result = transformer.transform('hello')
      expect(result).toBe('HELLO')
    })

    it('should convert to number', () => {
      const transformer = createTransformer().toNumber()

      expect(transformer.transform('123')).toBe(123)
      expect(transformer.transform('12.34')).toBe(12.34)
      expect(Number.isNaN(transformer.transform('abc'))).toBe(true)
    })

    it('should convert to integer', () => {
      const transformer = createTransformer().toInteger()

      expect(transformer.transform('123')).toBe(123)
      expect(transformer.transform('12.99')).toBe(12)
      expect(transformer.transform('10', 16)).toBe(16) // 十六进制
    })

    it('should convert to float', () => {
      const transformer = createTransformer().toFloat()

      expect(transformer.transform('12.34')).toBe(12.34)
      expect(transformer.transform('123')).toBe(123)
    })

    it('should convert to boolean', () => {
      const transformer = createTransformer().toBoolean()

      expect(transformer.transform('true')).toBe(true)
      expect(transformer.transform('1')).toBe(true)
      expect(transformer.transform(1)).toBe(true)
      expect(transformer.transform('false')).toBe(false)
      expect(transformer.transform('0')).toBe(false)
      expect(transformer.transform(0)).toBe(false)
    })

    it('should convert to date', () => {
      const transformer = createTransformer().toDate()

      const result = transformer.transform('2024-01-01')
      expect(result instanceof Date).toBe(true)
    })
  })

  describe('string transformations', () => {
    it('should replace strings', () => {
      const transformer = createTransformer().replace(/\s+/g, '-')

      const result = transformer.transform('hello world')
      expect(result).toBe('hello-world')
    })

    it('should remove characters', () => {
      const transformer = createTransformer().remove(/[^a-z]/g)

      const result = transformer.transform('Hello123World!')
      expect(result).toBe('elloorld')
    })

    it('should truncate strings', () => {
      const transformer = createTransformer().truncate(10)

      expect(transformer.transform('short')).toBe('short')
      expect(transformer.transform('this is a long text')).toBe('this is...')
    })

    it('should split strings', () => {
      const transformer = createTransformer().split(',')

      const result = transformer.transform('a,b,c')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('should join arrays', () => {
      const transformer = createTransformer().join('-')

      const result = transformer.transform(['a', 'b', 'c'])
      expect(result).toBe('a-b-c')
    })

    it('should extract numbers', () => {
      const transformer = createTransformer().extractNumbers()

      const result = transformer.transform('abc123def456')
      expect(result).toBe('123456')
    })

    it('should strip HTML tags', () => {
      const transformer = createTransformer().stripHtml()

      const result = transformer.transform('<p>Hello <strong>World</strong></p>')
      expect(result).toBe('Hello World')
    })

    it('should normalize whitespace', () => {
      const transformer = createTransformer().normalizeWhitespace()

      const result = transformer.transform('hello   world  \n  test')
      expect(result).toBe('hello world test')
    })

    it('should capitalize first letter', () => {
      const transformer = createTransformer().capitalize()

      expect(transformer.transform('hello')).toBe('Hello')
      expect(transformer.transform('HELLO')).toBe('Hello')
    })
  })

  describe('case transformations', () => {
    it('should convert to camelCase', () => {
      const transformer = createTransformer().toCamelCase()

      expect(transformer.transform('hello-world')).toBe('helloWorld')
      expect(transformer.transform('hello_world')).toBe('helloWorld')
      expect(transformer.transform('hello world')).toBe('helloWorld')
    })

    it('should convert to snake_case', () => {
      const transformer = createTransformer().toSnakeCase()

      expect(transformer.transform('helloWorld')).toBe('hello_world')
      expect(transformer.transform('HelloWorld')).toBe('hello_world')
    })

    it('should convert to kebab-case', () => {
      const transformer = createTransformer().toKebabCase()

      expect(transformer.transform('helloWorld')).toBe('hello-world')
      expect(transformer.transform('HelloWorld')).toBe('hello-world')
    })
  })

  describe('chain transformations', () => {
    it('should chain multiple transformations', () => {
      const transformer = createTransformer()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')

      const result = transformer.transform('  Hello World  ')
      expect(result).toBe('hello-world')
    })

    it('should handle complex transformation pipelines', () => {
      const transformer = createTransformer()
        .trim()
        .toLowerCase()
        .normalizeWhitespace()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      const result = transformer.transform('  Hello   World! 123  ')
      expect(result).toBe('hello-world-123')
    })
  })

  describe('default value', () => {
    it('should use default value for empty values', () => {
      const transformer = createTransformer().default('default-value')

      expect(transformer.transform('')).toBe('default-value')
      expect(transformer.transform(null)).toBe('default-value')
      expect(transformer.transform(undefined)).toBe('default-value')
      expect(transformer.transform('actual')).toBe('actual')
    })
  })

  describe('custom transformation', () => {
    it('should support custom transformation functions', () => {
      const transformer = createTransformer()
        .custom((value) => value.split('').reverse().join(''))

      const result = transformer.transform('hello')
      expect(result).toBe('olleh')
    })
  })

  describe('clear', () => {
    it('should clear all transformations', () => {
      const transformer = createTransformer()
        .trim()
        .toLowerCase()

      expect(transformer.length).toBe(2)

      transformer.clear()

      expect(transformer.length).toBe(0)
      expect(transformer.transform('  HELLO  ')).toBe('  HELLO  ')
    })
  })

  describe('preset transformers', () => {
    it('should have email transformer preset', () => {
      const transformer = transformers.email()

      const result = transformer.transform('  USER@EXAMPLE.COM  ')
      expect(result).toBe('user@example.com')
    })

    it('should have username transformer preset', () => {
      const transformer = transformers.username()

      const result = transformer.transform('  User@Name!  ')
      expect(result).toBe('username')
    })

    it('should have phone transformer preset', () => {
      const transformer = transformers.phone()

      const result = transformer.transform('+86 138-1234-5678')
      expect(result).toBe('8613812345678')
    })

    it('should have slug transformer preset', () => {
      const transformer = transformers.slug()

      const result = transformer.transform('  Hello World! 123  ')
      expect(result).toBe('hello-world-123')
    })

    it('should have price transformer preset', () => {
      const transformer = transformers.price()

      const result = transformer.transform('12.999')
      expect(result).toBe(13.00)
    })
  })

  describe('transform function mode', () => {
    it('should return transformation function when called without value', () => {
      const transformer = createTransformer()
        .trim()
        .toLowerCase()

      const transformFn = transformer.transform()

      expect(typeof transformFn).toBe('function')
      expect(transformFn('  HELLO  ')).toBe('hello')
    })
  })
})



