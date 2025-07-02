import '@testing-library/jest-dom'

// Mock Supabase client (used by some tests that need it)
jest.mock('./src/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}))

// Mock Next.js Response for API tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockReturnValue({ json: 'mocked response' }),
  },
}))

// Mock view model types
jest.mock('./src/types/view/models', () => ({
  RecipeIngredientForm: {},
  Tag: {},
  Unit: {},
  Collection: {},
  Recipe: {},
  RecipeIngredient: {},
}))

// Mock all UI components using relative paths
jest.mock('./src/components/ui/input', () => ({
  Input: (props) => React.createElement('input', props),
}))

jest.mock('./src/components/ui/label', () => ({
  Label: ({ children, ...props }) => React.createElement('label', props, children),
}))

jest.mock('./src/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }) => 
    React.createElement('button', { onClick, ...props }, children),
}))

jest.mock('./src/components/ui/badge', () => ({
  Badge: ({ children }) => React.createElement('span', { className: 'badge' }, children),
}))

jest.mock('./src/components/ui/command', () => ({
  Command: ({ children }) => React.createElement('div', {}, children),
  CommandEmpty: ({ children }) => React.createElement('div', {}, children),
  CommandGroup: ({ children }) => React.createElement('div', {}, children),
  CommandInput: (props) => React.createElement('input', props),
  CommandItem: ({ children, onSelect }) => 
    React.createElement('div', { onClick: onSelect }, children),
  CommandList: ({ children }) => React.createElement('div', {}, children),
}))

jest.mock('./src/components/ui/popover', () => ({
  Popover: ({ children }) => React.createElement('div', {}, children),
  PopoverContent: ({ children }) => React.createElement('div', {}, children),
  PopoverTrigger: ({ children }) => React.createElement('div', {}, children),
}))

jest.mock('./src/components/ui/select', () => ({
  Select: ({ children }) => React.createElement('div', {}, children),
  SelectContent: ({ children }) => React.createElement('div', {}, children),
  SelectGroup: ({ children }) => React.createElement('div', {}, children),
  SelectItem: ({ children, value }) => React.createElement('option', { value }, children),
  SelectTrigger: ({ children }) => React.createElement('div', {}, children),
  SelectValue: ({ placeholder }) => React.createElement('span', {}, placeholder),
}))

jest.mock('./src/components/ui/textarea', () => ({
  Textarea: (props) => React.createElement('textarea', props),
}))

jest.mock('./src/components/ui/card', () => ({
  Card: ({ children, className }) => React.createElement('div', { className }, children),
  CardHeader: ({ children }) => React.createElement('div', {}, children),
  CardTitle: ({ children }) => React.createElement('h3', {}, children),
  CardDescription: ({ children }) => React.createElement('p', {}, children),
  CardContent: ({ children }) => React.createElement('div', {}, children),
}))

jest.mock('./src/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}))

jest.mock('./src/components/RichTextEditor', () => {
  return function MockRichTextEditor({ onChange, ...props }) {
    return React.createElement('textarea', {
      onChange: (e) => onChange && onChange(e.target.value),
      ...props
    })
  }
})

jest.mock('./src/components/CollectionMultiSelect', () => {
  return function MockCollectionMultiSelect(props) {
    return React.createElement('div', { 'data-testid': 'collection-multiselect' }, 'Collection Select')
  }
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useParams() {
    return {}
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock window.matchMedia for responsive hooks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
