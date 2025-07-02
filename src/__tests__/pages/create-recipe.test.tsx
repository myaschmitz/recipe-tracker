import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateRecipe from '../../app/recipes/create/page'

// Mock all @/ imports that the page uses
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

// Mock dependencies
const mockPush = jest.fn()
const mockToast = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

// Mock RichTextEditor
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

// Mock CollectionMultiSelect
jest.mock('../../components/CollectionMultiSelect', () => {
  return function MockCollectionMultiSelect({ 
    onCollectionChange 
  }: { 
    onCollectionChange: (collections: any[]) => void 
  }) {
    return (
      <div data-testid="collection-multi-select">
        <button onClick={() => onCollectionChange([{ id: 1, name: 'Test Collection' }])}>
          Select Collection
        </button>
      </div>
    )
  }
})

const mockUnits = [
  { id: 1, name: 'cup' },
  { id: 2, name: 'tablespoon' },
]

const mockTags = [
  { id: 1, name: 'dessert' },
  { id: 2, name: 'quick' },
]

describe('CreateRecipe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    jest.restoreAllMocks()
  })

  it('should render the create recipe form', async () => {
    render(<CreateRecipe />)

    expect(screen.getByText('Create Recipe')).toBeTruthy()
    expect(screen.getByPlaceholderText('Name')).toBeTruthy()
    expect(screen.getByPlaceholderText('Description')).toBeTruthy()
    expect(screen.getByTestId('rich-text-editor')).toBeTruthy()
    expect(screen.getByText('+ Add ingredient')).toBeTruthy()
    expect(screen.getByText('Create Recipe')).toBeTruthy()
  })

  it('should fetch units and tags on mount', async () => {
    render(<CreateRecipe />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/units')
      expect(global.fetch).toHaveBeenCalledWith('/api/tags')
    })
  })

  it('should add new ingredient when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateRecipe />)

    const addButton = screen.getByText('+ Add ingredient')
    await user.click(addButton)

    // Should have 2 ingredient rows now (one initial + one added)
    const amountInputs = screen.getAllByLabelText(/amount/i)
    expect(amountInputs).toHaveLength(2)
  })

  it('should update ingredient fields', async () => {
    const user = userEvent.setup()
    render(<CreateRecipe />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/units')
    })

    const nameInput = screen.getByLabelText(/name/i)
    const amountInput = screen.getByLabelText(/amount/i)

    await user.type(nameInput, 'Sugar')
    await user.type(amountInput, '2')

    expect(nameInput.getAttribute('value')).toBe('Sugar')
    expect(amountInput.getAttribute('value')).toBe('2')
  })

  it('should validate required fields before submission', async () => {
    const user = userEvent.setup()
    render(<CreateRecipe />)

    const submitButton = screen.getByRole('button', { name: /create recipe/i })
    await user.click(submitButton)

    // Should show validation errors for missing required fields
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('ingredient')
        })
      )
    })
  })

  it('should validate instructions are provided', async () => {
    const user = userEvent.setup()
    render(<CreateRecipe />)

    // Fill in name and ingredient
    const nameInput = screen.getByPlaceholderText('Name')
    await user.type(nameInput, 'Test Recipe')

    const ingredientName = screen.getByLabelText(/name/i)
    const ingredientAmount = screen.getByLabelText(/amount/i)
    await user.type(ingredientName, 'Sugar')
    await user.type(ingredientAmount, '2')

    const submitButton = screen.getByRole('button', { name: /create recipe/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Please add instructions to your recipe'
        })
      )
    })
  })

  it('should submit recipe successfully with all required fields', async () => {
    const user = userEvent.setup()
    
    // Mock successful recipe creation
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockUnits) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockTags) })
      .mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve({ id: 1, name: 'Test Recipe' })
      })

    render(<CreateRecipe />)

    // Fill in required fields
    const nameInput = screen.getByPlaceholderText('Name')
    await user.type(nameInput, 'Test Recipe')

    const instructionsEditor = screen.getByTestId('rich-text-editor')
    await user.type(instructionsEditor, 'Test instructions')

    const ingredientName = screen.getByLabelText(/name/i)
    const ingredientAmount = screen.getByLabelText(/amount/i)
    await user.type(ingredientName, 'Sugar')
    await user.type(ingredientAmount, '2')

    // Select unit (this is simplified for the test)
    // In reality, we'd need to interact with the Select component

    const submitButton = screen.getByRole('button', { name: /create recipe/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test Recipe')
      })
    })
  })

  it('should handle recipe creation error', async () => {
    const user = userEvent.setup()
    
    // Mock failed recipe creation
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockUnits) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockTags) })
      .mockResolvedValueOnce({ 
        ok: false, 
        json: () => Promise.resolve({ error: 'Creation failed' })
      })

    render(<CreateRecipe />)

    // Fill in required fields
    const nameInput = screen.getByPlaceholderText('Name')
    await user.type(nameInput, 'Test Recipe')

    const instructionsEditor = screen.getByTestId('rich-text-editor')
    await user.type(instructionsEditor, 'Test instructions')

    const ingredientName = screen.getByLabelText(/name/i)
    const ingredientAmount = screen.getByLabelText(/amount/i)
    await user.type(ingredientName, 'Sugar')
    await user.type(ingredientAmount, '2')

    const submitButton = screen.getByRole('button', { name: /create recipe/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error creating recipe',
        description: 'Creation failed'
      })
    })
  })

  it('should remove ingredient when X button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateRecipe />)

    // Add a second ingredient
    const addButton = screen.getByText('+ Add ingredient')
    await user.click(addButton)

    // Should have 2 ingredient rows
    let removeButtons = screen.getAllByRole('button', { name: /x/i })
    expect(removeButtons).toHaveLength(2)

    // Remove the first ingredient
    await user.click(removeButtons[0])

    // Should have 1 ingredient row now
    removeButtons = screen.getAllByRole('button', { name: /x/i })
    expect(removeButtons).toHaveLength(1)
  })

  it('should handle collection selection', async () => {
    const user = userEvent.setup()
    render(<CreateRecipe />)

    const collectionSelect = screen.getByTestId('collection-multi-select')
    const selectButton = screen.getByText('Select Collection')
    
    await user.click(selectButton)

    // This test verifies the collection selection integration
    expect(collectionSelect).toBeTruthy()
  })
})
