import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateRecipe from '../../app/recipes/create/page'

// Mock all @/ imports that the page uses (same as create-recipe.test.tsx)
jest.mock('@/types/view/models', () => ({
  RecipeIngredientForm: {},
  Tag: {},
  Unit: {},
  Collection: {},
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/command', () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandEmpty: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandInput: ({ ...props }: any) => <input {...props} />,
  CommandItem: ({ children, onSelect }: any) => (
    <div onClick={onSelect}>{children}</div>
  ),
  CommandList: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}))

jest.mock('@/components/RichTextEditor', () => {
  return function MockRichTextEditor({ onChange, ...props }: any) {
    return <textarea onChange={(e) => onChange(e.target.value)} {...props} />
  }
})

jest.mock('@/components/CollectionMultiSelect', () => {
  return function MockCollectionMultiSelect({ onSelectionChange, ...props }: any) {
    return <div data-testid="collection-multiselect">Collection Select</div>
  }
})

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectGroup: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ ...props }: any) => <textarea {...props} />,
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// Mock all external dependencies
const mockPush = jest.fn()
const mockToast = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

jest.mock('../../components/RichTextEditor', () => {
  return function MockRichTextEditor({ onChange }: { onChange: (value: string) => void }) {
    return (
      <textarea
        data-testid="rich-text-editor"
        onChange={(e) => onChange(e.target.value)}
        placeholder="Instructions"
      />
    )
  }
})

jest.mock('../../components/CollectionMultiSelect', () => {
  return function MockCollectionMultiSelect({ 
    selectedCollections,
    onCollectionChange 
  }: { 
    selectedCollections: any[]
    onCollectionChange: (collections: any[]) => void 
  }) {
    return (
      <div data-testid="collection-multi-select">
        <span data-testid="selected-count">{selectedCollections.length} selected</span>
        <button 
          onClick={() => onCollectionChange([
            ...selectedCollections, 
            { id: Date.now(), name: 'New Collection' }
          ])}
        >
          Add Collection
        </button>
      </div>
    )
  }
})

const mockApiResponses = {
  units: [
    { id: 1, name: 'cup' },
    { id: 2, name: 'tablespoon' },
    { id: 3, name: 'teaspoon' },
  ],
  tags: [
    { id: 1, name: 'dessert' },
    { id: 2, name: 'quick' },
    { id: 3, name: 'healthy' },
  ],
  collections: [
    { id: 1, name: 'Favorites', description: 'My favorite recipes' },
    { id: 2, name: 'Quick Meals', description: 'Fast and easy meals' },
  ],
}

