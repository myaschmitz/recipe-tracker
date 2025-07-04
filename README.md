# Recipe Hub
This is an application where users can keep track of recipes.

## Features

### Recipe Management
- Add recipes with ingredients, instructions, and metadata
- Edit and update existing recipes
- Organize recipes with tags and categories
- Search and filter recipes by various criteria

### Collections & Organization
- Create custom recipe collections ("albums")
- Favorite recipes for quick access
- Tag-based organization system
- Smart categorization and filtering

### User Experience
- **Smart Authentication Navigation**: Landing page buttons and navigation links automatically direct users to the appropriate login or signup form
- Modern, responsive UI with dark/light mode support
- Profile management with dietary restrictions and preferences
- Rich text editing for recipe instructions

### Technical Highlights
- Built with **Next.js 15** and **TypeScript**
- **Supabase** backend with PostgreSQL
- Comprehensive error handling and validation
- Zod schema validation throughout
- Extensive test coverage
- Cache management and performance optimization

## Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`
5. Navigate to `http://localhost:3000`

## Authentication Flow
- **Sign Up**: Click "Get Started Free" from the landing page
- **Sign In**: Click "Sign In" button or navigate to `/auth?mode=login`
- **Password Reset**: Access from login form, returns to login after reset
- **Auto-redirect**: Protected pages automatically redirect to appropriate auth form

See [TECHNICAL.md](./TECHNICAL.md) for detailed technical documentation.