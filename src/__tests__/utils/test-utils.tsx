import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Mock @/ imports
jest.mock('@/types/view/models', () => ({
  Collection: {},
  Tag: {},
  Unit: {},
  Recipe: {},
  RecipeIngredient: {},
}))

import { Collection, Tag, Unit, Recipe, RecipeIngredient } from '@/types/view/models'

// Test utilities for rendering components with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data factories
export const mockUnit: Unit = {
  id: 1,
  name: 'cup',
  symbol: 'c',
}

export const mockTag: Tag = {
  id: 1,
  name: 'dessert',
}

export const mockCollection: Collection = {
  id: 1,
  name: 'My Favorites',
  description: 'Collection of favorite recipes',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  recipes: [],
}

export const mockCollections: Collection[] = [
  {
    id: 1,
    name: 'Test Collection 1',
    description: 'First test collection',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    recipes: [],
  },
  {
    id: 2,
    name: 'Test Collection 2',
    description: 'Second test collection',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    recipes: [],
  },
]

export const mockRecipeIngredient: RecipeIngredient = {
  id: 1,
  recipeId: 1,
  name: 'Sugar',
  amount: 2,
  unit: mockUnit,
  note: 'white sugar',
}

export const mockRecipe: Recipe = {
  id: 1,
  name: 'Chocolate Cake',
  description: 'A delicious chocolate cake',
  instructions: '<p>Mix ingredients and bake</p>',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ingredients: [mockRecipeIngredient],
  tags: [mockTag],
}

// API Mock helpers
export const mockFetch = (data: any, ok = true, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  })
}

export const mockFetchError = (error: string, status = 500) => {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error }),
  })
}

// Toast mock
export const mockToast = {
  toast: jest.fn(),
  dismiss: jest.fn(),
}

// User event helpers
export const createMockChangeEvent = (value: string) => ({
  target: { value },
  preventDefault: jest.fn(),
})

export const createMockClickEvent = () => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
})

// Simple test to prevent "no tests found" error
describe('Test Utils', () => {
  it('should export mock utilities', () => {
    expect(mockUnit).toBeDefined()
    expect(mockTag).toBeDefined()
    expect(mockCollection).toBeDefined()
    expect(mockRecipe).toBeDefined()
  })
})