describe('Recipe Creation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ // Units fetch
        ok: true,
        json: () => Promise.resolve(mockApiResponses.units)
      })
      .mockResolvedValueOnce({ // Tags fetch  
        ok: true,
        json: () => Promise.resolve(mockApiResponses.tags)
      })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Complete Recipe Creation Flow', () => {
    it('should successfully create a recipe with all components', async () => {
      const user = userEvent.setup()
      
      // Mock successful recipe creation
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockApiResponses.units) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockApiResponses.tags) })
        .mockResolvedValueOnce({ 
          ok: true, 
          json: () => Promise.resolve({ id: 1, name: 'Complete Test Recipe' })
        })

      render(<CreateRecipe />)

      // Wait for initial data to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/units')
        expect(global.fetch).toHaveBeenCalledWith('/api/tags')
      })

      // Fill in basic recipe information
      const nameInput = screen.getByPlaceholderText('Name')
      await user.type(nameInput, 'Complete Test Recipe')

      const descriptionInput = screen.getByPlaceholderText('Description')
      await user.type(descriptionInput, 'A comprehensive test recipe')

      const instructionsEditor = screen.getByTestId('rich-text-editor')
      await user.type(instructionsEditor, 'Detailed cooking instructions')

      // Add ingredients
      const ingredientName = screen.getByLabelText(/name/i)
      const ingredientAmount = screen.getByLabelText(/amount/i)
      const ingredientNote = screen.getByLabelText(/note/i)

      await user.type(ingredientName, 'Sugar')
      await user.type(ingredientAmount, '2')
      await user.type(ingredientNote, 'white granulated sugar')

      // Add a second ingredient
      const addIngredientButton = screen.getByText('+ Add ingredient')
      await user.click(addIngredientButton)

      const ingredientInputs = screen.getAllByLabelText(/name/i)
      const amountInputs = screen.getAllByLabelText(/amount/i)

      await user.type(ingredientInputs[1], 'Flour')
      await user.type(amountInputs[1], '3')

      // Add collections
      const addCollectionButton = screen.getByText('Add Collection')
      await user.click(addCollectionButton)

      // Verify collection was added
      expect(screen.getByTestId('selected-count').textContent).toBe('1 selected')

      // Submit the recipe
      const submitButton = screen.getByRole('button', { name: /create recipe/i })
      await user.click(submitButton)

      // Verify API call was made with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Complete Test Recipe')
        })
      })

      // Verify success toast and navigation
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Recipe added successfully'
      })
      expect(mockPush).toHaveBeenCalledWith('/recipes/1')
    })

    it('should handle errors gracefully during creation', async () => {
      const user = userEvent.setup()
      
      // Mock API error responses
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockApiResponses.units) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockApiResponses.tags) })
        .mockResolvedValueOnce({ 
          ok: false, 
          json: () => Promise.resolve({ error: 'Database connection failed' })
        })

      render(<CreateRecipe />)

      // Fill in minimal required fields
      const nameInput = screen.getByPlaceholderText('Name')
      await user.type(nameInput, 'Error Test Recipe')

      const instructionsEditor = screen.getByTestId('rich-text-editor')
      await user.type(instructionsEditor, 'Test instructions')

      const ingredientName = screen.getByLabelText(/name/i)
      const ingredientAmount = screen.getByLabelText(/amount/i)
      await user.type(ingredientName, 'Salt')
      await user.type(ingredientAmount, '1')

      const submitButton = screen.getByRole('button', { name: /create recipe/i })
      await user.click(submitButton)

      // Verify error handling
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error creating recipe',
          description: 'Database connection failed'
        })
      })

      // Should not navigate on error
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should validate complex ingredient scenarios', async () => {
      const user = userEvent.setup()
      render(<CreateRecipe />)

      // Add multiple ingredients
      const addIngredientButton = screen.getByText('+ Add ingredient')
      await user.click(addIngredientButton)
      await user.click(addIngredientButton)

      // Fill in only partial ingredient data
      const ingredientNames = screen.getAllByLabelText(/name/i)
      const ingredientAmounts = screen.getAllByLabelText(/amount/i)

      await user.type(ingredientNames[0], 'Sugar')
      await user.type(ingredientAmounts[0], '2')
      // Leave second ingredient incomplete
      await user.type(ingredientNames[1], 'Flour')
      // Don't fill amount for second ingredient

      const nameInput = screen.getByPlaceholderText('Name')
      await user.type(nameInput, 'Validation Test Recipe')

      const instructionsEditor = screen.getByTestId('rich-text-editor')
      await user.type(instructionsEditor, 'Test instructions')

      const submitButton = screen.getByRole('button', { name: /create recipe/i })
      await user.click(submitButton)

      // Should show validation error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Please fill in all required ingredient fields with valid values',
          duration: 3000
        })
      })
    })

    it('should handle ingredient removal correctly', async () => {
      const user = userEvent.setup()
      render(<CreateRecipe />)

      // Add multiple ingredients
      const addIngredientButton = screen.getByText('+ Add ingredient')
      await user.click(addIngredientButton)
      await user.click(addIngredientButton)

      // Should have 3 ingredient rows (1 initial + 2 added)
      let removeButtons = screen.getAllByRole('button', { name: /x/i })
      expect(removeButtons).toHaveLength(3)

      // Remove the middle ingredient
      await user.click(removeButtons[1])

      // Should have 2 ingredient rows now
      removeButtons = screen.getAllByRole('button', { name: /x/i })
      expect(removeButtons).toHaveLength(2)

      // Fill in remaining ingredients
      const ingredientNames = screen.getAllByLabelText(/name/i)
      const ingredientAmounts = screen.getAllByLabelText(/amount/i)

      await user.type(ingredientNames[0], 'Sugar')
      await user.type(ingredientAmounts[0], '2')
      await user.type(ingredientNames[1], 'Flour')
      await user.type(ingredientAmounts[1], '3')

      // The form should be valid now
      expect(ingredientNames).toHaveLength(2)
      expect(ingredientAmounts).toHaveLength(2)
    })
  })

  describe('Data Fetching Integration', () => {
    it('should handle API fetch failures gracefully', async () => {
      // Mock failed API calls
      global.fetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))

      render(<CreateRecipe />)

      // Should still render the form even if API calls fail
      expect(screen.getByText('Create Recipe')).toBeTruthy()
      expect(screen.getByPlaceholderText('Name')).toBeTruthy()
    })

    it('should handle partial API failures', async () => {
      // Mock mixed success/failure API calls
      global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockApiResponses.units) })
        .mockRejectedValueOnce(new Error('Tags fetch failed'))

      render(<CreateRecipe />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/units')
        expect(global.fetch).toHaveBeenCalledWith('/api/tags')
      })

      // Form should still be functional
      expect(screen.getByText('Create Recipe')).toBeTruthy()
    })
  })

  describe('Collection Integration', () => {
    it('should handle multiple collection selections', async () => {
      const user = userEvent.setup()
      render(<CreateRecipe />)

      const addCollectionButton = screen.getByText('Add Collection')
      
      // Add multiple collections
      await user.click(addCollectionButton)
      await user.click(addCollectionButton)
      await user.click(addCollectionButton)

      // Verify all collections were added
      expect(screen.getByTestId('selected-count').textContent).toBe('3 selected')
    })

    it('should maintain collection state during form interaction', async () => {
      const user = userEvent.setup()
      render(<CreateRecipe />)

      // Add collection first
      const addCollectionButton = screen.getByText('Add Collection')
      await user.click(addCollectionButton)

      // Then interact with other form elements
      const nameInput = screen.getByPlaceholderText('Name')
      await user.type(nameInput, 'Test Recipe')

      const addIngredientButton = screen.getByText('+ Add ingredient')
      await user.click(addIngredientButton)

      // Collection should still be selected
      expect(screen.getByTestId('selected-count').textContent).toBe('1 selected')
    })
  })
})
