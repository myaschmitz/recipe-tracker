import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecipeCard from '../../components/RecipeCard'

// Mock all @/ imports that the component uses
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span className="badge">{children}</span>,
}))

// Mock the card components
jest.mock('../../components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}))

// Mock the badge component
jest.mock('../../components/ui/badge', () => ({
  Badge: ({ children }: any) => <span className="badge">{children}</span>,
}))

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockRecipe = {
  id: 1,
  name: 'Chocolate Cake',
  description: 'A delicious chocolate cake recipe',
  instructions: '<p>Mix ingredients and bake</p>',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ingredients: [],
  tags: [
    { id: 1, name: 'dessert' },
    { id: 2, name: 'chocolate' }
  ],
}

describe('RecipeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render recipe card with name', () => {
    render(<RecipeCard recipe={mockRecipe} />)

    expect(screen.getByText('Chocolate Cake')).toBeTruthy()
  })

  it('should render recipe tags', () => {
    render(<RecipeCard recipe={mockRecipe} />)

    expect(screen.getByText('dessert')).toBeTruthy()
    expect(screen.getByText('chocolate')).toBeTruthy()
  })

  it('should have correct link href', () => {
    render(<RecipeCard recipe={mockRecipe} />)

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/recipes/1')
  })

  it('should handle recipe without tags', () => {
    const recipeWithoutTags = {
      ...mockRecipe,
      tags: [],
    }

    render(<RecipeCard recipe={recipeWithoutTags} />)

    expect(screen.getByText('Chocolate Cake')).toBeTruthy()
    // Should not crash and should still render the recipe name
  })

  it('should handle long recipe names gracefully', () => {
    const recipeWithLongName = {
      ...mockRecipe,
      name: 'This is a very long recipe name that might overflow the card layout and cause display issues',
    }

    render(<RecipeCard recipe={recipeWithLongName} />)

    expect(screen.getByText(recipeWithLongName.name)).toBeTruthy()
  })

  it('should render multiple tags correctly', () => {
    const recipeWithManyTags = {
      ...mockRecipe,
      tags: [
        { id: 1, name: 'dessert' },
        { id: 2, name: 'chocolate' },
        { id: 3, name: 'cake' },
        { id: 4, name: 'sweet' }
      ],
    }

    render(<RecipeCard recipe={recipeWithManyTags} />)

    expect(screen.getByText('dessert')).toBeTruthy()
    expect(screen.getByText('chocolate')).toBeTruthy()
    expect(screen.getByText('cake')).toBeTruthy()
    expect(screen.getByText('sweet')).toBeTruthy()
  })
})
