import { describe, expect, it } from 'vitest'
import * as rules from '../../src/rules/format'

describe('Format Rules', () => {
  describe('email', () => {
    it('should validate correct email addresses', async () => {
      const result = rules.email('user@example.com')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid email addresses', async () => {
      const result = rules.email('invalid-email')
      expect(result.valid).toBe(false)
      expect(result.code).toBe('INVALID_EMAIL')
    })

    it('should handle empty values', async () => {
      const result = rules.email('')
      expect(result.valid).toBe(true)
    })
  })

  describe('uuid', () => {
    it('should validate correct UUID', async () => {
      const result = rules.uuid('123e4567-e89b-12d3-a456-426614174000')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid UUID', async () => {
      const result = rules.uuid('not-a-uuid')
      expect(result.valid).toBe(false)
      expect(result.code).toBe('INVALID_UUID')
    })
  })

  describe('mac', () => {
    it('should validate MAC address with colons', async () => {
      const result = rules.mac('00:1A:2B:3C:4D:5E')
      expect(result.valid).toBe(true)
    })

    it('should validate MAC address with dashes', async () => {
      const result = rules.mac('00-1A-2B-3C-4D-5E')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid MAC address', async () => {
      const result = rules.mac('invalid-mac')
      expect(result.valid).toBe(false)
    })
  })

  describe('port', () => {
    it('should validate valid port numbers', async () => {
      expect(rules.port(80).valid).toBe(true)
      expect(rules.port(443).valid).toBe(true)
      expect(rules.port(8080).valid).toBe(true)
    })

    it('should reject invalid port numbers', async () => {
      expect(rules.port(0).valid).toBe(false)
      expect(rules.port(65536).valid).toBe(false)
      expect(rules.port(-1).valid).toBe(false)
    })
  })

  describe('md5', () => {
    it('should validate MD5 hash', async () => {
      const result = rules.md5('5d41402abc4b2a76b9719d911017c592')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid MD5', async () => {
      const result = rules.md5('not-md5')
      expect(result.valid).toBe(false)
    })
  })

  describe('hexColor', () => {
    it('should validate hex colors', async () => {
      expect(rules.hexColor('#FFF').valid).toBe(true)
      expect(rules.hexColor('#FFFFFF').valid).toBe(true)
      expect(rules.hexColor('#FFFFFFFF').valid).toBe(true)
    })

    it('should reject invalid hex colors', async () => {
      expect(rules.hexColor('FFF').valid).toBe(false)
      expect(rules.hexColor('#GGG').valid).toBe(false)
    })
  })

  describe('base64', () => {
    it('should validate base64 strings', async () => {
      expect(rules.base64('SGVsbG8=').valid).toBe(true)
      expect(rules.base64('SGVsbG8gV29ybGQ=').valid).toBe(true)
    })

    it('should reject invalid base64', async () => {
      expect(rules.base64('not-base64!').valid).toBe(false)
      expect(rules.base64('SGVsbG8').valid).toBe(false) // Wrong padding
    })
  })

  describe('jwt', () => {
    it('should validate JWT format', async () => {
      const result = rules.jwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid JWT', async () => {
      expect(rules.jwt('not.a.jwt').valid).toBe(false)
      expect(rules.jwt('only-one-part').valid).toBe(false)
    })
  })

  describe('ipv6', () => {
    it('should validate IPv6 addresses', async () => {
      expect(rules.ipv6('2001:0db8:0000:0000:0000:ff00:0042:8329').valid).toBe(true)
      expect(rules.ipv6('2001:db8::ff00:42:8329').valid).toBe(true)
      expect(rules.ipv6('::1').valid).toBe(true)
    })

    it('should reject invalid IPv6', async () => {
      expect(rules.ipv6('192.168.1.1').valid).toBe(false)
      expect(rules.ipv6('not-ipv6').valid).toBe(false)
    })
  })

  describe('lowercase/uppercase', () => {
    it('should validate lowercase strings', async () => {
      expect(rules.lowercase('hello').valid).toBe(true)
      expect(rules.lowercase('Hello').valid).toBe(false)
    })

    it('should validate uppercase strings', async () => {
      expect(rules.uppercase('HELLO').valid).toBe(true)
      expect(rules.uppercase('Hello').valid).toBe(false)
    })
  })

  describe('isbn', () => {
    it('should validate ISBN-10', async () => {
      const result = rules.isbn('0-306-40615-2')
      expect(result.valid).toBe(true)
    })

    it('should validate ISBN-13', async () => {
      const result = rules.isbn('978-0-306-40615-7')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid ISBN', async () => {
      expect(rules.isbn('123').valid).toBe(false)
    })
  })
})



