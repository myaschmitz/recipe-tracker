# Recipe Tracker - Technical Documentation

This document contains detailed technical information about the Recipe Tracker application, including database schema, API endpoints, and implementation details.

## Project Structure

```
recipe-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── recipes/       # Recipe CRUD operations
│   │   │   ├── tags/          # Tag management
│   │   │   ├── recipe-tags/   # Recipe-tag relationships
│   │   │   ├── collections/   # Collection management
│   │   │   ├── users/         # User management
│   │   │   └── favorites/     # User favorites and bookmarks
│   │   ├── recipes/           # Recipe pages
│   │   │   ├── create/        # Recipe creation form
│   │   │   ├── edit/[id]/     # Recipe editing
│   │   │   └── [id]/          # Individual recipe pages
│   │   ├── collections/       # Collection pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── account/           # Account management
│   │   ├── settings/          # User preferences
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── RecipeCard.tsx    # Recipe display component
│   │   ├── RecipeScaler.tsx  # Recipe scaling component
│   │   └── PDFExporter.tsx   # PDF generation component
│   ├── lib/                   # Utility functions and configurations
│   │   ├── supabaseClient.ts  # Database connection
│   │   ├── fractions.ts       # Fraction calculation utilities
│   │   └── pdfGenerator.ts    # PDF export functionality
│   └── types/                 # TypeScript type definitions
│       ├── database/          # Database schema types
│       └── view/              # UI component types
├── public/                    # Static assets
├── PROJECT.md                 # Project overview
└── TECHNICAL.md              # This file
```

## Database Schema

### Core Tables

