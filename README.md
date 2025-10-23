# @ldesign/validator

> 通用验证库 - 60+ 内置规则、自定义验证器、异步验证、国际化支持

[![npm version](https://img.shields.io/npm/v/@ldesign/validator.svg)](https://www.npmjs.com/package/@ldesign/validator)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@ldesign/validator.svg)](./LICENSE)

## ✨ 特性

- ✅ **60+ 内置规则** - email、url、phone、idCard、creditCard 等
- 🔧 **自定义验证器** - 轻松扩展验证规则
- ⚡ **异步验证** - 支持异步验证（如服务器验证）
- 🔗 **规则组合** - 支持 and/or/not 逻辑组合
- 🌐 **国际化** - 集成 @ldesign/i18n，支持多语言错误提示
- 📋 **Schema 验证** - JSON Schema 风格的对象验证
- 🎯 **TypeScript** - 完整的类型支持
- 💼 **零依赖** - 核心包无外部运行时依赖

## 📦 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/validator

# 使用 npm
npm install @ldesign/validator

# 使用 yarn
yarn add @ldesign/validator
```

## 🚀 快速开始

### 基础验证

```typescript
import { createValidator, rules } from '@ldesign/validator'

// 创建验证器
const emailValidator = createValidator<string>()
  .rule({ validator: rules.required, message: '邮箱不能为空' })
  .rule({ validator: rules.email })

// 验证
const result = await emailValidator.validate('user@example.com')
console.log(result.valid) // true

const result2 = await emailValidator.validate('invalid-email')
console.log(result2.valid) // false
console.log(result2.message) // '请输入有效的邮箱地址'
```

### 链式验证

```typescript
import { createValidator, rules } from '@ldesign/validator'

const passwordValidator = createValidator<string>()
  .rule({ validator: rules.required, message: '密码不能为空' })
  .rule({ validator: rules.minLength(8), message: '密码至少8个字符' })
  .rule({ validator: rules.strongPassword })

const result = await passwordValidator.validate('weak')
// { valid: false, message: '密码至少8个字符' }
```

### Schema 验证

```typescript
import { createSchemaValidator } from '@ldesign/validator'

// 定义 Schema
const userSchema = {
  username: {
    type: 'string',
    required: true,
    min: 3,
    max: 20,
    message: '用户名长度必须在 3-20 个字符之间',
  },
  email: {
    type: 'email',
    required: true,
  },
  age: {
    type: 'number',
    min: 18,
    max: 100,
    message: '年龄必须在 18-100 之间',
  },
  phone: {
    type: 'string',
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号',
  },
}

// 创建验证器
const validator = createSchemaValidator(userSchema)

// 验证数据
const result = await validator.validate({
  username: 'john',
  email: 'john@example.com',
  age: 25,
  phone: '13812345678',
})

console.log(result.valid) // true
console.log(result.errors) // []
```

## 📖 内置规则

### 基础规则

| 规则 | 说明 | 用法 |
|------|------|------|
| `required` | 必填 | `rules.required` |
| `minLength(n)` | 最小长度 | `rules.minLength(3)` |
| `maxLength(n)` | 最大长度 | `rules.maxLength(20)` |
| `min(n)` | 最小值 | `rules.min(0)` |
| `max(n)` | 最大值 | `rules.max(100)` |
| `range(min, max)` | 范围 | `rules.range(0, 100)` |
| `pattern(regex)` | 正则 | `rules.pattern(/^\d+$/)` |
| `oneOf(values)` | 枚举 | `rules.oneOf(['a', 'b'])` |
| `equals(value)` | 相等 | `rules.equals('123')` |

### 格式规则

| 规则 | 说明 |
|------|------|
| `email` | Email 格式 |
| `url` | URL 格式 |
| `phone` | 手机号（中国） |
| `idCard` | 身份证号（中国） |
| `ipv4` | IPv4 地址 |
| `numeric` | 数字 |
| `integer` | 整数 |
| `alpha` | 字母 |
| `alphanumeric` | 字母和数字 |
| `date` | 日期 |
| `json` | JSON 字符串 |
| `creditCard` | 信用卡号 |
| `postalCode` | 邮政编码 |
| `strongPassword` | 强密码 |

## 🔧 高级用法

### 自定义验证器

```typescript
import { createValidator } from '@ldesign/validator'

const validator = createValidator<string>()
  .rule({
    name: 'custom-rule',
    validator: (value) => {
      const valid = value.includes('@')
      return {
        valid,
        message: valid ? undefined : '必须包含 @ 符号',
        code: 'CUSTOM_ERROR',
      }
    },
  })
```

### 异步验证

```typescript
const usernameValidator = createValidator<string>()
  .rule({ validator: rules.required })
  .rule({
    name: 'unique-username',
    validator: async (value) => {
      // 向服务器验证用户名是否已存在
      const response = await fetch(`/api/check-username?username=${value}`)
      const data = await response.json()

      return {
        valid: data.available,
        message: data.available ? undefined : '用户名已被使用',
        code: 'USERNAME_TAKEN',
      }
    },
  })

const result = await usernameValidator.validate('john')
```

### 依赖字段验证

```typescript
const confirmPasswordValidator = createValidator<string>()
  .rule({ validator: rules.required })
  .rule({
    name: 'match-password',
    validator: (value, context) => {
      const password = context?.formData?.password
      const valid = value === password

      return {
        valid,
        message: valid ? undefined : '两次密码输入不一致',
        code: 'PASSWORD_MISMATCH',
      }
    },
  })

// 验证时传入上下文
const result = await confirmPasswordValidator.validate('password123', {
  formData: {
    password: 'password123',
    confirmPassword: 'password123',
  },
})
```

### Schema 嵌套验证

```typescript
const addressSchema = {
  street: { type: 'string', required: true },
  city: { type: 'string', required: true },
  zipCode: { type: 'string', pattern: /^\d{6}$/ },
}

const userSchema = {
  name: { type: 'string', required: true },
  address: {
    type: 'object',
    required: true,
    schema: addressSchema,
  },
}

const validator = createSchemaValidator(userSchema)

const result = await validator.validate({
  name: 'John',
  address: {
    street: '123 Main St',
    city: 'Beijing',
    zipCode: '100000',
  },
})
```

## 📊 性能

- ⚡ **快速验证** - 优化的验证算法
- 🚀 **惰性求值** - 遇到错误立即停止
- 💾 **零开销** - 无外部依赖
- 📦 **Tree-shaking** - 按需导入规则

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 测试
pnpm test

# 开发模式
pnpm dev
```

## 📄 许可证

MIT © LDesign Team



