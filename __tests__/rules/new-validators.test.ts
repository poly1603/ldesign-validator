import { describe, expect, it } from 'vitest'
import {
  domain,
  slug,
  semver,
  mongoId,
  latitude,
  longitude,
  fileExtension,
  mimeType,
  languageCode,
  countryCode,
  currencyCode,
  cron,
} from '../../src/rules/format'

describe('New Validators', () => {
  describe('domain', () => {
    it('should validate domain names', () => {
      expect(domain('example.com').valid).toBe(true)
      expect(domain('sub.example.com').valid).toBe(true)
      expect(domain('invalid').valid).toBe(false)
      expect(domain('invalid..com').valid).toBe(false)
    })
  })

  describe('slug', () => {
    it('should validate URL slugs', () => {
      expect(slug('hello-world').valid).toBe(true)
      expect(slug('test-123').valid).toBe(true)
      expect(slug('Hello-World').valid).toBe(false) // 大写不允许
      expect(slug('hello_world').valid).toBe(false) // 下划线不允许
    })
  })

  describe('semver', () => {
    it('should validate semantic versions', () => {
      expect(semver('1.0.0').valid).toBe(true)
      expect(semver('2.1.3').valid).toBe(true)
      expect(semver('1.0.0-beta.1').valid).toBe(true)
      expect(semver('1.0.0+build.123').valid).toBe(true)
      expect(semver('1.0').valid).toBe(false)
      expect(semver('v1.0.0').valid).toBe(false)
    })
  })

  describe('mongoId', () => {
    it('should validate MongoDB ObjectIds', () => {
      expect(mongoId('507f1f77bcf86cd799439011').valid).toBe(true)
      expect(mongoId('507f1f77bcf86cd799439011'.toUpperCase()).valid).toBe(true)
      expect(mongoId('invalid').valid).toBe(false)
      expect(mongoId('507f1f77bcf86cd79943901').valid).toBe(false) // 太短
    })
  })

  describe('latitude', () => {
    it('should validate latitude values', () => {
      expect(latitude(0).valid).toBe(true)
      expect(latitude(45.5).valid).toBe(true)
      expect(latitude(-89.9).valid).toBe(true)
      expect(latitude(90).valid).toBe(true)
      expect(latitude(-90).valid).toBe(true)
      expect(latitude(91).valid).toBe(false)
      expect(latitude(-91).valid).toBe(false)
    })

    it('should work with string values', () => {
      expect(latitude('45.5').valid).toBe(true)
      expect(latitude('91').valid).toBe(false)
    })
  })

  describe('longitude', () => {
    it('should validate longitude values', () => {
      expect(longitude(0).valid).toBe(true)
      expect(longitude(120.5).valid).toBe(true)
      expect(longitude(-179.9).valid).toBe(true)
      expect(longitude(180).valid).toBe(true)
      expect(longitude(-180).valid).toBe(true)
      expect(longitude(181).valid).toBe(false)
      expect(longitude(-181).valid).toBe(false)
    })
  })

  describe('fileExtension', () => {
    it('should validate file extensions', () => {
      const validator = fileExtension(['jpg', 'png', 'gif'])

      expect(validator('photo.jpg').valid).toBe(true)
      expect(validator('image.PNG').valid).toBe(true) // 大小写不敏感
      expect(validator('document.pdf').valid).toBe(false)
    })

    it('should support custom error message', () => {
      const validator = fileExtension(['jpg'], '只允许 JPG 格式')

      const result = validator('image.png')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('只允许 JPG 格式')
    })

    it('should include metadata', () => {
      const validator = fileExtension(['jpg', 'png'])

      const result = validator('file.gif')
      expect(result.meta?.extensions).toEqual(['jpg', 'png'])
      expect(result.meta?.actualExt).toBe('gif')
    })
  })

  describe('mimeType', () => {
    it('should validate MIME types', () => {
      const validator = mimeType(['image/jpeg', 'image/png', 'image/gif'])

      expect(validator('image/jpeg').valid).toBe(true)
      expect(validator('IMAGE/JPEG').valid).toBe(true) // 大小写不敏感
      expect(validator('application/pdf').valid).toBe(false)
    })

    it('should support custom error message', () => {
      const validator = mimeType(['image/jpeg'], '只允许 JPEG 图片')

      const result = validator('image/png')
      expect(result.valid).toBe(false)
      expect(result.message).toBe('只允许 JPEG 图片')
    })
  })

  describe('languageCode', () => {
    it('should validate language codes', () => {
      expect(languageCode('en').valid).toBe(true)
      expect(languageCode('zh').valid).toBe(true)
      expect(languageCode('en-US').valid).toBe(true)
      expect(languageCode('zh-CN').valid).toBe(true)
      expect(languageCode('eng').valid).toBe(true) // ISO 639-2 (3位)
      expect(languageCode('EN').valid).toBe(false) // 必须小写
      expect(languageCode('en-us').valid).toBe(false) // 地区代码必须大写
      expect(languageCode('e').valid).toBe(false) // 太短
    })
  })

  describe('countryCode', () => {
    it('should validate country codes', () => {
      expect(countryCode('CN').valid).toBe(true)
      expect(countryCode('US').valid).toBe(true)
      expect(countryCode('UK').valid).toBe(true)
      expect(countryCode('cn').valid).toBe(false) // 必须大写
      expect(countryCode('USA').valid).toBe(false) // 必须2位
    })
  })

  describe('currencyCode', () => {
    it('should validate currency codes', () => {
      expect(currencyCode('CNY').valid).toBe(true)
      expect(currencyCode('USD').valid).toBe(true)
      expect(currencyCode('EUR').valid).toBe(true)
      expect(currencyCode('cny').valid).toBe(false) // 必须大写
      expect(currencyCode('US').valid).toBe(false) // 必须3位
    })
  })

  describe('cron', () => {
    it('should validate cron expressions', () => {
      expect(cron('0 0 * * *').valid).toBe(true) // 5段式
      expect(cron('0 0 0 * * *').valid).toBe(true) // 6段式
      expect(cron('*/5 * * * *').valid).toBe(true)
      expect(cron('0-59 * * * *').valid).toBe(true)
      expect(cron('0 0 * *').valid).toBe(false) // 只有4段
      expect(cron('0 0 * * * * *').valid).toBe(false) // 7段
    })
  })
})



