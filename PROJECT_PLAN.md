# @ldesign/validator 完整项目计划书

<div align="center">

# ✅ @ldesign/validator v0.1.0

**通用验证库 - 60+ 验证规则、Schema 验证、异步验证、国际化**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](./CHANGELOG.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](./tsconfig.json)
[![Rules](https://img.shields.io/badge/rules-60+-green.svg)](#功能清单)
[![Zero Dependencies](https://img.shields.io/badge/runtime--deps-0-success.svg)](#技术栈)

</div>

---

## 🚀 快速导航

| 想要... | 查看章节 | 预计时间 |
|---------|---------|---------|
| 📖 了解验证库 | [项目概览](#项目概览) | 3 分钟 |
| 🔍 查看参考项目 | [参考项目分析](#参考项目深度分析) | 15 分钟 |
| ✨ 查看所有规则 | [功能清单](#功能清单) | 20 分钟 |
| 🏗️ 了解架构 | [架构设计](#架构设计) | 10 分钟 |

---

## 📊 项目全景图

```
┌─────────────────────────────────────────────────────────────┐
│            @ldesign/validator - 验证库全景                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 核心能力                                                 │
│  ├─ ✅ 60+ 验证规则（内置）                                  │
│  ├─ 📋 Schema 验证（JSON Schema 风格）                      │
│  ├─ ⚡ 异步验证（服务器验证）                                │
│  ├─ 🌐 国际化（错误消息多语言）                              │
│  └─ 🔗 规则组合（and/or/not）                               │
│                                                             │
│  📏 验证规则分类                                             │
│  ├─ 基础规则（10个）                                        │
│  │   └─ required, minLength, maxLength, min, max, ...     │
│  ├─ 格式规则（15个）                                        │
│  │   └─ email, url, phone, idCard, ip, creditCard, ...   │
│  ├─ 类型规则（8个）                                         │
│  │   └─ string, number, boolean, array, object, date...  │
│  ├─ 字符串规则（12个）                                      │
│  │   └─ alpha, alphanumeric, numeric, lowercase, ...     │
│  └─ 高级规则（15+个）                                       │
│      └─ regex, custom, async, conditional, ...           │
│                                                             │
│  ⚡ 性能特性                                                 │
│  ├─ 🚀 快速验证（10,000 次/秒）                             │
│  ├─ 💾 零运行时依赖                                          │
│  ├─ 🎯 惰性求值（遇错即停）                                  │
│  └─ 💨 缓存优化                                              │
│                                                             │
│  🔧 高级功能                                                 │
│  ├─ 📋 Schema 验证器                                        │
│  ├─ 🔄 条件验证                                              │
│  ├─ 🔗 依赖字段验证                                          │
│  ├─ 🎨 自定义验证器                                          │
│  └─ 📊 验证报告生成                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 参考项目深度分析

### 1. zod (★★★★★)

**项目信息**:
- GitHub: https://github.com/colinhacks/zod
- Stars: 30,000+
- 定位: TypeScript 优先的 Schema 验证
- 下载量: 10M+/week

**核心特点**:
- ✅ TypeScript 类型推断
- ✅ Schema 构建器
- ✅ 链式 API
- ✅ 严格的类型安全
- ✅ 零依赖
- ✅ 浏览器 + Node.js

**借鉴要点**:
1. **Schema 定义** - z.object({ name: z.string() })
2. **类型推断** - type User = z.infer<typeof userSchema>
3. **链式验证** - z.string().min(3).max(20).email()
4. **错误处理** - ZodError 详细错误信息
5. **Refinements** - 自定义验证逻辑

**功能借鉴**:
- [ ] Schema 构建器API
- [ ] TypeScript 类型推断
- [x] 链式验证
- [ ] 详细错误信息
- [ ] Refinements（自定义验证）

**改进方向**:
- ➕ 更简洁的 API
- ➕ 国际化支持
- ➕ Vue/React 集成
- ➕ 表单联动

### 2. yup (★★★★★)

**项目信息**:
- GitHub: https://github.com/jquense/yup
- Stars: 22,000+
- 定位: JavaScript Schema 构建器
- 下载量: 12M+/week

**核心特点**:
- ✅ 流式 API（类似 jQuery）
- ✅ 强大的 Schema 验证
- ✅ 异步验证
- ✅ 条件验证（when）
- ✅ 依赖字段验证（ref）
- ✅ 国际化支持

**借鉴要点**:
1. **流式 API** - string().required().min(3).email()
2. **when() 条件** - 条件验证
3. **ref() 引用** - 引用其他字段
4. **transform()** - 数据转换
5. **国际化** - setLocale()

**功能借鉴**:
- [x] 流式 API（Validator 链式）
- [ ] when() 条件验证
- [ ] ref() 字段引用
- [ ] transform() 转换
- [ ] 国际化集成

**改进方向**:
- ➕ 更好的 TypeScript 支持
- ➕ 更快的性能
- ➕ 更小的 Bundle

### 3. joi (★★★★☆)

**项目信息**:
- GitHub: https://github.com/hapijs/joi
- Stars: 20,000+
- 团队: Hapi.js
- 定位: 强大的验证库

**核心特点**:
- ✅ 功能最全面
- ✅ 条件验证（alternatives）
- ✅ 依赖验证（dependencies）
- ✅ 自定义验证器（extend）
- ✅ 详细的错误信息
- ✅ 验证选项丰富

**借鉴要点**:
1. **alternatives** - 多选一验证
2. **dependencies** - 字段依赖
3. **custom** - 自定义验证
4. **messages** - 错误消息定制
5. **options** - 验证选项

**功能借鉴**:
- [ ] alternatives 验证
- [ ] 字段依赖系统
- [x] 自定义验证器
- [ ] 丰富的验证选项

**改进方向**:
- ➕ 浏览器优化（joi 较重）
- ➕ TypeScript 类型推断
- ➕ 更小的体积

### 4. validator.js (★★★★★)

**项目信息**:
- GitHub: https://github.com/validatorjs/validator.js
- Stars: 22,000+
- 定位: 字符串验证器集合
- 下载量: 20M+/week

**核心特点**:
- ✅ 60+ 字符串验证函数
- ✅ 零依赖
- ✅ 久经考验
- ✅ 国际化支持
- ✅ 浏览器 + Node.js

**借鉴要点**:
1. **丰富的验证规则** - email/url/creditCard/IBAN/ISBN...
2. **国际化** - 手机号、邮编等支持多国
3. **简单 API** - isEmail(str), isCreditCard(str)
4. **验证选项** - { min, max, ignore_whitespace }
5. **零依赖** - 纯函数实现

**功能借鉴**:
- [x] 基础验证规则（9个已实现）
- [x] 格式验证规则（15个已实现）
- [ ] 补充其余 36 个规则
- [ ] 国际化选项
- [x] 零依赖架构

**改进方向**:
- ➕ Schema 验证（validator.js 没有）
- ➕ 链式 API
- ➕ TypeScript 类型

### 5. vee-validate (★★★★☆)

**项目信息**:
- GitHub: https://github.com/logaretm/vee-validate
- Stars: 10,000+
- 定位: Vue 表单验证
- 特色: Vue 深度集成

**核心特点**:
- ✅ Vue 3 Composition API
- ✅ 表单验证集成
- ✅ 异步验证
- ✅ 国际化
- ✅ 错误消息定制
- ✅ 字段依赖

**借鉴要点**:
1. **Vue 集成** - useField/useForm composables
2. **异步验证** - Promise-based
3. **i18n 集成** - 多语言错误消息
4. **字段依赖** - 跨字段验证
5. **验证触发** - blur/change/submit

**功能借鉴**:
- [ ] Vue Composables（useValidator）
- [x] 异步验证支持
- [ ] i18n 集成
- [ ] 字段依赖验证
- [ ] 验证触发控制

**改进方向**:
- ➕ 框架无关（vee-validate 仅 Vue）
- ➕ React 支持
- ➕ 更多验证规则

### 参考项目功能对比

| 功能 | zod | yup | joi | validator.js | vee-validate | **@ldesign/validator** |
|------|-----|-----|-----|--------------|--------------|----------------------|
| 验证规则数 | 20+ | 30+ | 40+ | 60+ | 30+ | **60+** 🎯 |
| Schema 验证 | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| 类型推断 | ✅ | ⚠️ | ❌ | ❌ | ❌ | ✅ |
| 异步验证 | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| 链式 API | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| 国际化 | ❌ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ 🎯 |
| Vue 集成 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ 🎯 |
| React 集成 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 🎯 |
| 条件验证 | ⚠️ | ✅ | ✅ | ❌ | ⚠️ | ✅ 🎯 |
| Bundle 大小 | 58KB | 45KB | 大 | 小 | 18KB | **<30KB** 🎯 |

**总结**: @ldesign/validator 结合了 TypeScript 类型安全（zod）+ 丰富规则（validator.js）+ 框架集成（vee-validate）。

---

## ✨ 功能清单

### P0 核心功能（25项）

#### 基础验证规则（10个）

- [x] **required** - 必填验证（参考: 所有）
  - ✅ null/undefined/空字符串检查
  - ✅ 自定义错误消息
  
- [x] **minLength** - 最小长度（参考: zod, yup）
  - ✅ 字符串长度验证
  - ✅ 数组长度验证
  - ✅ 参数化规则

- [x] **maxLength** - 最大长度（参考: zod, yup）
  - ✅ 字符串长度限制
  - ✅ 数组长度限制

- [x] **min** - 最小值（参考: zod, yup）
  - ✅ 数字最小值
  - ✅ 日期最早时间

- [x] **max** - 最大值（参考: zod, yup）
  - ✅ 数字最大值
  - ✅ 日期最晚时间

- [x] **range** - 范围验证（参考: joi）
  - ✅ 数字范围
  - ✅ min + max 组合

- [x] **pattern** - 正则表达式（参考: 所有）
  - ✅ 自定义正则
  - ✅ 错误消息定制

- [x] **oneOf** - 枚举验证（参考: zod）
  - ✅ 值在列表中
  - ✅ 类型安全

- [x] **equals** - 相等验证（参考: yup）
  - ✅ 值相等比较
  - ✅ 确认密码场景

- [x] **type** - 类型验证（参考: joi）
  - ✅ typeof 检查
  - ✅ Array.isArray 检查

#### 格式验证规则（15个）

- [x] **email** - 邮箱验证（参考: validator.js）
  - ✅ RFC 5322 标准
  - ✅ 通用邮箱格式

- [x] **url** - URL 验证（参考: validator.js）
  - ✅ 使用 URL API
  - ✅ 协议检查

- [x] **phone** - 手机号验证（参考: validator.js）
  - ✅ 中国大陆手机号
  - [ ] 国际手机号（E.164）
  - [ ] 多国手机号

- [x] **idCard** - 身份证验证（参考: validator.js）
  - ✅ 18 位身份证
  - ✅ 校验码验证
  - [ ] 15 位身份证

- [x] **ipv4** - IPv4 地址（参考: validator.js）
  - ✅ 标准 IPv4 格式

- [ ] **ipv6** - IPv6 地址（参考: validator.js）
  - 待实现

- [x] **numeric** - 数字字符串（参考: validator.js）
  - ✅ 纯数字验证

- [x] **integer** - 整数验证（参考: validator.js）
  - ✅ 整数检查

- [x] **alpha** - 字母验证（参考: validator.js）
  - ✅ 纯字母检查

- [x] **alphanumeric** - 字母数字（参考: validator.js）
  - ✅ 字母+数字

- [x] **date** - 日期验证（参考: zod）
  - ✅ Date 对象验证
  - ✅ 日期字符串验证

- [x] **json** - JSON 验证（参考: validator.js）
  - ✅ JSON.parse 检查

- [x] **creditCard** - 信用卡（参考: validator.js）
  - ✅ Luhn 算法验证

- [x] **postalCode** - 邮政编码（参考: validator.js）
  - ✅ 中国邮编
  - [ ] 国际邮编

- [x] **strongPassword** - 强密码（参考: validator.js）
  - ✅ 长度 + 大小写 + 数字 + 特殊字符

#### Schema 验证系统

- [x] **SchemaValidator** - Schema 验证器（参考: zod, yup）
  - ✅ 对象 Schema 定义
  - ✅ 嵌套 Schema 支持
  - ✅ 数组验证
  - ✅ 详细错误报告

- [x] **Validator 类** - 验证器核心（参考: yup）
  - ✅ 链式 API
  - ✅ 规则组合
  - ✅ 异步支持

### P1 高级功能（20项）

#### 更多验证规则（15个）

- [ ] **uuid** - UUID 验证（参考: validator.js）
- [ ] **mac** - MAC 地址（参考: validator.js）
- [ ] **port** - 端口号（参考: validator.js）
- [ ] **md5** - MD5 哈希（参考: validator.js）
- [ ] **hex** - 十六进制（参考: validator.js）
- [ ] **hexColor** - 十六进制颜色（参考: validator.js）
- [ ] **base64** - Base64 编码（参考: validator.js）
- [ ] **jwt** - JWT Token（参考: validator.js）
- [ ] **iban** - 国际银行账号（参考: validator.js）
- [ ] **isbn** - 国际标准书号（参考: validator.js）
- [ ] **issn** - 国际标准刊号（参考: validator.js）
- [ ] **lowercase** - 小写字母（参考: validator.js）
- [ ] **uppercase** - 大写字母（参考: validator.js）
- [ ] **length** - 精确长度（参考: zod）
- [ ] **startsWith/endsWith** - 前缀后缀（参考: zod）

#### 高级验证

- [ ] **条件验证 when()** - 条件规则（参考: yup）
  ```typescript
  when('country', {
    is: 'China',
    then: rule(idCard),
    otherwise: rule(passport)
  })
  ```

- [ ] **字段引用 ref()** - 引用其他字段（参考: yup）
  ```typescript
  field('confirmPassword').equals(ref('password'))
  ```

- [ ] **规则组合** - and/or/not（参考: joi）
  ```typescript
  and(minLength(8), pattern(/[A-Z]/))
  or(email, phone)
  not(contains('admin'))
  ```

- [ ] **自定义错误消息模板**（参考: yup）
  ```typescript
  field('age').min(18).message('年龄必须 ≥ ${min}')
  ```

- [ ] **数据转换 transform()** - 验证前转换（参考: yup）
  ```typescript
  field('email').transform(v => v.trim().toLowerCase()).email()
  ```

### P2 扩展功能（12项）

#### 表单集成

- [ ] **表单联动规则引擎**
  - 字段显示/隐藏控制
  - 字段禁用/启用控制
  - 字段值联动
  - 复杂业务规则

- [ ] **Vue Composables**（参考: vee-validate）
  - useValidator() - 验证 hook
  - useField() - 字段验证
  - useForm() - 表单验证
  
- [ ] **React Hooks**
  - useValidator()
  - useField()
  - useForm()

#### 验证工具

- [ ] **可视化规则编辑器**
  - Web 应用
  - 拖拽构建规则
  - 生成 Schema 代码
  - 测试验证规则

- [ ] **正则表达式辅助**
  - 常用正则库
  - 正则测试工具
  - 正则生成器

- [ ] **规则市场**
  - 分享验证规则
  - 下载规则包
  - 规则评分

#### 高级特性

- [ ] **验证报告**
  - 详细验证结果
  - 字段错误映射
  - 可视化报告

- [ ] **批量验证**
  - 批量数据验证
  - 验证结果聚合
  - 性能优化

- [ ] **验证缓存**
  - 缓存验证结果
  - 智能缓存失效

- [ ] **验证中间件**
  - Express 中间件
  - Koa 中间件

---

## 🏗️ 架构设计

### 整体架构

```
┌────────────────────────────────────────────────────────┐
│                @ldesign/validator                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐      ┌───────────┐    ┌──────────┐     │
│  │ Validator│ ────▶│   Rules   │───▶│  Result  │     │
│  │  Core    │      │  Engine   │    │  Object  │     │
│  └──────────┘      └───────────┘    └──────────┘     │
│       │                  │                │           │
│       │                  │                │           │
│       ▼                  ▼                ▼           │
│  规则链执行          规则库调用        返回验证结果    │
│  - 串行执行          - 60+ 规则       - valid         │
│  - 遇错即停          - 自定义规则     - message       │
│  - 异步支持          - 规则组合       - code          │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │           SchemaValidator                    │    │
│  ├─ Schema 解析                                  │    │
│  ├─ 对象验证                                     │    │
│  ├─ 嵌套验证                                     │    │
│  └─ 错误聚合                                     │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 核心类设计

```typescript
// Validator 核心类
class Validator<T> {
  private rules: ValidationRule<T>[] = []
  
  rule(rule: ValidationRule<T>): this          // 添加规则
  validate(value: T, context?): Promise<Result> // 验证（异步）
  validateSync(value: T, context?): Result     // 验证（同步）
}

// Schema 验证器
class SchemaValidator {
  private schema: Schema
  
  validate(data: object, context?): Promise<SchemaValidationResult>
  validateField(field, value, rule): Promise<Result>
}

// 验证规则函数
type ValidatorFunction<T> = (
  value: T,
  context?: ValidationContext
) => ValidationResult | Promise<ValidationResult>
```

### 验证流程

```
用户输入
  │
  ▼
validator.validate(value)
  │
  ├─→ 遍历规则链
  │    ├─→ 规则 1: required
  │    ├─→ 规则 2: minLength(3)
  │    └─→ 规则 3: email
  │         │
  │         ├─→ 验证失败 → 返回错误
  │         └─→ 验证成功 → 继续
  │
  ▼
返回最终结果
  ├─ valid: boolean
  ├─ message: string
  └─ code: string
```

---

## 🛠️ 技术栈

### 核心技术

- **TypeScript 5.7+**
- **ES2020**
- **正则表达式**

### 内部依赖

```json
{
  "dependencies": {
    "@ldesign/i18n": "workspace:*",      // 国际化
    "@ldesign/shared": "workspace:*"     // 工具函数
  }
}
```

### 外部依赖

**运行时**: 无 ✅

---

## 🗺️ 开发路线图

### v0.1.0 - MVP（当前）✅

**已完成**:
- [x] Validator 核心类
- [x] 基础规则（9个）
- [x] 格式规则（15个）
- [x] SchemaValidator
- [x] 异步验证支持

**待完善**:
- [ ] 补充文档
- [ ] 添加测试
- [ ] 优化性能

### v0.2.0 - 完整规则（3-4周）

**功能**:
- [ ] 补充 36 个规则（共 60 个）
- [ ] when() 条件验证
- [ ] ref() 字段引用
- [ ] 规则组合（and/or/not）
- [ ] 完整测试

**目标**: 60 个验证规则

### v0.3.0 - 框架集成（4-5周）

**功能**:
- [ ] Vue Composables
- [ ] React Hooks
- [ ] 表单联动引擎
- [ ] 国际化完整支持

**目标**: 深度框架集成

### v1.0.0 - 生产就绪（8-10周）

**功能**:
- [ ] 可视化规则编辑器
- [ ] 正则辅助工具
- [ ] 规则市场
- [ ] 完整文档
- [ ] 100% 测试覆盖

**目标**: 生产环境可用

---

## 📋 详细任务分解

### Week 1-2: v0.1.0 完善

#### Week 1
- [ ] 补充 15 个格式规则（3天）
  - uuid, mac, port, md5, hex
  - hexColor, base64, jwt
  - iban, isbn, issn
  - lowercase, uppercase
  - length, startsWith/endsWith

- [ ] 单元测试（2天）
  - 所有规则测试
  - Validator 类测试
  - SchemaValidator 测试

#### Week 2
- [ ] 文档（3天）
  - 完善 README
  - API 文档
  - 规则文档（每个规则）
  
- [ ] 性能优化（2天）
  - 验证性能测试
  - 优化算法

### Week 3-6: v0.2.0 开发

#### Week 3-4: 高级规则
- [ ] when() 条件验证（5天）
- [ ] ref() 字段引用（3天）
- [ ] 规则组合（2天）

#### Week 5-6: 测试和文档
- [ ] 完整测试（5天）
- [ ] 完整文档（5天）

---

## 🧪 测试策略

### 单元测试

**覆盖率目标**: >90%

**测试内容**:
- 所有 60 个验证规则
- Validator 类所有方法
- SchemaValidator 所有方法
- 边界情况测试

**示例**:
```typescript
describe('email validator', () => {
  it('validates correct email', async () => {
    const result = await email('user@example.com')
    expect(result.valid).toBe(true)
  })
  
  it('rejects invalid email', async () => {
    const result = await email('invalid-email')
    expect(result.valid).toBe(false)
    expect(result.code).toBe('INVALID_EMAIL')
  })
})
```

---

## 📊 性能目标

| 版本 | 验证速度 | Bundle 大小 |
|------|---------|------------|
| v0.1.0 | 5,000/s | ~20KB |
| v0.2.0 | 10,000/s | <25KB |
| v0.3.0 | 15,000/s | <28KB |
| v1.0.0 | **20,000/s** | **<30KB** |

---

**文档版本**: 1.0  
**创建时间**: 2025-10-22






