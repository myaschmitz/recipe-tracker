/**
 * Unit test for dynamic tag filtering logic
 */

import { Tag } from '../../types/view/models';

// Function to simulate the filtering logic used in the create recipe page
function filterAvailableTags(allTags: Tag[], selectedTags: Tag[]): Tag[] {
  return allTags.filter((tag) => 
    !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
  );
}

describe('Dynamic Tag Filtering Logic', () => {
  const mockTags: Tag[] = [
    { id: 1, name: 'Breakfast' },
    { id: 2, name: 'Lunch' },
    { id: 3, name: 'Dinner' },
    { id: 4, name: 'Snack' },
    { id: 5, name: 'Vegetarian' },
  ];

  it('should return all tags when no tags are selected', () => {
    const selectedTags: Tag[] = [];
    const availableTags = filterAvailableTags(mockTags, selectedTags);
    
    expect(availableTags).toHaveLength(5);
    expect(availableTags).toEqual(mockTags);
  });

  it('should filter out selected tags from available tags', () => {
    const selectedTags: Tag[] = [
      { id: 1, name: 'Breakfast' },
      { id: 3, name: 'Dinner' },
    ];
    
    const availableTags = filterAvailableTags(mockTags, selectedTags);
    
    expect(availableTags).toHaveLength(3);
    expect(availableTags.map(t => t.name)).toEqual(['Lunch', 'Snack', 'Vegetarian']);
    expect(availableTags.find(t => t.name === 'Breakfast')).toBeUndefined();
    expect(availableTags.find(t => t.name === 'Dinner')).toBeUndefined();
  });

  it('should return all tags when a selected tag is removed', () => {
    // Start with one tag selected
    let selectedTags: Tag[] = [{ id: 1, name: 'Breakfast' }];
    let availableTags = filterAvailableTags(mockTags, selectedTags);
    
    expect(availableTags).toHaveLength(4);
    expect(availableTags.find(t => t.name === 'Breakfast')).toBeUndefined();
    
    // Remove the selected tag
    selectedTags = [];
    availableTags = filterAvailableTags(mockTags, selectedTags);
    
    expect(availableTags).toHaveLength(5);
    expect(availableTags.find(t => t.name === 'Breakfast')).toBeDefined();
  });

  it('should handle empty tags array', () => {
    const emptyTags: Tag[] = [];
    const selectedTags: Tag[] = [];
    const availableTags = filterAvailableTags(emptyTags, selectedTags);
    
    expect(availableTags).toHaveLength(0);
    expect(availableTags).toEqual([]);
  });

  it('should handle all tags being selected', () => {
    const selectedTags = [...mockTags]; // All tags selected
    const availableTags = filterAvailableTags(mockTags, selectedTags);
    
    expect(availableTags).toHaveLength(0);
    expect(availableTags).toEqual([]);
  });

  it('should maintain original tag order after filtering', () => {
    const selectedTags: Tag[] = [{ id: 2, name: 'Lunch' }];
    const availableTags = filterAvailableTags(mockTags, selectedTags);
    
    // Should maintain the original order: Breakfast, Dinner, Snack, Vegetarian (Lunch removed)
    expect(availableTags.map(t => t.name)).toEqual(['Breakfast', 'Dinner', 'Snack', 'Vegetarian']);
  });
});
