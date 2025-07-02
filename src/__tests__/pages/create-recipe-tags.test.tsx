/**
 * Tests the dynamic tag filtering functionality in the create recipe page
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../hooks/use-toast';
import CreateRecipe from '../../app/recipes/create/page';

// Mock the hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock the RichTextEditor component
jest.mock('../../components/RichTextEditor', () => {
  return function MockRichTextEditor({ onChange }: { onChange: (value: string) => void }) {
    return (
      <textarea
        data-testid="rich-text-editor"
        onChange={(e) => onChange(e.target.value)}
        placeholder="Instructions"
      />
    );
  };
});

// Mock the CollectionMultiSelect component
jest.mock('../../components/CollectionMultiSelect', () => {
  return function MockCollectionMultiSelect() {
    return <div data-testid="collection-multi-select">Collections</div>;
  };
});

// Mock fetch for API calls
global.fetch = jest.fn();

const mockPush = jest.fn();
const mockToast = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });
  
  (useToast as jest.Mock).mockReturnValue({
    toast: mockToast,
  });

  // Mock the fetch responses
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url === '/api/units') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, name: 'cup' },
          { id: 2, name: 'tablespoon' },
          { id: 3, name: 'teaspoon' },
        ]),
      });
    }
    
    if (url === '/api/tags') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, name: 'Breakfast' },
          { id: 2, name: 'Lunch' },
          { id: 3, name: 'Dinner' },
          { id: 4, name: 'Snack' },
          { id: 5, name: 'Vegetarian' },
        ]),
      });
    }
    
    return Promise.reject(new Error('Unknown API call'));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateRecipe - Dynamic Tag Filtering', () => {
  it('should filter out selected tags from the dropdown', async () => {
    render(<CreateRecipe />);
    
    // Wait for tags to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tags');
    });

    // Find and click the tags dropdown
    const tagButton = screen.getByText('Select tags...');
    fireEvent.click(tagButton);

    // Initially, all tags should be available
    await waitFor(() => {
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
      expect(screen.getByText('Lunch')).toBeInTheDocument();
      expect(screen.getByText('Dinner')).toBeInTheDocument();
      expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    });

    // Select a tag (e.g., "Breakfast")
    const breakfastTag = screen.getByText('Breakfast');
    fireEvent.click(breakfastTag);

    // Verify the tag appears in selected tags
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Breakfast/ })).toBeInTheDocument();
    });

    // Open the dropdown again
    const tagButtonAgain = screen.getByText('Select tags...');
    fireEvent.click(tagButtonAgain);

    // "Breakfast" should no longer be in the dropdown
    await waitFor(() => {
      expect(screen.queryByText('Breakfast')).not.toBeInTheDocument();
      expect(screen.getByText('Lunch')).toBeInTheDocument();
      expect(screen.getByText('Dinner')).toBeInTheDocument();
      expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    });
  });

  it('should show tag back in dropdown when removed from selected tags', async () => {
    render(<CreateRecipe />);
    
    // Wait for tags to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tags');
    });

    // Select a tag
    const tagButton = screen.getByText('Select tags...');
    fireEvent.click(tagButton);
    
    await waitFor(() => {
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
    });

    const breakfastTag = screen.getByText('Breakfast');
    fireEvent.click(breakfastTag);

    // Verify the tag is selected
    await waitFor(() => {
      const selectedTag = screen.getByRole('button', { name: /Breakfast/ });
      expect(selectedTag).toBeInTheDocument();
    });

    // Remove the tag using the X button
    const removeButton = screen.getByTestId(/X/);
    fireEvent.click(removeButton);

    // Open dropdown again
    const tagButtonAfterRemoval = screen.getByText('Select tags...');
    fireEvent.click(tagButtonAfterRemoval);

    // "Breakfast" should be back in the dropdown
    await waitFor(() => {
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
    });
  });

  it('should handle multiple tag selections correctly', async () => {
    render(<CreateRecipe />);
    
    // Wait for tags to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/tags');
    });

    // Select multiple tags
    const tagButton = screen.getByText('Select tags...');
    
    // Select "Breakfast"
    fireEvent.click(tagButton);
    const breakfastTag = screen.getByText('Breakfast');
    fireEvent.click(breakfastTag);

    // Select "Vegetarian"
    fireEvent.click(tagButton);
    const vegetarianTag = screen.getByText('Vegetarian');
    fireEvent.click(vegetarianTag);

    // Verify both tags are selected
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Breakfast/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Vegetarian/ })).toBeInTheDocument();
    });

    // Open dropdown - both selected tags should be filtered out
    fireEvent.click(tagButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Breakfast')).not.toBeInTheDocument();
      expect(screen.queryByText('Vegetarian')).not.toBeInTheDocument();
      expect(screen.getByText('Lunch')).toBeInTheDocument();
      expect(screen.getByText('Dinner')).toBeInTheDocument();
    });
  });
});
