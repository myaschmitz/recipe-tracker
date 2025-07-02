// Simple test to verify relative import resolution  
import { cn } from '../lib/utils'

describe('Module Resolution Test', () => {
  test('should be able to import using relative path', () => {
    // Test that we can import a function using relative path
    expect(typeof cn).toBe('function')
    
    // Test that the function works
    const result = cn('class1', 'class2')
    expect(typeof result).toBe('string')
  })
})
