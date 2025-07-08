import { 
  recipeSchema, 
  recipeFormSchema,
  recipeIngredientSchema,
  recipeIngredientFormSchema,
  collectionSchema,
  tagSchema,
  unitSchema 
} from '../../lib/schemas';

describe('Schema Validation', () => {
  describe('recipeIngredientFormSchema', () => {
    it('should validate a valid ingredient', () => {
      const validIngredient = {
        name: 'Sugar',
        amount: 2,
        unitId: 1,
        note: 'white sugar'
      }

      const result = recipeIngredientFormSchema.safeParse(validIngredient)
      expect(result.success).toBe(true)
    })

    it('should reject ingredient without name', () => {
      const invalidIngredient = {
        amount: 2,
        unitId: 1,
      }

      const result = recipeIngredientFormSchema.safeParse(invalidIngredient)
      expect(result.success).toBe(false)
    })

    it('should reject ingredient with negative amount', () => {
      const invalidIngredient = {
        name: 'Sugar',
        amount: -1,
        unitId: 1,
      }

      const result = recipeIngredientFormSchema.safeParse(invalidIngredient)
      expect(result.success).toBe(false)
    })

    it('should convert string amount to number', () => {
      const ingredient = {
        name: 'Sugar',
        amount: '2',
        unitId: 1,
      }

      const result = recipeIngredientFormSchema.safeParse(ingredient)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.amount).toBe(2)
      }
    })
  })

  describe('recipeIngredientSchema', () => {
    it('should validate a valid ingredient with snake_case fields', () => {
      const validIngredient = {
        name: 'Sugar',
        amount: 2,
        unit_id: 1,
        note: 'white sugar'
      }

      const result = recipeIngredientSchema.safeParse(validIngredient)
      expect(result.success).toBe(true)
    })

    it('should reject ingredient without name', () => {
      const invalidIngredient = {
        amount: 2,
        unit_id: 1,
      }

      const result = recipeIngredientSchema.safeParse(invalidIngredient)
      expect(result.success).toBe(false)
    })

    it('should reject ingredient with negative amount', () => {
      const invalidIngredient = {
        name: 'Sugar',
        amount: -1,
        unit_id: 1,
      }

      const result = recipeIngredientSchema.safeParse(invalidIngredient)
      expect(result.success).toBe(false)
    })
  })

  describe('recipeSchema', () => {
    it('should validate a valid recipe', () => {
      const validRecipe = {
        name: 'Chocolate Cake',
        description: 'A delicious cake',
        instructions: 'Mix and bake',
        ingredients: [
          {
            name: 'Sugar',
            amount: 2,
            unitId: 1,
          }
        ],
        tags: [1, 2],
        collections: [1],
        prepTime: 30,
        cookTime: 45,
        totalTime: 75,
      }

      const result = recipeFormSchema.safeParse(validRecipe)
      expect(result.success).toBe(true)
    })

    it('should reject recipe without name', () => {
      const invalidRecipe = {
        instructions: 'Mix and bake',
        ingredients: [
          {
            name: 'Sugar',
            amount: 2,
            unitId: 1,
          }
        ],
      }

      const result = recipeSchema.safeParse(invalidRecipe)
      expect(result.success).toBe(false)
    })

    it('should reject recipe without instructions', () => {
      const invalidRecipe = {
        name: 'Chocolate Cake',
        ingredients: [
          {
            name: 'Sugar',
            amount: 2,
            unitId: 1,
          }
        ],
      }

      const result = recipeSchema.safeParse(invalidRecipe)
      expect(result.success).toBe(false)
    })

    it('should reject recipe without ingredients', () => {
      const invalidRecipe = {
        name: 'Chocolate Cake',
        instructions: 'Mix and bake',
        ingredients: [],
      }

      const result = recipeSchema.safeParse(invalidRecipe)
      expect(result.success).toBe(false)
    })

    it('should allow optional fields to be undefined', () => {
      const recipe = {
        name: 'Simple Recipe',
        instructions: 'Simple instructions',
        ingredients: [
          {
            name: 'Sugar',
            amount: 2,
            unitId: 1,
          }
        ],
      }

      const result = recipeFormSchema.safeParse(recipe)
      expect(result.success).toBe(true)
    })
  })

  describe('collectionSchema', () => {
    it('should validate a valid collection', () => {
      const validCollection = {
        name: 'My Favorites',
        description: 'Collection of favorite recipes',
      }

      const result = collectionSchema.safeParse(validCollection)
      expect(result.success).toBe(true)
    })

    it('should reject collection without name', () => {
      const invalidCollection = {
        description: 'Collection without name',
      }

      const result = collectionSchema.safeParse(invalidCollection)
      expect(result.success).toBe(false)
    })

    it('should allow empty description', () => {
      const collection = {
        name: 'My Collection',
      }

      const result = collectionSchema.safeParse(collection)
      expect(result.success).toBe(true)
    })
  })

  describe('tagSchema', () => {
    it('should validate a valid tag', () => {
      const validTag = {
        id: 1,
        name: 'dessert',
      }

      const result = tagSchema.safeParse(validTag)
      expect(result.success).toBe(true)
    })

    it('should reject tag without name', () => {
      const invalidTag = {
        id: 1,
      }

      const result = tagSchema.safeParse(invalidTag)
      expect(result.success).toBe(false)
    })
  })

  describe('unitSchema', () => {
    it('should validate a valid unit', () => {
      const validUnit = {
        id: 1,
        name: 'cup',
      }

      const result = unitSchema.safeParse(validUnit)
      expect(result.success).toBe(true)
    })

    it('should reject unit without name', () => {
      const invalidUnit = {
        id: 1,
      }

      const result = unitSchema.safeParse(invalidUnit)
      expect(result.success).toBe(false)
    })
  })
})