#### recipes
```sql
CREATE TABLE recipes (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  servings INTEGER DEFAULT 4,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

#### ingredients
```sql
CREATE TABLE ingredients (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,3),
  unit VARCHAR(50),
  notes TEXT,
  order_index INTEGER DEFAULT 0
);
```

#### tags
```sql
CREATE TABLE tags (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280', -- hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### recipe_tags
```sql
CREATE TABLE recipe_tags (
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);
```

### Collection Tables

#### collections
```sql
CREATE TABLE collections (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### collection_recipes
```sql
CREATE TABLE collection_recipes (
  collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (collection_id, recipe_id)
);
```

### User Management Tables

#### user_preferences
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  units VARCHAR(20) DEFAULT 'imperial' CHECK (units IN ('imperial', 'metric')),
  default_servings INTEGER DEFAULT 4,
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_favorites
```sql
CREATE TABLE user_favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);
```

#### user_want_to_make
```sql
CREATE TABLE user_want_to_make (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (user_id, recipe_id)
);
```

#### recipe_albums
```sql
CREATE TABLE recipe_albums (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### album_recipes
```sql
CREATE TABLE album_recipes (
  album_id BIGINT REFERENCES recipe_albums(id) ON DELETE CASCADE,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (album_id, recipe_id)
);
```

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_recipe_tags_tag_id ON recipe_tags(tag_id);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_want_to_make_user_id ON user_want_to_make(user_id);

-- Search indexes
CREATE INDEX idx_recipes_name_search ON recipes USING gin(to_tsvector('english', name));
CREATE INDEX idx_recipes_description_search ON recipes USING gin(to_tsvector('english', description));
CREATE INDEX idx_tags_name_search ON tags USING gin(to_tsvector('english', name));
```

## API Endpoints

### Recipes
- `GET /api/recipes` - Fetch all recipes with filtering/pagination
  - Query params: `page`, `limit`, `search`, `tags`, `difficulty`, `user_id`
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/[id]` - Fetch specific recipe with ingredients and tags
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `POST /api/recipes/[id]/scale` - Get scaled recipe quantities
  - Body: `{ servings: number }`
- `GET /api/recipes/[id]/pdf` - Export recipe as PDF

### Ingredients
- `GET /api/recipes/[id]/ingredients` - Get recipe ingredients
- `POST /api/recipes/[id]/ingredients` - Add ingredient to recipe
- `PUT /api/ingredients/[id]` - Update ingredient
- `DELETE /api/ingredients/[id]` - Delete ingredient

### Tags
- `GET /api/tags` - Fetch all tags
- `GET /api/tags/[recipeId]` - Fetch tags for specific recipe
- `POST /api/tags` - Create new tag
- `PUT /api/tags/[id]` - Update tag
- `DELETE /api/tags/[id]` - Delete tag

### Recipe-Tags
- `GET /api/recipe-tags` - Fetch all recipe-tag relationships
- `POST /api/recipe-tags` - Create recipe-tag relationship
- `DELETE /api/recipe-tags` - Remove recipe-tag relationship

### Collections & Albums
- `GET /api/collections` - Fetch user's collections
- `POST /api/collections` - Create new collection
- `PUT /api/collections/[id]` - Update collection
- `DELETE /api/collections/[id]` - Delete collection
- `POST /api/collections/[id]/recipes` - Add recipe to collection
- `DELETE /api/collections/[id]/recipes/[recipeId]` - Remove recipe from collection

- `GET /api/albums` - Fetch user albums
- `POST /api/albums` - Create new album
- `PUT /api/albums/[id]` - Update album
- `DELETE /api/albums/[id]` - Delete album

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/dashboard` - Get dashboard data

### Favorites & Bookmarks
- `GET /api/favorites` - Get user's favorite recipes
- `POST /api/favorites` - Add recipe to favorites
  - Body: `{ recipeId: number }`
- `DELETE /api/favorites/[recipeId]` - Remove from favorites

- `GET /api/want-to-make` - Get user's want-to-make list
- `POST /api/want-to-make` - Add recipe to want-to-make list
  - Body: `{ recipeId: number, notes?: string }`
- `DELETE /api/want-to-make/[recipeId]` - Remove from want-to-make list

## TypeScript Types

### Database Models
```typescript
export interface RecipeSchema {
  id: number;
  name: string;
  description?: string;
  instructions?: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface IngredientSchema {
  id: number;
  recipe_id: number;
  name: string;
  amount?: number;
  unit?: string;
  notes?: string;
  order_index: number;
}

export interface TagSchema {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface RecipeTagSchema {
  recipe_id: number;
  tag_id: number;
}
```

### View Models
```typescript
export interface Recipe {
  id: number;
  name: string;
  description?: string;
  instructions?: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags: Tag[];
  ingredients: Ingredient[];
  created_at: string;
  user_id: string;
}

export interface Ingredient {
  id: number;
  name: string;
  amount?: number;
  unit?: string;
  notes?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  recipes: Recipe[];
  is_public: boolean;
  created_at: string;
}
```

## Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Setup

### Database Setup
1. Create a new Supabase project
2. Run the SQL schema provided above
3. Enable Row Level Security (RLS) for user data protection
4. Set up authentication policies

### Authentication Setup
```sql
-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for recipes
CREATE POLICY "Users can view public recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own recipes" ON recipes
  FOR ALL USING (auth.uid() = user_id);
```

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Performance Optimizations

### Database Optimizations
- Implement connection pooling
- Add database indexes for frequently queried columns
- Use database functions for complex queries
- Implement caching for frequently accessed data

### Frontend Optimizations
- Implement React Query for data fetching and caching
- Use Next.js Image optimization for recipe images
- Implement virtual scrolling for large recipe lists
- Add pagination for recipe collections

### API Optimizations
- Implement request/response caching
- Use database transactions for complex operations
- Add rate limiting for API endpoints
- Implement background jobs for heavy operations (PDF generation)

## Security Considerations

### Data Protection
- Implement Row Level Security (RLS) in Supabase
- Validate all user inputs on both client and server
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization

### API Security
- Add CORS configuration
- Implement rate limiting
- Use HTTPS in production
- Validate API request payloads

## Deployment

### Production Environment
- Deploy to Vercel or similar platform
- Configure production Supabase instance
- Set up CDN for static assets
- Implement monitoring and logging

### Environment Configuration
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Testing Strategy

### Unit Tests
- Test utility functions (fraction calculations, unit conversions)
- Test React components with React Testing Library
- Test API route handlers

### Integration Tests
- Test database operations
- Test API endpoints with mock data
- Test user workflows

### End-to-End Tests
- Test complete user journeys
- Test recipe creation and management flows
- Test authentication and authorization