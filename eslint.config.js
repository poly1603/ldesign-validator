import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/es/**',
    '**/lib/**',
    '**/coverage/**',
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'unused-imports/no-unused-vars': 'warn',
  },
})






