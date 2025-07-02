/**
 * Tests for the delete recipe modal functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';

// Mock the hooks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock html-react-parser
jest.mock('html-react-parser', () => {
  return jest.fn((content) => content);
});

// Mock fetch
global.fetch = jest.fn();

const mockPush = jest.fn();

beforeEach(() => {
  (useParams as jest.Mock).mockReturnValue({ id: '1' });
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });

  // Mock successful API responses
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes('/api/recipes/1')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          name: 'Test Recipe',
          description: 'Test description',
          instructions: 'Test instructions',
        }),
      });
    }
    
    if (url.includes('/api/ingredients/1')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    
    if (url.includes('/api/tags/1')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }

    if (url.includes('/api/collection-recipes')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    
    return Promise.reject(new Error('Unknown API call'));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Recipe Delete Modal', () => {
  it('should show delete modal when delete button is clicked', async () => {
    // Dynamic import to avoid SSR issues
    const RecipePage = (await import('../../app/recipes/[id]/page')).default;
    
    render(<RecipePage />);
    
    // Wait for the recipe to load
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeDefined();
    });

    // Find and click the delete button (X icon)
    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    // Check if modal appears
    await waitFor(() => {
      expect(screen.getByText('Delete Recipe')).toBeDefined();
      expect(screen.getByText(/Are you sure you want to delete "Test Recipe"/)).toBeDefined();
      expect(screen.getByText('Cancel')).toBeDefined();
      expect(screen.getByText('Delete Recipe')).toBeDefined();
    });
  });

  it('should close modal when cancel is clicked', async () => {
    const RecipePage = (await import('../../app/recipes/[id]/page')).default;
    
    render(<RecipePage />);
    
    // Wait for the recipe to load and open modal
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeDefined();
    });

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeDefined();
    });

    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByText('Delete Recipe')).toBeNull();
    });
  });

  it('should call delete API and redirect when delete is confirmed', async () => {
    // Mock successful delete
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/recipes/1') && options?.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      
      // Keep other mocks as before
      if (url.includes('/api/recipes/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 1,
            name: 'Test Recipe',
            description: 'Test description',
            instructions: 'Test instructions',
          }),
        });
      }
      
      if (url.includes('/api/ingredients/1') || url.includes('/api/tags/1') || url.includes('/api/collection-recipes')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      return Promise.reject(new Error('Unknown API call'));
    });

    const RecipePage = (await import('../../app/recipes/[id]/page')).default;
    
    render(<RecipePage />);
    
    // Wait for the recipe to load and open modal
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeDefined();
    });

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Delete Recipe')).toBeDefined();
    });

    // Click delete
    const confirmDeleteButton = screen.getByRole('button', { name: /Delete Recipe/ });
    fireEvent.click(confirmDeleteButton);

    // Should call delete API and redirect
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1', { method: 'DELETE' });
      expect(mockPush).toHaveBeenCalledWith('/recipes');
    });
  });
});
