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
| `ipv6` | IPv6 地址 |
| `numeric` | 数字 |
| `integer` | 整数 |
| `alpha` | 字母 |
| `alphanumeric` | 字母和数字 |
| `lowercase` | 纯小写字母 |
| `uppercase` | 纯大写字母 |
| `date` | 日期 |
| `json` | JSON 字符串 |
| `creditCard` | 信用卡号 |
| `postalCode` | 邮政编码 |
| `strongPassword` | 强密码 |
| `uuid` | UUID (v1/v3/v4/v5) |
| `mac` | MAC 地址 |
| `port` | 端口号 (1-65535) |
| `md5` | MD5 哈希 |
| `sha1` | SHA1 哈希 |
| `sha256` | SHA256 哈希 |
| `sha512` | SHA512 哈希 |
| `hex` | 十六进制字符串 |
| `hexColor` | 十六进制颜色 |
| `base64` | Base64 编码 |
| `jwt` | JWT Token |
| `iban` | 国际银行账号 |
| `isbn` | 国际标准书号 |
| `issn` | 国际标准刊号 |

### 字符串规则

| 规则 | 说明 | 用法 |
|------|------|------|
| `length(n)` | 精确长度 | `rules.length(10)` |
| `startsWith(prefix)` | 前缀验证 | `rules.startsWith('http')` |
| `endsWith(suffix)` | 后缀验证 | `rules.endsWith('.com')` |
| `contains(substring)` | 包含子串 | `rules.contains('@')` |
| `notContains(substring)` | 不包含子串 | `rules.notContains('admin')` |
| `trim()` | 去除首尾空格 | `rules.trim()` |

### 类型规则

| 规则 | 说明 |
|------|------|
| `isString` | 字符串类型 |
| `isNumber` | 数字类型 |
| `isBoolean` | 布尔类型 |
| `isArray` | 数组类型 |
| `isObject` | 对象类型 |
| `isNull` | null 检查 |
| `isUndefined` | undefined 检查 |
| `isFunction` | 函数类型 |
| `isSymbol` | Symbol 类型 |
| `isDate` | Date 对象 |

### 高级规则

| 规则 | 说明 | 用法 |
|------|------|------|
| `when(condition, options)` | 条件验证 | 见下文示例 |
| `ref(fieldPath)` | 字段引用 | `rules.ref('password')` |
| `and(...rules)` | 规则与组合 | `rules.and(rule1, rule2)` |
| `or(...rules)` | 规则或组合 | `rules.or(rule1, rule2)` |
| `not(rule)` | 规则非 | `rules.not(rule)` |
| `custom(fn)` | 自定义验证 | 见下文示例 |
| `lazy(fn)` | 惰性规则 | 见下文示例 |
| `conditional(routes)` | 多条件路由 | 见下文示例 |

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

## 🚀 高级功能示例

### 条件验证 (when)

```typescript
import { createValidator, rules } from '@ldesign/validator'

const validator = createValidator<string>()
  .rule({
    validator: rules.when(
      (value, context) => context?.formData?.country === 'China',
      {
        then: rules.idCard,
        otherwise: rules.pattern(/^[A-Z0-9]+$/, '请输入有效的护照号'),
      },
    ),
  })

// 中国身份证验证
await validator.validate('110101199001011234', { formData: { country: 'China' } })

// 国外护照验证
await validator.validate('AB123456', { formData: { country: 'USA' } })
```

### 字段引用 (ref)

```typescript
const validator = createValidator<string>()
  .rule({
    validator: (value, context) => {
      const password = rules.ref('password')(context)
      return rules.equals(password, '两次密码不一致')(value, context)
    },
  })

await validator.validate('password123', {
  formData: {
    password: 'password123',
    confirmPassword: 'password123',
  },
})
```

### 规则组合 (and/or/not)

```typescript
// AND: 所有规则都必须通过
const strongPasswordValidator = createValidator<string>()
  .rule({
    validator: rules.and(
      rules.minLength(8),
      rules.pattern(/[A-Z]/, '必须包含大写字母'),
      rules.pattern(/[0-9]/, '必须包含数字'),
      rules.pattern(/[!@#$%^&*]/, '必须包含特殊字符'),
    ),
  })

// OR: 至少一个规则通过
const contactValidator = createValidator<string>()
  .rule({
    validator: rules.or(
      rules.email,
      rules.phone,
    ),
  })

// NOT: 规则取反
const usernameValidator = createValidator<string>()
  .rule({
    validator: rules.not(
      rules.contains('admin'),
      '用户名不能包含 admin',
    ),
  })
```

### 批量验证

