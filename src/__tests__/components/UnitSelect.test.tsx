import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UnitSelect from '@/components/UnitSelect';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon">✓</span>,
  Plus: () => <span data-testid="plus-icon">+</span>,
  ChevronDown: () => <span data-testid="chevron-down-icon">▼</span>,
}));

// Mock the UI components
jest.mock('@/components/ui/command', () => ({
  Command: ({ children }: { children: React.ReactNode }) => <div data-testid="command">{children}</div>,
  CommandEmpty: ({ children }: { children: React.ReactNode }) => <div data-testid="command-empty">{children}</div>,
  CommandGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="command-group">{children}</div>,
  CommandInput: ({ placeholder }: { placeholder: string }) => <input data-testid="command-input" placeholder={placeholder} />,
  CommandItem: ({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) => (
    <div data-testid="command-item" onClick={onSelect}>{children}</div>
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => <div data-testid="command-list">{children}</div>,
}));

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="popover-trigger">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: any }) => (
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <label data-testid="label" {...props}>{children}</label>
  ),
}));

// Mock the hooks and fetch
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock data
const mockUnits = [
  { id: 1, name: 'cup', symbol: 'c' },
  { id: 2, name: 'tablespoon', symbol: 'tbsp' },
  { id: 3, name: 'gram', symbol: 'g' },
];

describe('UnitSelect Component', () => {
  const mockOnUnitChange = jest.fn();
  const mockOnUnitCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUnits),
    });
  });

  it('should render with placeholder text', async () => {
    render(
      <UnitSelect
        selectedUnit={null}
        onUnitChange={mockOnUnitChange}
        placeholder="Select unit..."
      />
    );

    expect(screen.getByText('Select unit...')).toBeInTheDocument();
  });

  it('should display selected unit', async () => {
    render(
      <UnitSelect
        selectedUnit={mockUnits[0]}
        onUnitChange={mockOnUnitChange}
        placeholder="Select unit..."
      />
    );

    expect(screen.getByText('cup')).toBeInTheDocument();
  });

  it('should fetch units on mount', async () => {
    render(
      <UnitSelect
        selectedUnit={null}
        onUnitChange={mockOnUnitChange}
        placeholder="Select unit..."
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/units');
    });
  });
});
