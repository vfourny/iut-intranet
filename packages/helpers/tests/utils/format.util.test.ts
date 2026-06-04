import { toKebabCase } from '@/utils/format.util'

describe('toKebabCase', () => {
  it('should convert camelCase to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world')
  })

  it('should convert spaces and underscores to hyphens', () => {
    expect(toKebabCase('Hello World_foo')).toBe('hello-world-foo')
  })

  it('should collapse repeated separators', () => {
    expect(toKebabCase('foo   bar')).toBe('foo-bar')
  })

  it('should lowercase an already simple word', () => {
    expect(toKebabCase('Foo')).toBe('foo')
  })
})