```typescript
const emailValidator = createValidator<string>()
  .rule({ validator: rules.email })

const emails = [
  'user1@example.com',
  'invalid-email',
  'user2@example.com',
]

// 顺序验证
const result = await emailValidator.validateBatch(emails)
console.log(result.valid) // false
console.log(result.failures.length) // 1

// 并行验证（更快）
const result2 = await emailValidator.validateParallel(emails)
```

### 自定义验证器

```typescript
const validator = createValidator<string>()
  .rule({
    validator: rules.custom(
      async (value) => {
        // 可以是同步或异步
        const response = await fetch(`/api/check?value=${value}`)
        const data = await response.json()
        return data.available
      },
      '该值已被使用',
      'VALUE_TAKEN',
    ),
  })
```

### 惰性规则 (lazy)

```typescript
const validator = createValidator<any>()
  .rule({
    validator: rules.lazy((value) => {
      // 根据值的类型动态选择规则
      if (typeof value === 'string') {
        return rules.email
      }
      else if (typeof value === 'number') {
        return rules.range(0, 100)
      }
      return rules.isObject
    }),
  })
```

### 多条件路由 (conditional)

```typescript
const validator = createValidator<string>()
  .rule({
    validator: rules.conditional(
      [
        {
          condition: (value, context) => context?.type === 'email',
          validator: rules.email,
        },
        {
          condition: (value, context) => context?.type === 'phone',
          validator: rules.phone,
        },
        {
          condition: (value, context) => context?.type === 'url',
          validator: rules.url,
        },
      ],
      rules.required, // 默认规则
    ),
  })
```

## ⚡ 性能优化

### 启用缓存

```typescript
import { createValidator, rules } from '@ldesign/validator'

// 创建带缓存的验证器
const validator = createValidator<string>({ cache: true })
  .rule({ name: 'email', validator: rules.email })

// 第一次验证
await validator.validate('user@example.com') // 执行验证

// 第二次验证相同值（使用缓存，极快）
await validator.validate('user@example.com') // 从缓存获取

// 查看缓存统计
const stats = validator.getCacheStats()
console.log(stats)
// { hits: 1, misses: 1, hitRate: '50.00%', size: 1 }
```

### 批量验证优化

```typescript
const validator = createValidator<string>()
  .rule({ validator: rules.email })

const emails = Array.from({ length: 10000 }, (_, i) => `user${i}@example.com`)

// 顺序验证（适合依赖前序结果）
const result1 = await validator.validateBatch(emails)

// 并行验证（适合独立验证，更快）
const result2 = await validator.validateParallel(emails)
```

### 自定义缓存配置

```typescript
import { createValidator, RuleCache } from '@ldesign/validator'

// 创建自定义缓存实例
const cache = new RuleCache({
  maxSize: 5000,        // 最大缓存条目数
  ttl: 60000,           // 缓存过期时间（毫秒）
  enabled: true,        // 是否启用
})

const validator = createValidator<string>({
  cache: true,
  cacheInstance: cache,
})
```

### 性能基准

在标准硬件上的性能表现：

| 操作 | 性能 |
|------|------|
| 单次验证（无缓存） | ~0.05ms |
| 单次验证（有缓存） | ~0.001ms |
| 批量验证（1000项） | ~50ms |
| 并行验证（1000项） | ~20ms |
| 缓存命中率 | >80% |

## 📊 最佳实践

### 1. 为规则命名以启用缓存

```typescript
// ✅ 好 - 有名称，可以被缓存
.rule({ name: 'email', validator: rules.email })

// ❌ 不好 - 无名称，无法缓存
.rule({ validator: rules.email })
```

### 2. 对重复验证启用缓存

```typescript
// 用户输入验证场景
const validator = createValidator<string>({ cache: true })
  .rule({ name: 'email', validator: rules.email })

// 用户每次输入都会触发验证，缓存会显著提升性能
```

### 3. 使用并行验证处理大量数据

```typescript
// ✅ 好 - 并行验证
await validator.validateParallel(largeArray)

// ❌ 不好 - 顺序验证（慢）
for (const item of largeArray) {
  await validator.validate(item)
}
```

### 4. 合理使用 stopOnFirstError

```typescript
// 表单验证 - 提前停止可以更快反馈
const formValidator = createValidator({ stopOnFirstError: true })

// 数据导入 - 收集所有错误更有用
const importValidator = createValidator({ stopOnFirstError: false })
```

### 5. 复用验证器实例

```typescript
// ✅ 好 - 复用实例
const emailValidator = createValidator<string>({ cache: true })
  .rule({ name: 'email', validator: rules.email })

// 在多处使用同一个实例
await emailValidator.validate(email1)
await emailValidator.validate(email2)

// ❌ 不好 - 每次创建新实例
await createValidator<string>().rule({ validator: rules.email }).validate(email1)
await createValidator<string>().rule({ validator: rules.email }).validate(email2)
```

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






