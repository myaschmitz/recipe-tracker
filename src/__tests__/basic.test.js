// Simple test to verify Jest setup
describe('Basic Jest Setup', () => {
  test('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  test('should be able to test objects', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(42)
  })
})
