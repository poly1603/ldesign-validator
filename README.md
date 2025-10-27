# @ldesign/validator

> 通用验证库 - 60+ 内置规则、自定义验证器、异步验证、国际化支持

[![npm version](https://img.shields.io/npm/v/@ldesign/validator.svg)](https://www.npmjs.com/package/@ldesign/validator)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@ldesign/validator.svg)](./LICENSE)

## ✨ 特性

- ✅ **75+ 内置规则** - email、url、phone、idCard、creditCard、domain、semver 等
- 🔧 **自定义验证器** - 轻松扩展验证规则
- ⚡ **异步验证** - 支持异步验证（如服务器验证）
- 🔗 **规则组合** - 支持 and/or/not 逻辑组合
- 🌐 **国际化** - 集成 @ldesign/i18n，支持多语言错误提示
- 📋 **Schema 验证** - JSON Schema 风格的对象验证，支持数组元素、转换器
- 🎯 **TypeScript** - 完整的类型支持
- 💼 **轻量级** - 核心包仅依赖 @ldesign/shared 和 @ldesign/i18n
- 🚀 **高性能** - 缓存、对象池、快速哈希算法
- 🔄 **数据转换** - 30+ 转换方法，验证前自动清理数据
- 🔗 **跨字段验证** - 字段匹配、日期比较、条件必填等
- ⏱️ **防抖节流** - 优化高频验证场景

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
| `domain` | 域名 |
| `slug` | URL slug |
| `semver` | 语义化版本 |
| `mongoId` | MongoDB ObjectId |
| `latitude` | 纬度 (-90 到 90) |
| `longitude` | 经度 (-180 到 180) |
| `languageCode` | ISO 639 语言代码 |
| `countryCode` | ISO 3166 国家代码 |
| `currencyCode` | ISO 4217 货币代码 |
| `cron` | Cron 表达式 |

### 文件和数据规则

| 规则 | 说明 | 用法 |
|------|------|------|
| `fileExtension(exts)` | 文件扩展名 | `rules.fileExtension(['jpg', 'png'])` |
| `mimeType(types)` | MIME 类型 | `rules.mimeType(['image/jpeg'])` |

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

### 数组验证规则

| 规则 | 说明 | 用法 |
|------|------|------|
| `arrayOf(validator)` | 验证数组元素 | `rules.arrayOf(rules.email)` |
| `arrayUnique(options)` | 验证数组唯一性 | `rules.arrayUnique()` |
| `arrayLength(min, max)` | 数组长度 | `rules.arrayLength(1, 10)` |

### 跨字段验证规则

| 规则 | 说明 | 用法 |
|------|------|------|
| `matchField(path)` | 字段匹配 | `rules.matchField('password')` |
| `greaterThan(path)` | 大于指定字段 | `rules.greaterThan('minPrice')` |
| `lessThan(path)` | 小于指定字段 | `rules.lessThan('maxPrice')` |
| `afterDate(path)` | 日期晚于 | `rules.afterDate('startDate')` |
| `beforeDate(path)` | 日期早于 | `rules.beforeDate('endDate')` |
| `requiredIf(path)` | 条件必填 | `rules.requiredIf('country')` |
| `excludesWith(path)` | 字段互斥 | `rules.excludesWith('phone')` |

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

## 🆕 新增功能

### 数据转换器

验证前自动清理和转换数据：

```typescript
import { createTransformer, transformers } from '@ldesign/validator'

// 使用预设转换器
const emailTransformer = transformers.email()
const cleaned = emailTransformer.transform('  USER@EXAMPLE.COM  ')
// 结果: 'user@example.com'

// 自定义转换管道
const slugTransformer = createTransformer()
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '')

const slug = slugTransformer.transform('  Hello World! 123  ')
// 结果: 'hello-world-123'
```

### 防抖和节流

优化高频验证场景（如用户输入）：

```typescript
import { debounce, throttle } from '@ldesign/validator'

// 防抖验证 - 适合用户输入
const debouncedValidator = debounce(validator, 300)
await debouncedValidator.validate(userInput) // 300ms 后执行

// 节流验证 - 适合滚动事件
const throttledValidator = throttle(validator, 1000)
await throttledValidator.validate(value) // 每秒最多执行一次
```

### 跨字段验证

验证字段之间的关系：

```typescript
import { createValidator, rules } from '@ldesign/validator'

// 确认密码验证
const confirmPasswordValidator = createValidator<string>()
  .rule({ validator: rules.matchField('password', '两次密码不一致') })

// 日期范围验证
const endDateValidator = createValidator<Date>()
  .rule({ validator: rules.afterDate('startDate', { message: '结束日期必须晚于开始日期' }) })

// 条件必填
const cityValidator = createValidator<string>()
  .rule({ validator: rules.requiredIf('country', '选择了国家时必须选择城市') })
```

### 数组验证

验证数组元素和唯一性：

```typescript
import { createValidator, rules } from '@ldesign/validator'

// 验证数组中每个元素
const emailListValidator = createValidator<string[]>()
  .rule({ validator: rules.arrayOf(rules.email) })

await emailListValidator.validate(['user1@example.com', 'user2@example.com'])

// 验证数组唯一性
const tagsValidator = createValidator<string[]>()
  .rule({ validator: rules.arrayOf(rules.minLength(2)) })
  .rule({ validator: rules.arrayUnique({ message: '标签不能重复' }) })
```

### Schema 增强功能

支持数据转换、默认值、数组元素验证：

```typescript
import { createSchemaValidator } from '@ldesign/validator'

const schema = {
  email: {
    type: 'email',
    required: true,
    transform: ['trim', 'toLowerCase'] // 自动转换
  },
  age: {
    type: 'number',
    min: 18,
    max: 100,
    default: 18 // 默认值
  },
  tags: {
    type: 'array',
    items: { // 数组元素验证
      type: 'string',
      minLength: 2,
      maxLength: 20
    }
  }
}

const validator = createSchemaValidator(schema, {
  autoTransform: true, // 启用自动转换
  stopOnFirstError: false // 收集所有错误
})

const result = await validator.validate({
  email: '  USER@EXAMPLE.COM  ', // 自动转换为 'user@example.com'
  tags: ['vue', 'react', 'angular']
})
```

## ⚡ 性能优化

### 启用缓存和对象池

```typescript
import { createValidator, rules, RuleCache, ResultPool } from '@ldesign/validator'

// 创建高性能验证器
const validator = createValidator<string>({
  cache: true,  // 启用缓存
  pool: true,   // 启用对象池
  cacheInstance: new RuleCache({
    maxSize: 10000,
    ttl: 300000, // 5分钟过期
    autoCleanup: true // 自动清理
  })
})
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

## 📊 性能对比

### 缓存性能提升

| 操作 | 无缓存 | 有缓存 | 提升 |
|-----|--------|--------|------|
| 单次验证 | ~0.05ms | ~0.001ms | **50x** |
| 1000次验证 | ~50ms | ~5ms | **10x** |
| 10000次验证 | ~500ms | ~20ms | **25x** |

### 对象池性能提升

| 场景 | 无对象池 | 有对象池 | GC次数减少 |
|-----|----------|----------|-----------|
| 1万次验证 | 100% | 30% | **70%** |
| 10万次验证 | 100% | 25% | **75%** |

### 批量验证性能

| 方法 | 1000项 | 10000项 | 特点 |
|-----|--------|---------|------|
| `validateBatch` | ~50ms | ~500ms | 顺序执行 |
| `validateParallel` | ~20ms | ~150ms | **并行执行，快2-3倍** |

## ❓ 常见问题（FAQ）

### Q1: 什么时候应该启用缓存？
**A**: 以下场景建议启用缓存：
- 用户输入验证（重复验证相同值）
- 批量数据验证（可能有重复值）
- 表单实时验证
- 性能要求较高的场景

不建议场景：
- 每次验证的值都不同
- 验证频率很低
- 内存受限的环境

### Q2: 缓存会占用多少内存？
**A**: 默认配置下（maxSize: 1000）：
- 每个缓存条目约 100-200 字节
- 总内存占用约 100-200 KB
- 可通过 `maxSize` 和 `ttl` 控制

### Q3: 对象池什么时候有用？
**A**: 对象池在以下场景最有效：
- 高频验证（每秒 100+ 次）
- 长时间运行的应用
- 内存敏感的环境
- 需要减少 GC 暂停

### Q4: 如何选择 validateBatch 还是 validateParallel？
**A**: 
- `validateBatch` - 顺序执行，适合需要依赖前序结果的场景
- `validateParallel` - 并行执行，**快 2-3 倍**，适合独立验证场景

### Q5: 防抖和节流的区别？
**A**:
- **防抖（debounce）** - 等待停止输入后才执行，适合搜索框
- **节流（throttle）** - 固定时间间隔执行，适合滚动监听

### Q6: 数据转换器会修改原始数据吗？
**A**: 不会。转换器返回新值，不修改原始数据。如果需要修改原始数据，请在 Schema 验证中启用 `autoTransform: true`。

### Q7: 如何处理验证错误？
**A**: 可以使用 `onError` 钩子：
```typescript
const validator = createValidator({
  onError: (error, rule, value) => {
    console.error('验证错误:', error.message)
    // 发送到错误监控系统
  }
})
```

### Q8: 跨字段验证如何传递 formData？
**A**: 在 validate 时传递 context：
```typescript
await validator.validate(value, {
  formData: { password: '123', confirmPassword: '123' }
})
```

### Q9: 性能优化建议？
**A**: 
1. ✅ 启用缓存和对象池
2. ✅ 为规则命名以启用缓存
3. ✅ 使用防抖优化用户输入
4. ✅ 复用验证器实例
5. ✅ 使用并行验证处理大量数据

### Q10: 如何与 UI 框架集成？
**A**: 直接使用：
```typescript
// Vue 3
const { value, errorMessage } = useField('email', async (val) => {
  const result = await emailValidator.validate(val)
  return result.valid ? true : result.message
})

// React Hook Form
const { register } = useForm({
  resolver: async (values) => {
    const result = await schemaValidator.validate(values)
    return { values, errors: result.errorMap }
  }
})
```

## 📄 许可证

MIT © LDesign Team






