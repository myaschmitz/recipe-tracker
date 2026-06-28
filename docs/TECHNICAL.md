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
├── README.md                  # Project README and entry point
└── docs/                      # Project documentation
    ├── PROJECT.md             # Project overview
    └── TECHNICAL.md           # This file
```

## Database Schema

### Core Tables

#### recipe
```sql
CREATE TABLE public.recipe (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  instructions text NOT NULL,
  prep_time integer,
  cook_time integer,
  total_time integer,
  link text,
  user_id uuid,
  CONSTRAINT recipe_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

#### recipe_ingredient
```sql
CREATE TABLE public.recipe_ingredient (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  recipe_id bigint NOT NULL,
  name character varying NOT NULL,
  amount real NOT NULL,
  unit_id bigint NOT NULL,
  note text,
  CONSTRAINT recipe_ingredient_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_ingredient_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id),
  CONSTRAINT recipe_ingredient_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.unit(id)
);
```

#### unit
```sql
CREATE TABLE public.unit (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  symbol character varying,
  CONSTRAINT unit_pkey PRIMARY KEY (id)
);
```

#### tag
```sql
CREATE TABLE public.tag (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  CONSTRAINT tag_pkey PRIMARY KEY (id)
);
```

#### recipe_tag
```sql
CREATE TABLE public.recipe_tag (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  recipe_id bigint NOT NULL,
  tag_id bigint,
  CONSTRAINT recipe_tag_pkey PRIMARY KEY (id),
  CONSTRAINT recipe_tag_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id),
  CONSTRAINT recipe_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tag(id)
);
```

### Collection Tables

#### collection
```sql
CREATE TABLE public.collection (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying NOT NULL,
  description text,
  user_id uuid,
  is_public boolean DEFAULT false,
  CONSTRAINT collection_pkey PRIMARY KEY (id),
  CONSTRAINT collection_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

#### collection_recipe
```sql
CREATE TABLE public.collection_recipe (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  recipe_id bigint NOT NULL,
  collection_id bigint NOT NULL,
  CONSTRAINT collection_recipe_pkey PRIMARY KEY (id),
  CONSTRAINT collection_recipe_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id),
  CONSTRAINT collection_recipe_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collection(id)
);
```

### User Management Tables

#### profile
```sql
CREATE TABLE public.profile (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  username text NOT NULL UNIQUE CHECK (char_length(username) >= 3),
  avatar_url text,
  first_name text,
  last_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  location text,
  name text,
  email text,
  phone text,
  bio text,
  date_of_birth date,
  timezone text,
  language text DEFAULT 'en'::text,
  theme_preference text DEFAULT 'system'::text,
  dietary_restrictions ARRAY,
  is_private boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  role user_role DEFAULT 'user'::user_role,
  CONSTRAINT profile_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
```

### User Role System

#### user_role Enum Type
```sql
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
```

### User Role System

#### user_role Enum Type
```sql
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
```

#### Role Management Functions
```sql
-- Function to check if the current user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profile
    WHERE id = (select auth.uid())
    AND role = required_role
  );
$$;

-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT public.has_role('admin'::user_role);
$$;

