# Recipe Hub

A web application for creating, organizing, and discovering recipes. Users can add
recipes with ingredients, instructions, and tags, group them into collections, and
search and filter their library.

## Overview

Recipe Hub is a full-stack web application built with Next.js (App Router) and a
Supabase (PostgreSQL) backend. It provides recipe CRUD with a rich text editor for
instructions, a tagging system, recipe collections, search/filtering, and a
role-based access system (`user`, `moderator`, `admin`). HTML in recipe content is
sanitized with DOMPurify to prevent XSS.

For the full product vision and aspirational roadmap, see [docs/PROJECT.md](./docs/PROJECT.md).

## Tech Stack

- **Next.js 15** (App Router) with **React 18**
- **TypeScript**
- **Tailwind CSS** with **shadcn/ui** (Radix UI) components
- **Supabase** (PostgreSQL database + authentication)
- **Zod** for schema validation
- **Tiptap** rich text editor
- **Jest** + **Testing Library** for tests
- **ESLint** for linting

> Note: the `package.json` `name` field is currently `"client"`. The app pins
> `next@15.1.11` and `react@^18.3.1`.

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (URL + anon key)

### Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the project root with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   See [docs/TECHNICAL.md](./docs/TECHNICAL.md#environment-variables) for the full
   list of supported environment variables and database setup instructions.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server (standard, recommended). |
| `npm run dev:turbo` | Start the dev server with Turbopack (faster, but see [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)). |
| `npm run build` | Create a production build. |
| `npm run start` | Run the production server (after `npm run build`). |
| `npm run lint` | Run ESLint. |
| `npm test` | Run the curated test suite (115 passing tests). |
| `npm run test:all` | Run the full Jest suite (has known failures — see [docs/TESTING.md](./docs/TESTING.md)). |
| `npm run test:coverage` | Run the curated suite with a coverage report. |

## Documentation

Deeper documentation lives in the [`docs/`](./docs) directory:

- [docs/PROJECT.md](./docs/PROJECT.md) — Product overview, feature set, and roadmap.
- [docs/TECHNICAL.md](./docs/TECHNICAL.md) — Database schema, API endpoints, types, environment variables, and deployment.
- [docs/ROLE_SYSTEM.md](./docs/ROLE_SYSTEM.md) — User role/permission system implementation.
- [docs/TASKS.md](./docs/TASKS.md) — Active task backlog and progress tracking.
- [docs/TESTING.md](./docs/TESTING.md) — Test framework, suites, and how to run tests.
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) — Common development issues and fixes.
- [docs/html-sanitization.md](./docs/html-sanitization.md) — HTML sanitization helpers and policy.
