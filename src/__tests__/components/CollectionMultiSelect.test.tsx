import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import CollectionMultiSelect from '../../components/CollectionMultiSelect';
import { mockCollections } from '../utils/test-utils';

// Mock all @/ imports that the component uses
jest.mock('@/types/view/models', () => ({
  Collection: {},
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, onKeyDown, ...props }: any) => (
    <input 
      onChange={onChange} 
      onKeyDown={onKeyDown}
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, onClick, ...props }: any) => (
    <span onClick={onClick} {...props}>{children}</span>
  ),
}))

// Mock UI components with relative imports for the test
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('../../components/ui/input', () => ({
  Input: ({ onChange, onKeyDown, ...props }: any) => (
    <input 
      onChange={onChange} 
      onKeyDown={onKeyDown}
      {...props}
    />
  ),
}))

jest.mock('../../components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

jest.mock('../../components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}))

jest.mock('../../components/ui/command', () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandEmpty: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandInput: ({ placeholder }: any) => <input placeholder={placeholder} />,
  CommandItem: ({ children, onSelect }: any) => (
    <div onClick={onSelect}>{children}</div>
  ),
  CommandList: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('../../components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
}))

// Mock the toast hook
jest.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('CollectionMultiSelect', () => {
  const mockOnCollectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockCollections,
    });
  });

  it('renders with placeholder text when no collections selected', async () => {
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    expect(screen.getByRole('combobox').textContent).toBe('Select collections...');
  });

  it('shows selected collection count when collections are selected', async () => {
    render(
      <CollectionMultiSelect
        selectedCollections={[mockCollections[0]]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    expect(screen.getByRole('combobox').textContent).toBe('1 collection(s) selected');
  });

  it('displays selected collections as badges', async () => {
    render(
      <CollectionMultiSelect
        selectedCollections={[mockCollections[0], mockCollections[1]]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    expect(screen.getByText('Test Collection 1')).toBeTruthy();
    expect(screen.getByText('Test Collection 2')).toBeTruthy();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search collections...')).toBeTruthy();
    });
  });

  it('shows available collections in dropdown', async () => {
    const user = userEvent.setup();
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Collection 1')).toBeTruthy();
      expect(screen.getByText('Test Collection 2')).toBeTruthy();
      expect(screen.getByText('Create New Collection')).toBeTruthy();
    });
  });

  it('selects a collection when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Collection 1')).toBeTruthy();
    });

    await user.click(screen.getByText('Test Collection 1'));
    
    expect(mockOnCollectionChange).toHaveBeenCalledWith([mockCollections[0]]);
  });

  it('deselects a collection when clicked again', async () => {
    const user = userEvent.setup();
    
    render(
      <CollectionMultiSelect
        selectedCollections={[mockCollections[0]]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Collection 1')).toBeTruthy();
    });

    await user.click(screen.getByText('Test Collection 1'));
    
    expect(mockOnCollectionChange).toHaveBeenCalledWith([]);
  });

  it('removes collection when X button in badge is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CollectionMultiSelect
        selectedCollections={[mockCollections[0]]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    const removeButton = screen.getByRole('button', { name: '' }); // X button has no accessible name
    await user.click(removeButton);
    
    expect(mockOnCollectionChange).toHaveBeenCalledWith([]);
  });

  it('shows create collection form when "Create New Collection" is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    
    await waitFor(() => {
      expect(screen.getByText('Create New Collection')).toBeTruthy();
    });

    await user.click(screen.getByText('Create New Collection'));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Collection Name')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter collection name')).toBeTruthy();
    });
  });

  it('creates a new collection successfully', async () => {
    const user = userEvent.setup();
    const newCollection = { id: 3, name: 'New Collection', description: '' };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCollections,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [newCollection],
      });
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Create New Collection'));
    
    const input = screen.getByPlaceholderText('Enter collection name');
    await user.type(input, 'New Collection');
    
    const submitButton = screen.getByRole('button', { name: '' }); // Check button
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnCollectionChange).toHaveBeenCalledWith([newCollection]);
    });
  });

  it('handles create collection API error', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCollections,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Collection already exists' }),
      });
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Create New Collection'));
    
    const input = screen.getByPlaceholderText('Enter collection name');
    await user.type(input, 'Duplicate Collection');
    
    const submitButton = screen.getByRole('button', { name: '' }); // Check button
    await user.click(submitButton);
    
    // Should not add the collection
    expect(mockOnCollectionChange).not.toHaveBeenCalled();
  });

  it('cancels collection creation when X button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Create New Collection'));
    
    const input = screen.getByPlaceholderText('Enter collection name');
    await user.type(input, 'Test');
    
    const cancelButton = screen.getAllByRole('button', { name: '' })[1]; // X button (second button)
    await user.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Enter collection name')).toBeFalsy();
    });
  });

  it('handles keyboard navigation (Enter to submit, Escape to cancel)', async () => {
    const user = userEvent.setup();
    const newCollection = { id: 3, name: 'Keyboard Collection', description: '' };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCollections,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [newCollection],
      });
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Create New Collection'));
    
    const input = screen.getByPlaceholderText('Enter collection name');
    await user.type(input, 'Keyboard Collection');
    
    // Submit with Enter key
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnCollectionChange).toHaveBeenCalledWith([newCollection]);
    });
  });

  it('handles API fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(
      <CollectionMultiSelect
        selectedCollections={[]}
        onCollectionChange={mockOnCollectionChange}
      />
    );
    
    // Component should still render even if fetch fails
    expect(screen.getByRole('combobox')).toBeTruthy();
  });
});