-- Function to set a user's role (admin only)
CREATE OR REPLACE FUNCTION public.set_user_role(user_id uuid, new_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;

  -- Update the user's role
  UPDATE public.profile
  SET role = new_role
  WHERE id = user_id;
END;
$$;

-- Function to promote the first user to admin
CREATE OR REPLACE FUNCTION public.promote_first_user_to_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the ID of the first user in the system
  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;
  
  -- Update their role to admin
  UPDATE public.profile
  SET role = 'admin'::user_role
  WHERE id = first_user_id;
  
  RAISE NOTICE 'User % has been promoted to admin', first_user_id;
END;
$$;
```

### Initial Data Setup

#### Basic Units
```sql
-- Insert common measurement units
INSERT INTO public.unit (name, symbol) VALUES
  ('cup', 'cup'),
  ('tablespoon', 'tbsp'),
  ('teaspoon', 'tsp'),
  ('ounce', 'oz'),
  ('pound', 'lb'),
  ('gram', 'g'),
  ('kilogram', 'kg'),
  ('milliliter', 'ml'),
  ('liter', 'l'),
  ('fluid ounce', 'fl oz'),
  ('pint', 'pt'),
  ('quart', 'qt'),
  ('gallon', 'gal'),
  ('piece', 'pc'),
  ('slice', 'slice'),
  ('clove', 'clove'),
  ('bunch', 'bunch'),
  ('package', 'pkg'),
  ('can', 'can'),
  ('bottle', 'bottle');
```

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_recipe_user_id ON recipe(user_id);
CREATE INDEX idx_recipe_created_at ON recipe(created_at DESC);
CREATE INDEX idx_recipe_ingredient_recipe_id ON recipe_ingredient(recipe_id);
CREATE INDEX idx_recipe_tag_recipe_id ON recipe_tag(recipe_id);
CREATE INDEX idx_recipe_tag_tag_id ON recipe_tag(tag_id);
CREATE INDEX idx_collection_user_id ON collection(user_id);
CREATE INDEX idx_collection_recipe_recipe_id ON collection_recipe(recipe_id);
CREATE INDEX idx_collection_recipe_collection_id ON collection_recipe(collection_id);

-- Role-based indexes
CREATE INDEX IF NOT EXISTS idx_profile_role ON public.profile(role);

-- Search indexes
CREATE INDEX idx_recipe_name_search ON recipe USING gin(to_tsvector('english', name));
CREATE INDEX idx_recipe_description_search ON recipe USING gin(to_tsvector('english', description));
CREATE INDEX idx_tag_name_search ON tag USING gin(to_tsvector('english', name));
```

## API Endpoints

### Recipes
- `GET /api/recipes` - Fetch all recipes with filtering/pagination
  - Query params: `page`, `limit`, `search`, `tags`, `user_id`
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/[id]` - Fetch specific recipe with ingredients and tags
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe

### Tags
- `GET /api/tags` - Fetch all tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/[id]` - Update tag
- `DELETE /api/tags/[id]` - Delete tag

### Collections
- `GET /api/collections` - Fetch user's collections
- `POST /api/collections` - Create new collection
- `GET /api/collections/[id]` - Fetch specific collection with recipes
- `PUT /api/collections/[id]` - Update collection
- `DELETE /api/collections/[id]` - Delete collection

### Collection Recipes
- `GET /api/collection-recipes/[id]` - Get recipes in a specific collection
- `POST /api/collection-recipes` - Add recipe to collection
  - Body: `{ recipe_id: number, collection_id: number }`
- `DELETE /api/collection-recipes` - Remove recipe from collection
  - Body: `{ recipe_id: number, collection_id: number }`

### Units
- `GET /api/units` - Fetch all measurement units
- `POST /api/units` - Create new unit
- `PUT /api/units/[id]` - Update unit
- `DELETE /api/units/[id]` - Delete unit

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### User Roles (Admin only)
- `GET /api/admin/users` - Fetch all users with roles (admin only)
- `PUT /api/admin/users/[id]/role` - Update user role (admin only)
  - Body: `{ role: 'user' | 'admin' | 'moderator' }`
- `GET /api/admin/roles` - Get available roles and permissions

## TypeScript Types

### Role Types
```typescript
export type UserRole = 'user' | 'admin' | 'moderator';

export interface RolePermissions {
  canCreateRecipes: boolean;
  canEditOwnRecipes: boolean;
  canEditAllRecipes: boolean;
  canDeleteOwnRecipes: boolean;
  canDeleteAllRecipes: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canModerateContent: boolean;
}
```

### Database Models
```typescript
export interface RecipeSchema {
  id: number;
  name: string;
  description?: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  link?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface RecipeIngredientSchema {
  id: number;
  recipe_id: number;
  name: string;
  amount: number;
  unit_id: number;
  note?: string;
}

export interface UnitSchema {
  id: number;
  name: string;
  symbol?: string;
}

export interface TagSchema {
  id: number;
  name: string;
}

export interface RecipeTagSchema {
  id: number;
  recipe_id: number;
  tag_id?: number;
}

export interface CollectionSchema {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  user_id?: string;
  is_public: boolean;
}

export interface CollectionRecipeSchema {
  id: number;
  recipe_id: number;
  collection_id: number;
}

export interface ProfileSchema {
  id: string;
  updated_at?: string;
  username: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  location?: string;
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  timezone?: string;
  language: string;
  theme_preference: string;
  dietary_restrictions?: string[];
  is_private: boolean;
  email_notifications: boolean;
  role: 'user' | 'admin' | 'moderator';
}
```

### View Models
```typescript
export interface Recipe {
  id: number;
  name: string;
  description?: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  link?: string;
  tags: Tag[];
  ingredients: Ingredient[];
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: Unit;
  note?: string;
}

export interface Unit {
  id: number;
  name: string;
  symbol?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  recipes: Recipe[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  location?: string;
  email?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  timezone?: string;
  language: string;
  theme_preference: string;
  dietary_restrictions?: string[];
  is_private: boolean;
  email_notifications: boolean;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at?: string;
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
ALTER TABLE recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Policies for recipes
CREATE POLICY "Anyone can view recipes" 
ON public.recipe
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own recipes" 
ON public.recipe
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners and admins can update recipes" 
ON public.recipe
FOR UPDATE
USING (
  user_id = (select auth.uid()) OR 
  (SELECT public.is_admin())
);

CREATE POLICY "Owners and admins can delete recipes" 
ON public.recipe
FOR DELETE
USING (
  user_id = (select auth.uid()) OR 
  (SELECT public.is_admin())
);

-- Policies for collections
CREATE POLICY "Users can view public collections or own collections" 
ON public.collection
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" 
ON public.collection
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners and admins can update collections" 
ON public.collection
FOR UPDATE
USING (
  auth.uid() = user_id OR 
  (SELECT public.is_admin())
);

CREATE POLICY "Owners and admins can delete collections" 
ON public.collection
FOR DELETE
USING (
  auth.uid() = user_id OR 
  (SELECT public.is_admin())
);

-- Policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profile
FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profile
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" 
ON public.profile
FOR UPDATE 
USING ((SELECT public.is_admin()));
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

## User Role System

### Overview
The application implements a role-based access control (RBAC) system with three distinct roles:

- **`user`** - Default role for all new users. Can create and manage their own recipes and collections.
- **`admin`** - Full system access. Can manage all recipes, collections, and user accounts.
- **`moderator`** - Intermediate role with extended permissions for content moderation.

### Role Implementation

#### Database Schema
- Uses PostgreSQL `ENUM` type for type safety: `CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator')`
- Role column added to `profile` table with default value of `'user'`
- Indexed for performance: `CREATE INDEX idx_profile_role ON profile(role)`

#### Helper Functions
- `has_role(required_role)` - Check if current user has specific role
- `is_admin()` - Shorthand to check admin status
- `set_user_role(user_id, new_role)` - Admin-only function to change user roles
- `promote_first_user_to_admin()` - One-time setup function for initial admin

#### Row Level Security Integration
- Enhanced RLS policies that consider user roles
- Admin override permissions for recipe and collection management
- Granular access control based on role hierarchy

### Role Permissions

#### User Role (`user`)
- Create, read, update, delete own recipes
- Create, read, update, delete own collections
- View public collections from other users
- Update own profile information

#### Moderator Role (`moderator`)
- All user permissions
- View and moderate public content
- Extended reporting capabilities
- Content flagging and review permissions

#### Admin Role (`admin`)
- All moderator permissions
- Full system access to all recipes and collections
- User management capabilities (view users, assign roles)
- System configuration access
- Database administration functions

### Setup Instructions

1. **Initial Admin Setup**: Run `SELECT public.promote_first_user_to_admin();` to promote the first registered user to admin
2. **Role Assignment**: Use `SELECT public.set_user_role('user-uuid', 'admin'::user_role);` to assign roles
3. **Permission Testing**: Use `SELECT public.has_role('admin'::user_role);` to test role permissions

### Frontend Integration

#### Role Checking
```typescript
// Check user role in components
const { profile } = useAuth();
const isAdmin = profile?.role === 'admin';
const isModerator = ['admin', 'moderator'].includes(profile?.role || 'user');
```

#### Route Protection
```typescript
// Protect admin routes
if (!isAdmin) {
  redirect('/dashboard');
}
```

#### Conditional UI
```jsx
// Show admin features conditionally
{isAdmin && (
  <AdminPanel />
)}
```

## Authentication Navigation System

### Overview
The authentication system now supports tab-based navigation using URL query parameters to direct users to the appropriate auth form (login or signup).

### Implementation Details

#### Query Parameter System
- **`/auth?mode=login`** - Directs to login tab
- **`/auth?mode=signup`** - Directs to signup tab  
- **`/auth`** (no mode) - Defaults to login tab

#### Navigation Sources
1. **Landing Page**:
   - "Get Started Free" button → `/auth?mode=signup`
   - "Sign In" button → `/auth?mode=login`

2. **Forgot Password Page**:
   - "Back to sign in" link → `/auth?mode=login`

3. **Error Pages & Timeouts**:
   - All error redirects → `/auth?mode=login`

4. **Middleware Protection**:
   - Protected route access → `/auth?mode=login`

5. **Navbar**:
   - Sign In link → `/auth?mode=login`

6. **API Signout**:
   - Logout redirect → `/auth?mode=login`

#### Dynamic Tab Switching
- Users can switch between login/signup tabs within the form
- URL updates automatically without page refresh using `window.history.replaceState()`
- State management preserves form data during tab switches

#### Components Updated
- **AuthForm.tsx**: Added query parameter handling and tab state management
- **LandingPage.tsx**: Updated all auth links with appropriate modes
- **Navbar.tsx**: Updated auth link to use login mode
- **ForgotPasswordPage.tsx**: Updated return links to use login mode
- **AuthErrorBoundary.tsx**: Updated error redirect to use login mode
- **AuthTimeoutWrapper.tsx**: Updated timeout redirect to use login mode
- **middleware.ts**: Updated protected route redirect to use login mode

#### Benefits
- **Improved UX**: Users land on the correct form based on their intent
- **Context Preservation**: Users from "forgot password" get login form since they have an account
- **Consistent Flow**: All signup-related actions lead to signup form
- **URL State**: Current tab state is preserved in URL for bookmarking/sharing

#### Technical Implementation
```tsx
// Query parameter detection
useEffect(() => {
  const mode = searchParams.get('mode');
  if (mode === 'signup') {
    setIsLogin(false);
  } else if (mode === 'login') {
    setIsLogin(true);
  } else {
    setIsLogin(true); // Default to login
  }
}, [searchParams]);

// Tab switching with URL update
const handleTabSwitch = (loginMode: boolean) => {
  setIsLogin(loginMode);
  const newMode = loginMode ? 'login' : 'signup';
  const newUrl = `/auth?mode=${newMode}`;
  window.history.replaceState(null, '', newUrl);
};
```