/**
 * Application Constants
 * Central location for all constants used throughout the application
 */

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  // Core Resources
  RECIPES: '/api/recipes',
  COLLECTIONS: '/api/collections',
  TAGS: '/api/tags',
  UNITS: '/api/units',
  
  // Relationship Endpoints
  RECIPE_TAGS: '/api/recipe-tags',
  COLLECTION_RECIPES: '/api/collection-recipes',
  
  // User Endpoints
  USER: {
    RECIPE_FAVORITES: '/api/user/recipe-favorites',
    COLLECTION_FAVORITES: '/api/user/collection-favorites',
    WANT_TO_MAKE: '/api/user/want-to-make',
  },
  
  // Admin Endpoints
  ADMIN: {
    BASE: '/api/admin',
    GENERATE_TEST_DATA: '/api/admin/generate-test-data',
    DELETE_ALL_DATA: '/api/admin/delete-all-data',
    BACKUP_DATABASE: '/api/admin/backup-database',
    USERS: '/api/admin/users',
  },
  
  // Dynamic Endpoints (functions to generate paths)
  RECIPE_BY_ID: (id: string | number) => `/api/recipes/${id}`,
  COLLECTION_BY_ID: (id: string | number) => `/api/collections/${id}`,
  RECIPE_INGREDIENTS: (recipeId: string | number) => `/api/ingredients/${recipeId}`,
  RECIPE_TAGS_BY_ID: (recipeId: string | number) => `/api/tags/${recipeId}`,
  COLLECTION_RECIPES_BY_ID: (id: string | number) => `/api/collection-recipes/${id}`,
  UNIT_BY_ID: (id: string | number) => `/api/units/${id}`,
  USER_RECIPE_FAVORITE: (recipeId: string | number) => `/api/user/recipe-favorites/${recipeId}`,
  USER_COLLECTION_FAVORITE: (collectionId: string | number) => `/api/user/collection-favorites/${collectionId}`,
  USER_WANT_TO_MAKE: (recipeId: string | number) => `/api/user/want-to-make/${recipeId}`,
  ADMIN_USER_ROLE: (userId: string) => `/api/admin/users/${userId}/role`,
} as const;

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

export const VALIDATION = {
  // String lengths
  MIN_USERNAME_LENGTH: 3,
  MIN_RECIPE_NAME_LENGTH: 1,
  MIN_INGREDIENT_NAME_LENGTH: 1,
  MIN_TAG_NAME_LENGTH: 1,
  MIN_COLLECTION_NAME_LENGTH: 1,
  MIN_INSTRUCTIONS_LENGTH: 1,
  MIN_UNIT_NAME_LENGTH: 1,
  
  // Numeric constraints
  MIN_TIME: 0,
  MIN_AMOUNT: 0,
  MIN_INGREDIENTS_REQUIRED: 1,
  
  // Array constraints
  MAX_RETRIES: 3,
} as const;

// =============================================================================
// APPLICATION LIMITS
// =============================================================================

export const LIMITS = {
  // API Limits
  DEFAULT_RECIPE_LIMIT: 1000,
  DASHBOARD_RECENT_RECIPES: 3,
  
  // UI Limits
  TOAST_LIMIT: 1,
  
  // Pagination
  RECIPES_PER_PAGE: 20,
  COLLECTIONS_PER_PAGE: 20,
  
  // File sizes (in bytes)
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB,
} as const;

// =============================================================================
// TIMEOUTS
// =============================================================================

export const TIMEOUTS = {
  DEFAULT_API_TIMEOUT: 30000, // 30 seconds
  AUTH_TIMEOUT: 10000, // 10 seconds
  PROFILE_FETCH_TIMEOUT: 5000, // 5 seconds
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;

// =============================================================================
// HTTP STATUS CODES
// =============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// =============================================================================
// DATABASE TABLE NAMES
// =============================================================================

export const TABLES = {
  RECIPE: 'recipe',
  RECIPE_INGREDIENT: 'recipe_ingredient',
  RECIPE_TAG: 'recipe_tag',
  COLLECTION: 'collection',
  COLLECTION_RECIPE: 'collection_recipe',
  TAG: 'tag',
  UNIT: 'unit',
  PROFILE: 'profile',
  USER_RECIPE_FAVORITE: 'user_recipe_favorite',
  USER_COLLECTION_FAVORITE: 'user_collection_favorite',
  USER_WANT_TO_MAKE: 'user_want_to_make',
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  RESOURCE_NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  RECIPE_ALREADY_FAVORITED: 'Recipe is already favorited',
  COLLECTION_ALREADY_FAVORITED: 'Collection is already favorited',
  RECIPE_ALREADY_WANT_TO_MAKE: 'Recipe is already marked as want-to-make',
  RECIPE_FAVORITE_NOT_FOUND: 'Recipe favorite not found',
  COLLECTION_FAVORITE_NOT_FOUND: 'Collection favorite not found',
  WANT_TO_MAKE_NOT_FOUND: 'Want-to-make recipe not found',
} as const;

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  RECIPE_CREATED: 'Recipe created successfully',
  RECIPE_UPDATED: 'Recipe updated successfully',
  RECIPE_DELETED: 'Recipe deleted successfully',
  COLLECTION_CREATED: 'Collection created successfully',
  COLLECTION_UPDATED: 'Collection updated successfully',
  COLLECTION_DELETED: 'Collection deleted successfully',
  FAVORITE_ADDED: 'Added to favorites',
  FAVORITE_REMOVED: 'Removed from favorites',
  WANT_TO_MAKE_ADDED: 'Added to want-to-make list',
  WANT_TO_MAKE_UPDATED: 'Want-to-make notes updated',
  WANT_TO_MAKE_REMOVED: 'Removed from want-to-make list',
} as const;

// =============================================================================
// USER ROLES
// =============================================================================

export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

// =============================================================================
// THEME VALUES
// =============================================================================

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// =============================================================================
// FORM FIELD NAMES
// =============================================================================

export const FORM_FIELDS = {
  RECIPE_ID: 'recipe_id',
  COLLECTION_ID: 'collection_id',
  USER_ID: 'user_id',
  NOTES: 'notes',
} as const;

// =============================================================================
// QUERY PARAMETERS
// =============================================================================

export const QUERY_PARAMS = {
  LIMIT: 'limit',
  SEARCH: 'search',
  TAGS: 'tags',
  USER_ID: 'user_id',
  RECIPE_ID: 'recipe_id',
  COLLECTION_ID: 'collection_id',
} as const;

// =============================================================================
// TIME CONSTANTS
// =============================================================================

export const TIME = {
  MINUTES_PER_HOUR: 60,
  MILLISECONDS_PER_SECOND: 1000,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Theme = typeof THEME[keyof typeof THEME];
export type TableName = typeof TABLES[keyof typeof TABLES];
