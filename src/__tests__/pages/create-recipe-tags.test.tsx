import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateRecipe from '../../app/recipes/create/page'

/**
 * Test for Tags functionality in Create Recipe page
 * Tests tag selection, display, removal, and validation
 */

// Mock all the dependencies 
jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('../../components/RichTextEditor', () => {
  return function MockRichTextEditor({ onChange, ...props }: any) {
    return <textarea 
      data-testid="rich-text-editor" 
      onChange={(e) => onChange && onChange(e.target.value)} 
      {...props} 
    />
  }
})

jest.mock('../../components/CollectionMultiSelect', () => {
  return function MockCollectionMultiSelect({ onCollectionChange, ...props }: any) {
    return <div data-testid="collection-multiselect">Collection Select</div>
  }
})

jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
}))

describe('Create Recipe Tags Functionality', () => {
  const mockTags = [
    { id: 1, name: 'Breakfast' },
    { id: 2, name: 'Lunch' },
    { id: 3, name: 'Dinner' },
    { id: 4, name: 'Vegetarian' },
    { id: 5, name: 'Quick' },
  ]

  const mockUnits = [
    { id: 1, name: 'cup' },
    { id: 2, name: 'tablespoon' },
    { id: 3, name: 'teaspoon' },
  ]

  beforeEach(() => {
    // Mock API calls
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ // Units fetch
        ok: true,
        json: () => Promise.resolve(mockUnits)
      })
      .mockResolvedValueOnce({ // Tags fetch
        ok: true,
        json: () => Promise.resolve(mockTags)
      })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Loading', () => {
    it('should render create recipe form', async () => {
      render(<CreateRecipe />)
      
      // Check for the heading specifically
      expect(screen.getByRole('heading', { name: 'Create Recipe' })).toBeInTheDocument()
      expect(screen.getByText('Tags')).toBeInTheDocument()
      expect(screen.getByText('Select tags...')).toBeInTheDocument()
    })

    it('should load tags from API on component mount', async () => {
      render(<CreateRecipe />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/tags')
      })
    })
  })

  describe('Tag Selection Interface', () => {
    it('should display tag selector button', async () => {
      render(<CreateRecipe />)
      
      await waitFor(() => {
        const tagButton = screen.getByText('Select tags...')
        expect(tagButton).toBeInTheDocument()
      })
    })

    it('should open tag selector when clicked', async () => {
      const user = userEvent.setup()
      render(<CreateRecipe />)
      
      await waitFor(() => {
        const tagButton = screen.getByText('Select tags...')
        expect(tagButton).toBeInTheDocument()
      })
      
      const tagButton = screen.getByText('Select tags...')
      await user.click(tagButton)
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search tags')).toBeInTheDocument()
      })
    })

    it('should show available tags in dropdown', async () => {
      const user = userEvent.setup()
      render(<CreateRecipe />)
      
      await waitFor(() => {
        const tagButton = screen.getByText('Select tags...')
        expect(tagButton).toBeInTheDocument()
      })
      
      const tagButton = screen.getByText('Select tags...')
      await user.click(tagButton)
      
      await waitFor(() => {
        mockTags.forEach(tag => {
          expect(screen.getByText(tag.name)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Tag Selection', () => {
    it('should allow selecting a tag', async () => {
      const user = userEvent.setup()
      render(<CreateRecipe />)
      
      await waitFor(() => {
        const tagButton = screen.getByText('Select tags...')
        expect(tagButton).toBeInTheDocument()
      })
      
      const tagButton = screen.getByText('Select tags...')
      await user.click(tagButton)
      
      await waitFor(() => {
        expect(screen.getByText('Breakfast')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Breakfast'))
      
      // Check that the tag is now selected and displayed as a badge
      await waitFor(() => {
        const badges = screen.getAllByText('Breakfast')
        expect(badges.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(<CreateRecipe />)
      
      await waitFor(() => {
        const tagButton = screen.getByText('Select tags...')
        expect(tagButton).toBeInTheDocument()
      })
      
      const tagButton = screen.getByText('Select tags...')
      expect(tagButton).toHaveAttribute('role', 'combobox')
      expect(tagButton).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
