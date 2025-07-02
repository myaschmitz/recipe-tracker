import { GET, POST } from '../../app/api/recipes/route'
import { supabase } from '../../lib/supabaseClient'

// Mock supabase with relative import for the test
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock Next.js Response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

// Import the mocked NextResponse  
import { NextResponse } from 'next/server'
const mockJson = (NextResponse.json as jest.Mock)

describe('/api/recipes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return recipes successfully', async () => {
      const mockData = [
        { id: 1, name: 'Chocolate Cake', description: 'Delicious cake' },
        { id: 2, name: 'Pasta', description: 'Italian pasta' },
      ]

      const mockLimit = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      })

      const mockOrder = jest.fn().mockReturnValue({
        limit: mockLimit,
      })

      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const request = new Request('http://localhost:3000/api/recipes')
      await GET(request)

      expect(supabase.from).toHaveBeenCalledWith('recipe')
      expect(mockSelect).toHaveBeenCalledWith('id, name, description')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should handle limit parameter', async () => {
      const mockLimit = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      const mockOrder = jest.fn().mockReturnValue({
        limit: mockLimit,
      })

      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      const request = new Request('http://localhost:3000/api/recipes?limit=5')
      await GET(request)

      expect(mockLimit).toHaveBeenCalledWith(5)
    })
  })

  describe('POST', () => {
    it('should create a recipe with all fields successfully', async () => {
      const mockRecipeData = {
        id: 1,
        name: 'Test Recipe',
        description: 'Test description',
        instructions: 'Test instructions',
      }

      // Mock recipe creation
      const mockRecipeSelect = jest.fn().mockResolvedValue({
        data: mockRecipeData,
        error: null,
      })

      const mockRecipeInsert = jest.fn().mockReturnValue({
        select: mockRecipeSelect,
      })

      // Mock ingredient insertion
      const mockIngredientInsert = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      // Mock tag insertion
      const mockTagInsert = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      // Mock collection insertion
      const mockCollectionInsert = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'recipe') {
          return { insert: mockRecipeInsert }
        } else if (table === 'recipe_ingredient') {
          return { insert: mockIngredientInsert }
        } else if (table === 'recipe_tag') {
          return { insert: mockTagInsert }
        } else if (table === 'collection_recipe') {
          return { insert: mockCollectionInsert }
        }
      })

      const requestBody = {
        name: 'Test Recipe',
        description: 'Test description',
        instructions: 'Test instructions',
        ingredients: [
          { name: 'Sugar', amount: 2, unitId: 1, note: 'white sugar' },
        ],
        tags: [1, 2],
        collections: [1],
      }

      const request = new Request('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      expect(supabase.from).toHaveBeenCalledWith('recipe')
      expect(mockRecipeInsert).toHaveBeenCalledWith({
        name: 'Test Recipe',
        description: 'Test description',
        instructions: 'Test instructions',
      })
    })

    it('should handle validation errors', async () => {
      const request = new Request('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify({}), // Missing required fields
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
        }),
        { status: 400 }
      )
    })

    it('should handle recipe creation without optional ingredients', async () => {
      const mockRecipeData = {
        id: 1,
        name: 'Simple Recipe',
        description: '',
        instructions: 'Simple instructions',
      }

      const mockRecipeSelect = jest.fn().mockResolvedValue({
        data: mockRecipeData,
        error: null,
      })

      const mockRecipeInsert = jest.fn().mockReturnValue({
        select: mockRecipeSelect,
      })

      ;(supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'recipe') {
          return { insert: mockRecipeInsert }
        }
      })

      const requestBody = {
        name: 'Simple Recipe',
        instructions: 'Simple instructions',
        ingredients: [
          { name: 'Salt', amount: 1, unitId: 1 },
        ],
      }

      const request = new Request('http://localhost:3000/api/recipes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      expect(supabase.from).toHaveBeenCalledWith('recipe')
    })
  })
})
