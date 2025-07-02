import { 
  handleApiError, 
  createSuccessResponse, 
  validateRequired,
  DEFAULT_RECIPE_LIMIT 
} from '../../lib/api'
import { NextResponse } from 'next/server'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createSuccessResponse', () => {
    it('should create a success response with default status 200', () => {
      const data = { id: 1, name: 'Test' }
      const mockJson = jest.fn()
      ;(NextResponse.json as jest.Mock).mockReturnValue(mockJson)

      createSuccessResponse(data)

      expect(NextResponse.json).toHaveBeenCalledWith(data, { status: 200 })
    })

    it('should create a success response with custom status', () => {
      const data = { id: 1, name: 'Test' }
      const mockJson = jest.fn()
      ;(NextResponse.json as jest.Mock).mockReturnValue(mockJson)

      createSuccessResponse(data, 201)

      expect(NextResponse.json).toHaveBeenCalledWith(data, { status: 201 })
    })
  })

  describe('handleApiError', () => {
    it('should handle generic error', () => {
      const error = new Error('Something went wrong')
      const operation = 'testing'
      const mockJson = jest.fn()
      ;(NextResponse.json as jest.Mock).mockReturnValue(mockJson)

      handleApiError(error, operation)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Something went wrong' },
        { status: 500 }
      )
    })

    it('should handle error with custom message', () => {
      const error = { message: 'Custom error message' }
      const operation = 'testing'
      const mockJson = jest.fn()
      ;(NextResponse.json as jest.Mock).mockReturnValue(mockJson)

      handleApiError(error, operation)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Custom error message' },
        { status: 500 }
      )
    })

    it('should handle error without message', () => {
      const error = {}
      const operation = 'testing'
      const mockJson = jest.fn()
      ;(NextResponse.json as jest.Mock).mockReturnValue(mockJson)

      handleApiError(error, operation)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: undefined },
        { status: 500 }
      )
    })
  })

  describe('validateRequired', () => {
    it('should not throw for valid data', () => {
      const data = { name: 'Test', id: 1 }
      
      expect(() => validateRequired(data)).not.toThrow()
    })

    it('should throw for missing required field', () => {
      const data = { name: 'Test', id: null }
      
      expect(() => validateRequired(data)).toThrow('Missing required fields: id')
    })

    it('should throw for undefined required field', () => {
      const data = { name: 'Test', id: undefined }
      
      expect(() => validateRequired(data)).toThrow('Missing required fields: id')
    })

    it('should throw for empty string required field', () => {
      const data = { name: '', id: 1 }
      
      expect(() => validateRequired(data)).toThrow('Missing required fields: name')
    })

    it('should throw for multiple missing fields', () => {
      const data = { name: '', id: null }
      
      expect(() => validateRequired(data)).toThrow('Missing required fields: name, id')
    })
  })

  describe('DEFAULT_RECIPE_LIMIT', () => {
    it('should have a reasonable default limit', () => {
      expect(DEFAULT_RECIPE_LIMIT).toBeDefined()
      expect(typeof DEFAULT_RECIPE_LIMIT).toBe('number')
      expect(DEFAULT_RECIPE_LIMIT).toBeGreaterThan(0)
    })
  })
})
