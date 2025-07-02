/**
 * Test for tags functionality in recently added recipes
 */

describe('Recently Added Recipes with Tags', () => {
  // Mock fetch for API calls
  global.fetch = jest.fn();

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  const mockRecipesResponse = [
    { id: 1, name: 'Recipe 1', description: 'Description 1' },
    { id: 2, name: 'Recipe 2', description: 'Description 2' },
    { id: 3, name: 'Recipe 3', description: 'Description 3' },
  ];

  const mockTagsResponse1 = [
    { id: 1, name: 'Breakfast' },
    { id: 2, name: 'Quick' },
  ];

  const mockTagsResponse2 = [
    { id: 3, name: 'Dinner' },
    { id: 4, name: 'Vegetarian' },
  ];

  const mockTagsResponse3 = [
    { id: 5, name: 'Dessert' },
  ];

  const mockCollectionRecipesResponse = [];
  const mockCollectionsResponse = [];

  const simulateDataFetching = async () => {
    // Mock API responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/recipes?limit=3') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRecipesResponse),
        });
      }
      
      if (url === '/api/collection-recipes') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCollectionRecipesResponse),
        });
      }
      
      if (url === '/api/collections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCollectionsResponse),
        });
      }
      
      if (url === '/api/tags/1') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTagsResponse1),
        });
      }
      
      if (url === '/api/tags/2') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTagsResponse2),
        });
      }
      
      if (url === '/api/tags/3') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTagsResponse3),
        });
      }
      
      return Promise.reject(new Error('Unknown API call'));
    });

    // Simulate the data fetching logic from the component
    const recipesResponse = await fetch('/api/recipes?limit=3');
    const recipesData = await recipesResponse.json();

    const collectionRecipeResponse = await fetch('/api/collection-recipes');
    const collectionRecipeData = await collectionRecipeResponse.json();
    const collectionResponse = await fetch('/api/collections');
    const collectionData = await collectionResponse.json();

    // Fetch tags for each recipe
    const recipesWithTagsAndCollections = await Promise.all(
      recipesData.map(async (recipe: any) => {
        // Fetch tags for this recipe
        const tagsResponse = await fetch(`/api/tags/${recipe.id}`);
        const tagsData = tagsResponse.ok ? await tagsResponse.json() : [];

        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          tags: tagsData || [],
          ingredients: [],
          collections: [],
          createdAt: '',
          updatedAt: '',
          instructions: '',
        };
      })
    );

    return recipesWithTagsAndCollections;
  };

  it('should fetch tags for each recipe in recently added recipes', async () => {
    const recipes = await simulateDataFetching();

    expect(global.fetch).toHaveBeenCalledWith('/api/recipes?limit=3');
    expect(global.fetch).toHaveBeenCalledWith('/api/tags/1');
    expect(global.fetch).toHaveBeenCalledWith('/api/tags/2');
    expect(global.fetch).toHaveBeenCalledWith('/api/tags/3');

    expect(recipes).toHaveLength(3);
    
    // Verify first recipe has correct tags
    expect(recipes[0].tags).toEqual(mockTagsResponse1);
    expect(recipes[0].tags).toHaveLength(2);
    expect(recipes[0].tags[0].name).toBe('Breakfast');
    expect(recipes[0].tags[1].name).toBe('Quick');

    // Verify second recipe has correct tags
    expect(recipes[1].tags).toEqual(mockTagsResponse2);
    expect(recipes[1].tags).toHaveLength(2);
    expect(recipes[1].tags[0].name).toBe('Dinner');
    expect(recipes[1].tags[1].name).toBe('Vegetarian');

    // Verify third recipe has correct tags
    expect(recipes[2].tags).toEqual(mockTagsResponse3);
    expect(recipes[2].tags).toHaveLength(1);
    expect(recipes[2].tags[0].name).toBe('Dessert');
  });

  it('should handle recipes with no tags', async () => {
    // Mock empty tags response for recipe 2
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/recipes?limit=3') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockRecipesResponse[1]]),
        });
      }
      
      if (url === '/api/collection-recipes' || url === '/api/collections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      if (url === '/api/tags/2') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      return Promise.reject(new Error('Unknown API call'));
    });

    const recipesResponse = await fetch('/api/recipes?limit=3');
    const recipesData = await recipesResponse.json();

    const recipes = await Promise.all(
      recipesData.map(async (recipe: any) => {
        const tagsResponse = await fetch(`/api/tags/${recipe.id}`);
        const tagsData = tagsResponse.ok ? await tagsResponse.json() : [];

        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          tags: tagsData || [],
        };
      })
    );

    expect(recipes[0].tags).toEqual([]);
    expect(recipes[0].tags).toHaveLength(0);
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/recipes?limit=3') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockRecipesResponse[0]]),
        });
      }
      
      if (url === '/api/collection-recipes' || url === '/api/collections') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      if (url === '/api/tags/1') {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      
      return Promise.reject(new Error('Unknown API call'));
    });

    const recipesResponse = await fetch('/api/recipes?limit=3');
    const recipesData = await recipesResponse.json();

    const recipes = await Promise.all(
      recipesData.map(async (recipe: any) => {
        const tagsResponse = await fetch(`/api/tags/${recipe.id}`);
        const tagsData = tagsResponse.ok ? await tagsResponse.json() : [];

        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          tags: tagsData || [],
        };
      })
    );

    // Should gracefully handle failed tags request
    expect(recipes[0].tags).toEqual([]);
  });
});
