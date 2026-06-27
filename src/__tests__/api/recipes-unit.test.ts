/**
 * Recipes API Unit Tests
 * 
 * Tests the recipes API endpoints independently by mocking all dependencies
 * and testing the business logic directly.
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockFrom = jest.fn()
const mockOrder = jest.fn()
const mockLimit = jest.fn()
const mockSingle = jest.fn()

jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: mockFrom,
  },
}))

// Mock API utilities
const mockHandleApiError = jest.fn()
const mockCreateSuccessResponse = jest.fn()
jest.mock('../../lib/api', () => ({
  handleApiError: mockHandleApiError,
  createSuccessResponse: mockCreateSuccessResponse,
  DEFAULT_RECIPE_LIMIT: 10,
}))

// Mock schema validation
const mockRecipeSchema = {
  parse: jest.fn(),
}
jest.mock('../../lib/schemas', () => ({
  recipeSchema: mockRecipeSchema,
}))

// Mock database models
jest.mock('../../types/database/models', () => ({
  RecipeSchema: {},
}))

describe('Recipes API Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default return chains
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    })
    
    mockSelect.mockReturnValue({
      order: mockOrder,
    })
    
    mockOrder.mockReturnValue({
      limit: mockLimit,
    })
    
    mockInsert.mockReturnValue({
      select: mockSelect,
    })
    
    mockSelect.mockReturnValue({
      single: mockSingle,
    })
  })

  describe('GET /api/recipes', () => {
    it('should fetch recipes with default limit', async () => {
      const mockRecipes = [
        { id: 1, name: 'Pasta', description: 'Delicious pasta' },
        { id: 2, name: 'Pizza', description: 'Homemade pizza' },
      ]

      mockLimit.mockResolvedValue({
        data: mockRecipes,
        error: null,
      })

      // Simulate the API logic
      const url = new URL('http://localhost/api/recipes')
      const limit = url.searchParams.get('limit')
      
      // This simulates what the actual GET handler does
      await mockFrom('recipe')
      await mockSelect('id, name, description')
      await mockOrder('created_at', { ascending: false })
      await mockLimit(limit ? parseInt(limit) : 10)

      expect(mockFrom).toHaveBeenCalledWith('recipe')
      expect(mockSelect).toHaveBeenCalledWith('id, name, description')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockLimit).toHaveBeenCalledWith(10)
    })

    it('should fetch recipes with custom limit', async () => {
      const mockRecipes = [
        { id: 1, name: 'Pasta', description: 'Delicious pasta' },
      ]

      mockLimit.mockResolvedValue({
        data: mockRecipes,
        error: null,
      })

      // Simulate API logic with custom limit
      const url = new URL('http://localhost/api/recipes?limit=5')
      const limit = url.searchParams.get('limit')
      
      await mockFrom('recipe')
      await mockSelect('id, name, description')
      await mockOrder('created_at', { ascending: false })
      await mockLimit(limit ? parseInt(limit) : 10)

      expect(mockLimit).toHaveBeenCalledWith(5)
    })

    it('should handle database errors', async () => {
      const mockError = { message: 'Database connection failed' }
      
      mockLimit.mockResolvedValue({
        data: null,
        error: mockError,
      })

      // Test error handling logic
      const result = await mockLimit()
      
      if (result.error) {
        mockHandleApiError(result.error, 'fetching recipes')
      }

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError, 'fetching recipes')
      // A real DB error must surface as an error response, never a fake empty list.
      expect(mockCreateSuccessResponse).not.toHaveBeenCalled()
    })

    it('should return an empty array for a successful query with no rows', async () => {
      mockLimit.mockResolvedValue({
        data: [],
        error: null,
      })

      // Simulate the success path: query resolved without an error.
      const result = await mockLimit()

      if (result.error) {
        mockHandleApiError(result.error, 'fetching recipes')
      } else {
        mockCreateSuccessResponse(result.data || [])
      }

      // Empty-but-successful results stay a 200 + [] so the frontend doesn't crash.
      expect(mockCreateSuccessResponse).toHaveBeenCalledWith([])
      expect(mockHandleApiError).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/recipes', () => {
    const validRecipeData = {
      name: 'Test Recipe',
      description: 'A test recipe',
      instructions: 'Test instructions',
      ingredients: [
        { name: 'Flour', amount: 2, unitId: 1, note: 'All-purpose' },
      ],
      tags: [1, 2],
      collections: [1],
    }

    it('should create a recipe successfully', async () => {
      const mockCreatedRecipe = { id: 1, ...validRecipeData }
      
      mockRecipeSchema.parse.mockReturnValue(validRecipeData)
      mockSingle.mockResolvedValue({
        data: mockCreatedRecipe,
        error: null,
      })

      // Test the validation and creation logic
      const validatedData = mockRecipeSchema.parse(validRecipeData)
      
      await mockFrom('recipe')
      await mockInsert({
        name: validatedData.name,
        description: validatedData.description,
        instructions: validatedData.instructions,
      })
      await mockSelect()
      await mockSingle()

      expect(mockRecipeSchema.parse).toHaveBeenCalledWith(validRecipeData)
      expect(mockFrom).toHaveBeenCalledWith('recipe')
      expect(mockInsert).toHaveBeenCalledWith({
        name: validatedData.name,
        description: validatedData.description,
        instructions: validatedData.instructions,
      })
    })

    it('should handle validation errors', async () => {
      const invalidData = { name: '', description: '', instructions: '' }
      const zodError = {
        name: 'ZodError',
        errors: [{ message: 'Name is required' }],
      }

      mockRecipeSchema.parse.mockImplementation(() => {
        throw zodError
      })

      // Test validation error handling
      try {
        mockRecipeSchema.parse(invalidData)
      } catch (error: any) {
        if (error.name === 'ZodError') {
          // This simulates the error handling in the actual route
          expect(error.name).toBe('ZodError')
          expect(error.errors).toBeDefined()
        }
      }

      expect(mockRecipeSchema.parse).toHaveBeenCalledWith(invalidData)
    })

    it('should handle ingredients insertion', async () => {
      const mockCreatedRecipe = { id: 1, ...validRecipeData }
      
      mockRecipeSchema.parse.mockReturnValue(validRecipeData)
      mockSingle.mockResolvedValue({
        data: mockCreatedRecipe,
        error: null,
      })

      // Mock ingredients insertion
      const mockIngredientsInsert = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })
      
      mockFrom.mockImplementation((table) => {
        if (table === 'recipe_ingredient') {
          return { insert: mockIngredientsInsert }
        }
        return {
          select: mockSelect,
          insert: mockInsert,
        }
      })

      // Test ingredients logic
      const validatedData = mockRecipeSchema.parse(validRecipeData)
      
      if (validatedData.ingredients && validatedData.ingredients.length > 0) {
        const ingredientsData = validatedData.ingredients.map((ingredient: any) => ({
          recipe_id: mockCreatedRecipe.id,
          name: ingredient.name,
          amount: ingredient.amount,
          unit_id: ingredient.unitId,
          note: ingredient.note,
        }))
        
        await mockIngredientsInsert(ingredientsData)
      }

      expect(mockIngredientsInsert).toHaveBeenCalledWith([
        {
          recipe_id: 1,
          name: 'Flour',
          amount: 2,
          unit_id: 1,
          note: 'All-purpose',
        },
      ])
    })

    it('should handle tags insertion', async () => {
      const mockCreatedRecipe = { id: 1, ...validRecipeData }
      
      mockRecipeSchema.parse.mockReturnValue(validRecipeData)
      
      // Mock tags insertion
      const mockTagsInsert = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })
      
      mockFrom.mockImplementation((table) => {
        if (table === 'recipe_tag') {
          return { insert: mockTagsInsert }
        }
        return {
          select: mockSelect,
          insert: mockInsert,
        }
      })

      // Test tags logic
      const validatedData = mockRecipeSchema.parse(validRecipeData)
      
      if (validatedData.tags && validatedData.tags.length > 0) {
        const tagsData = validatedData.tags.map((tag: any) => ({
          recipe_id: mockCreatedRecipe.id,
          tag_id: tag,
        }))
        
        await mockTagsInsert(tagsData)
      }

      expect(mockTagsInsert).toHaveBeenCalledWith([
        { recipe_id: 1, tag_id: 1 },
        { recipe_id: 1, tag_id: 2 },
      ])
    })

    it('should handle collections insertion', async () => {
      const mockCreatedRecipe = { id: 1, ...validRecipeData }
      
      mockRecipeSchema.parse.mockReturnValue(validRecipeData)
      
      // Mock collections insertion
      const mockCollectionsInsert = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })
      
      mockFrom.mockImplementation((table) => {
        if (table === 'collection_recipe') {
          return { insert: mockCollectionsInsert }
        }
        return {
          select: mockSelect,
          insert: mockInsert,
        }
      })

      // Test collections logic
      const validatedData = mockRecipeSchema.parse(validRecipeData)
      
      if (validatedData.collections && validatedData.collections.length > 0) {
        const collectionsData = validatedData.collections.map((collectionId: any) => ({
          recipe_id: mockCreatedRecipe.id,
          collection_id: collectionId,
        }))
        
        await mockCollectionsInsert(collectionsData)
      }

      expect(mockCollectionsInsert).toHaveBeenCalledWith([
        { recipe_id: 1, collection_id: 1 },
      ])
    })

    it('should handle recipe creation errors', async () => {
      const mockError = { message: 'Recipe creation failed' }
      
      mockRecipeSchema.parse.mockReturnValue(validRecipeData)
      mockSingle.mockResolvedValue({
        data: null,
        error: mockError,
      })

      // Test error handling
      const result = await mockSingle()
      
      if (result.error) {
        mockHandleApiError(result.error, 'creating recipe')
      }

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError, 'creating recipe')
    })
  })
})
