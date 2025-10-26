# Migration Guide: localStorage → Supabase

This guide explains how to migrate your task management app from browser localStorage to Supabase.

## 📋 Overview

The app now supports **both** localStorage and Supabase as storage backends. This allows you to:

- **Start with localStorage** (no setup required)
- **Migrate to Supabase** when you need cloud sync and scalability
- **Switch between them** via environment variables

## 🚀 Quick Start

### Option 1: Continue Using localStorage (Default)

Nothing to do! The app works with localStorage by default.

### Option 2: Switch to Supabase

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create an account and a new project
   - Wait for the database to be ready (1-2 minutes)

2. **Get your credentials**
   - Project Settings → API
   - Copy your **Project URL** and **anon key**

3. **Set up environment variables**
   ```bash
   # Create .env file in project root
   echo "VITE_SUPABASE_URL=your-project-url" > .env
   echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env
   echo "VITE_STORAGE_TYPE=supabase" >> .env
   ```

4. **Set up database schema**
   - Go to Supabase SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Run it

5. **Run the app**
   ```bash
   bun dev
   ```

The app will now use Supabase instead of localStorage!

## 📦 Migrating Existing Data

If you have tasks in localStorage and want to move them to Supabase:

### Method 1: Using Export/Import (Manual)

1. Open your app (still using localStorage)
2. Click **Export** → Choose JSON format
3. Save the file
4. Switch to Supabase (update `.env` as above)
5. Click **Import** → Select your JSON file

### Method 2: Using Browser Console (Automated)

1. Open browser DevTools (F12)
2. Copy and run this in the Console:

```javascript
// Get data from localStorage
const stored = localStorage.getItem('task_management_tasks');
const tasks = JSON.parse(stored || '[]');
console.log(`Found ${tasks.length} tasks`);
```

3. Copy the tasks array
4. Switch to Supabase
5. In the Console, run:

```javascript
// This will be available in Supabase version
// For now, use the Export/Import feature
```

## 🔄 How Storage Selection Works

The app automatically selects the storage backend based on:

1. **Environment variable**: `VITE_STORAGE_TYPE`
2. **Supabase credentials**: If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. **Default**: Falls back to localStorage

### Code Logic

```typescript
// In src/services/storageService.ts
export function createStorageService(): IStorageService {
  const storageType = import.meta.env.VITE_STORAGE_TYPE || 'local';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (storageType === 'supabase' && supabaseUrl) {
    return new SupabaseStorageService();
  }
  
  return new BrowserStorageService(); // Default to localStorage
}
```

## 🏗️ Architecture

### File Structure

```
src/services/
├── browserStorage.ts      # localStorage implementation
├── supabaseStorage.ts     # Supabase implementation
└── storageService.ts      # Factory that selects implementation

src/
├── App.tsx                 # Uses storageService factory
└── components/
    └── ExportImport.tsx    # Works with any storage type
```

### Interface Contract

Both storage services implement the same interface:

```typescript
interface IStorageService {
  connect(): Promise<void>;
  createTask(taskData): Promise<Task>;
  updateTask(id, taskData): Promise<Task>;
  deleteTask(id): Promise<boolean>;
  getTasksWithFilters(filters, sort): Promise<Task[]>;
  // ... etc
}
```

## 🔐 Security

### For localStorage (Current)
- ✅ Data stays in browser
- ✅ No server needed
- ⚠️ No sync across devices

### For Supabase
- ✅ Cloud sync
- ✅ Backup and reliability
- ⚠️ Currently uses anonymous access
- 💡 **Future**: Add user authentication for multi-user support

### Adding Authentication (Future Enhancement)

1. Enable Supabase Auth in dashboard
2. Update `supabase/schema.sql` with RLS policies for authenticated users
3. Add login UI to the app
4. Data is then tied to user accounts

## 🚀 Deployment

### Development

```bash
# .env file
VITE_STORAGE_TYPE=local        # Use localStorage
# OR
VITE_STORAGE_TYPE=supabase    # Use Supabase (requires credentials)
```

### Production (GitHub Pages)

Add environment variables in GitHub repository settings:

1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STORAGE_TYPE` (set to `supabase` or `local`)

Update `.github/workflows/deploy.yml` to use these secrets.

## 🧪 Testing

```bash
# Test with localStorage
bun dev

# Test with Supabase (after setting .env)
VITE_STORAGE_TYPE=supabase bun dev
```

## 📊 Database Schema

The Supabase schema (`supabase/schema.sql`) includes:

- **tasks table** with all task fields
- **Indexes** for performance
- **Cascade delete** for task hierarchies
- **Auto-update timestamps** via triggers
- **Row Level Security (RLS)** enabled

## 🎯 Next Steps

1. ✅ App now supports both storage types
2. ✅ Migrate to Supabase when ready
3. 🔄 Add user authentication
4. 🔄 Add real-time sync (Supabase realtime)
5. 🔄 Add collaboration features

## ❓ FAQ

**Q: Can I use both localStorage and Supabase at the same time?**  
A: No, you select one backend via environment variables.

**Q: Will I lose data when switching?**  
A: Export first, then import after switching.

**Q: Can I use Supabase without internet?**  
A: No, Supabase requires internet. Use localStorage for offline-first.

**Q: Is Supabase free?**  
A: Yes, up to 500MB database and 50,000 monthly active users.

**Q: How do I backup my data?**  
A: Use the Export feature to download JSON. For Supabase, it's automatically backed up.

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists with correct values
- Restart dev server after changing `.env`

### "Connection failed"
- Check Supabase project status in dashboard
- Verify URL and anon key are correct

### "Authentication required"
- Update RLS policies in Supabase dashboard
- Or add authentication to the app

### Data not syncing
- Clear browser cache
- Check Supabase dashboard for errors
- Verify RLS policies allow access

