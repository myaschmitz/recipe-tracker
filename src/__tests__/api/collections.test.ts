// Mock Next.js Response first
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

// Mock supabase with relative import for the test
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
      insert: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })),
    })),
  },
}))

import { GET, POST } from '../../app/api/collections/route'
import { supabase } from '../../lib/supabaseClient'
import { NextResponse } from 'next/server'

const mockJson = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>

describe('/api/collections', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return collections successfully', async () => {
      const mockData = [
        { id: 1, name: 'Desserts', description: 'Sweet treats' },
        { id: 2, name: 'Main Dishes', description: 'Hearty meals' },
      ]

      const mockSelect = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      await GET()

      expect(supabase.from).toHaveBeenCalledWith('collection')
      expect(mockSelect).toHaveBeenCalledWith('*')
    })

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' }

      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      await GET()

      expect(supabase.from).toHaveBeenCalledWith('collection')
    })
  })

  describe('POST', () => {
    it('should create a collection successfully', async () => {
      const mockData = [
        { id: 1, name: 'New Collection', description: 'Test description' },
      ]

      const mockSelect = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      })

      const mockInsert = jest.fn().mockReturnValue({
        select: mockSelect,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const request = new Request('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Collection',
          description: 'Test description',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      expect(supabase.from).toHaveBeenCalledWith('collection')
      expect(mockInsert).toHaveBeenCalledWith([
        { name: 'New Collection', description: 'Test description' },
      ])
    })

    it('should handle validation errors', async () => {
      const request = new Request('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({}), // Missing required name
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      // Should call NextResponse.json with validation error
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
        }),
        { status: 400 }
      )
    })

    it('should handle database insertion errors', async () => {
      const mockError = { message: 'Database insertion error' }

      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      const mockInsert = jest.fn().mockReturnValue({
        select: mockSelect,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      const request = new Request('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Collection',
          description: 'Test description',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      expect(supabase.from).toHaveBeenCalledWith('collection')
    })
  })
})
