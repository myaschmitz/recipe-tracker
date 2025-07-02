/**
 * Advanced Unit Testing Utilities
 * 
 * Provides testing utilities and edge case coverage for the recipe tracker
 * application, including performance testing, error boundary testing, and
 * complex data validation scenarios.
 */

describe('Advanced Testing Utilities', () => {
  describe('Mock Data Generators', () => {
    const generateMockRecipe = (overrides: any = {}) => ({
      id: Math.floor(Math.random() * 1000),
      name: `Recipe ${Math.random().toString(36).substring(7)}`,
      description: 'Generated test recipe',
      instructions: 'Mix and cook',
      ingredients: [
        { name: 'Flour', amount: 2, unitId: 1, note: 'All-purpose' }
      ],
      tags: [1, 2],
      collections: [1],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      ...overrides
    })

    const generateMockCollection = (overrides: any = {}) => ({
      id: Math.floor(Math.random() * 100),
      name: `Collection ${Math.random().toString(36).substring(7)}`,
      description: 'Generated test collection',
      ...overrides
    })

    it('should generate consistent mock recipes', () => {
      const recipe1 = generateMockRecipe({ name: 'Test Recipe 1' })
      const recipe2 = generateMockRecipe({ name: 'Test Recipe 2' })

      expect(recipe1.name).toBe('Test Recipe 1')
      expect(recipe2.name).toBe('Test Recipe 2')
      expect(recipe1.ingredients).toHaveLength(1)
      expect(recipe2.ingredients).toHaveLength(1)
    })

    it('should generate mock collections with overrides', () => {
      const collection = generateMockCollection({ 
        name: 'Specific Collection',
        description: 'Custom description'
      })

      expect(collection.name).toBe('Specific Collection')
      expect(collection.description).toBe('Custom description')
      expect(typeof collection.id).toBe('number')
    })
  })

  describe('Data Validation Edge Cases', () => {
    const validateRecipeData = (data: any) => {
      const errors: string[] = []

      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string')
      }

      if (!data.instructions || typeof data.instructions !== 'string') {
        errors.push('Instructions are required and must be a string')
      }

      if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
        errors.push('At least one ingredient is required')
      }

      if (data.ingredients) {
        data.ingredients.forEach((ingredient: any, index: number) => {
          if (!ingredient.name || typeof ingredient.name !== 'string') {
            errors.push(`Ingredient ${index + 1}: Name is required`)
          }
          if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
            errors.push(`Ingredient ${index + 1}: Amount must be a positive number`)
          }
        })
      }

      if (data.prepTime !== undefined && (typeof data.prepTime !== 'number' || data.prepTime < 0)) {
        errors.push('Prep time must be a non-negative number')
      }

      if (data.cookTime !== undefined && (typeof data.cookTime !== 'number' || data.cookTime < 0)) {
        errors.push('Cook time must be a non-negative number')
      }

      if (data.servings !== undefined && (typeof data.servings !== 'number' || data.servings <= 0)) {
        errors.push('Servings must be a positive number')
      }

      return { isValid: errors.length === 0, errors }
    }

    it('should validate complete valid recipe', () => {
      const validRecipe = {
        name: 'Valid Recipe',
        instructions: 'Cook it well',
        ingredients: [
          { name: 'Salt', amount: 1, unitId: 1 }
        ],
        prepTime: 10,
        cookTime: 20,
        servings: 4
      }

      const result = validateRecipeData(validRecipe)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should catch missing required fields', () => {
      const invalidRecipe = {
        name: '',
        instructions: '',
        ingredients: []
      }

      const result = validateRecipeData(invalidRecipe)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Name is required and must be a non-empty string')
      expect(result.errors).toContain('Instructions are required and must be a string')
      expect(result.errors).toContain('At least one ingredient is required')
    })

    it('should validate ingredient requirements', () => {
      const recipeWithBadIngredients = {
        name: 'Recipe with bad ingredients',
        instructions: 'Cook it',
        ingredients: [
          { name: '', amount: 0 },
          { name: 'Valid ingredient', amount: -5 },
          { amount: 2 } // missing name
        ]
      }

      const result = validateRecipeData(recipeWithBadIngredients)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Ingredient 1: Name is required')
      expect(result.errors).toContain('Ingredient 1: Amount must be a positive number')
      expect(result.errors).toContain('Ingredient 2: Amount must be a positive number')
      expect(result.errors).toContain('Ingredient 3: Name is required')
    })

    it('should validate optional numeric fields', () => {
      const recipeWithInvalidNumbers = {
        name: 'Test Recipe',
        instructions: 'Cook it',
        ingredients: [{ name: 'Salt', amount: 1 }],
        prepTime: -5,
        cookTime: 'not a number',
        servings: 0
      }

      const result = validateRecipeData(recipeWithInvalidNumbers)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Prep time must be a non-negative number')
      expect(result.errors).toContain('Cook time must be a non-negative number')
      expect(result.errors).toContain('Servings must be a positive number')
    })
  })

  describe('Error Handling Utilities', () => {
    const safeAsyncOperation = async (operation: () => Promise<any>) => {
      try {
        const result = await operation()
        return { success: true, data: result, error: null }
      } catch (error: any) {
        return { 
          success: false, 
          data: null, 
          error: error.message || 'Unknown error occurred' 
        }
      }
    }

    const retryOperation = async (
      operation: () => Promise<any>, 
      maxRetries: number = 3, 
      delay: number = 100
    ) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation()
        } catch (error) {
          if (attempt === maxRetries) {
            throw error
          }
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }

    it('should handle successful operations', async () => {
      const successfulOperation = async () => ({ id: 1, name: 'Success' })
      
      const result = await safeAsyncOperation(successfulOperation)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1, name: 'Success' })
      expect(result.error).toBeNull()
    })

    it('should handle failed operations', async () => {
      const failingOperation = async () => {
        throw new Error('Operation failed')
      }
      
      const result = await safeAsyncOperation(failingOperation)
      
      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBe('Operation failed')
    })

    it('should retry operations and eventually succeed', async () => {
      let attempts = 0
      const flakyOperation = async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Temporary failure')
        }
        return 'Success on attempt 3'
      }

      const result = await retryOperation(flakyOperation, 3, 1)
      
      expect(result).toBe('Success on attempt 3')
      expect(attempts).toBe(3)
    })

    it('should fail after max retries', async () => {
      const alwaysFailingOperation = async () => {
        throw new Error('Always fails')
      }

      await expect(retryOperation(alwaysFailingOperation, 2, 1))
        .rejects.toThrow('Always fails')
    })
  })

  describe('Performance Testing Utilities', () => {
    const measurePerformance = async (operation: () => Promise<any> | any) => {
      const start = performance.now()
      await operation()
      const end = performance.now()
      return end - start
    }

    const benchmarkOperations = async (operations: Array<{
      name: string,
      operation: () => Promise<any> | any
    }>) => {
      const results = []
      
      for (const { name, operation } of operations) {
        const duration = await measurePerformance(operation)
        results.push({ name, duration })
      }
      
      return results
    }

    it('should measure operation performance', async () => {
      const quickOperation = () => {
        return Array.from({ length: 100 }, (_, i) => i * 2)
      }

      const duration = await measurePerformance(quickOperation)
      
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThan(0)
    })

    it('should benchmark multiple operations', async () => {
      const operations = [
        {
          name: 'Array map',
          operation: () => Array.from({ length: 1000 }, (_, i) => i).map(x => x * 2)
        },
        {
          name: 'Array for loop',
          operation: () => {
            const arr = Array.from({ length: 1000 }, (_, i) => i)
            const result = []
            for (let i = 0; i < arr.length; i++) {
              result.push(arr[i] * 2)
            }
            return result
          }
        }
      ]

      const results = await benchmarkOperations(operations)
      
      expect(results).toHaveLength(2)
      expect(results[0].name).toBe('Array map')
      expect(results[1].name).toBe('Array for loop')
      expect(typeof results[0].duration).toBe('number')
      expect(typeof results[1].duration).toBe('number')
    })
  })

  describe('Complex Data Scenarios', () => {
    it('should handle deeply nested recipe data', () => {
      const complexRecipe = {
        id: 1,
        name: 'Complex Recipe',
        metadata: {
          difficulty: 'hard',
          cuisine: 'italian',
          dietary: ['vegetarian', 'gluten-free'],
          nutrition: {
            calories: 450,
            protein: 12,
            carbs: 60,
            fat: 18
          }
        },
        ingredients: [
          {
            name: 'Flour',
            amount: 2,
            unit: { id: 1, name: 'cups', abbreviation: 'c' },
            preparations: ['sifted', 'room temperature'],
            alternatives: ['almond flour', 'coconut flour']
          }
        ],
        steps: [
          {
            order: 1,
            instruction: 'Prepare ingredients',
            duration: 5,
            temperature: null,
            equipment: ['bowl', 'whisk']
          },
          {
            order: 2,
            instruction: 'Mix dry ingredients',
            duration: 3,
            temperature: null,
            equipment: ['bowl']
          }
        ]
      }

      // Test deep property access
      expect(complexRecipe.metadata.nutrition.calories).toBe(450)
      expect(complexRecipe.ingredients[0].unit.name).toBe('cups')
      expect(complexRecipe.steps[0].equipment).toContain('bowl')
      expect(complexRecipe.metadata.dietary).toContain('vegetarian')
    })

    it('should transform and validate nested data structures', () => {
      const rawFormData = {
        recipeName: 'Test Recipe',
        ingredients: JSON.stringify([
          { name: 'Flour', amount: '2', unitId: '1' },
          { name: 'Sugar', amount: '1.5', unitId: '2' }
        ]),
        tags: '1,2,3',
        metadata: JSON.stringify({
          difficulty: 'easy',
          prepTime: '15'
        })
      }

      const transformFormData = (data: any) => ({
        name: data.recipeName,
        ingredients: JSON.parse(data.ingredients).map((ing: any) => ({
          name: ing.name,
          amount: parseFloat(ing.amount),
          unitId: parseInt(ing.unitId)
        })),
        tags: data.tags.split(',').map((tag: string) => parseInt(tag.trim())),
        metadata: JSON.parse(data.metadata)
      })

      const transformed = transformFormData(rawFormData)

      expect(transformed.name).toBe('Test Recipe')
      expect(transformed.ingredients).toHaveLength(2)
      expect(transformed.ingredients[0].amount).toBe(2)
      expect(transformed.tags).toEqual([1, 2, 3])
      expect(transformed.metadata.difficulty).toBe('easy')
    })
  })
})
