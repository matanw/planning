# Environment Setup for Supabase

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
# Get these from https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Set to 'local' to use browser localStorage instead of Supabase
STORAGE_TYPE=supabase
```

## How to Get Supabase Credentials

1. Go to [Supabase](https://app.supabase.com) and sign up/login
2. Create a new project (or use existing one)
3. Go to Project Settings → API
4. Copy your Project URL and paste as `VITE_SUPABASE_URL`
5. Copy your `anon` `public` key and paste as `VITE_SUPABASE_ANON_KEY`
6. Set up the database schema (see next section)

## Database Setup

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the schema
supabase db push
```

## Running the Application

```bash
# Development mode (uses environment variables from .env)
bun dev

# Build for production
bun run build
```

## Current Storage Type

The app currently uses `localStorage` by default. To switch to Supabase:

1. Set up the environment variables as described above
2. Run the application
3. The app will automatically use Supabase if credentials are provided

