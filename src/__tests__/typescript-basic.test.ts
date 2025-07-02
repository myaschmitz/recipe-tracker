// Simple TypeScript test
const sum = (a: number, b: number): number => a + b

describe('TypeScript Basic Test', () => {
  test('should be able to run TypeScript', () => {
    expect(sum(2, 3)).toBe(5)
  })
})
