# Personal Hierarchical Task Management System

A lightweight, hierarchical task management system for personal use with full Hebrew/RTL support. Focus on **long-term task management**: organizing goals, projects, and subtasks in a structured, clear manner.

## Features

### Core Functionality
- **Hierarchical Tasks**: Organize tasks in a tree structure (e.g., Education → Halacha → Meat & Milk Discussion → Finish source page TaaM Kaikar)
- **Task Management**: Create, edit, delete, and organize tasks with full CRUD operations
- **Status Tracking**: Track task status (Not Started, In Progress, Done)
- **Deadlines**: Set flexible deadlines for tasks
- **Labels**: Add custom labels to categorize tasks
- **Priority Levels**: Set priority from 0-5 scale

### Views & Navigation
- **Tree View**: Hierarchical display of tasks with expand/collapse functionality
- **Filtering**: Filter by status, labels, priority, deadline range, and search text
- **Sorting**: Sort by title, status, deadline, priority, or creation/update date

### Data Portability
- **Export**: Export tasks in JSON, CSV, or Markdown formats
- **Import**: Import tasks from JSON, CSV, or Markdown files
- **Migration Ready**: Designed for easy migration to hosted backend (Supabase) later

### Hebrew/RTL Support
- **Full RTL Support**: Proper right-to-left text handling
- **Hebrew Font**: Noto Sans Hebrew font integration
- **Automatic Detection**: Automatically detects Hebrew text and applies appropriate styling
- **Mixed Content**: Handles mixed Hebrew/English content properly

## Technical Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL (local for prototype)
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Markdown**: react-markdown

## Prerequisites

- **Node.js/Bun**: For running the application
- **PostgreSQL**: For the database
- **Git**: For version control

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd planning
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Set up the database**:
   ```bash
   ./setup-database.sh
   ```
   
   Or manually:
   ```bash
   # Install PostgreSQL (if not already installed)
   # macOS: brew install postgresql
   # Ubuntu: sudo apt-get install postgresql postgresql-contrib
   
   # Start PostgreSQL service
   # macOS: brew services start postgresql
   # Linux: sudo systemctl start postgresql
   
   # Create database and run schema
   createdb task_management
   psql -d task_management -f database/schema.sql
   ```

4. **Configure database connection** (if needed):
   Edit `src/App.tsx` and update the `dbConfig` object:
   ```typescript
   const dbConfig: DatabaseConfig = {
     host: 'localhost',
     port: 5432,
     database: 'task_management',
     user: 'postgres',
     password: 'password'
   };
   ```

5. **Start the development server**:
   ```bash
   bun dev
   ```

6. **Open your browser** and navigate to `http://localhost:5173`

## Usage

### Creating Tasks
1. Click "New Task" to create a root-level task
2. Fill in the task details (title, description, status, deadline, etc.)
3. Use the "Parent Task" dropdown to create subtasks
4. Add labels for better organization

### Managing Tasks
- **Edit**: Click the edit icon or task title to modify a task
- **Delete**: Click the trash icon to delete a task (and all its subtasks)
- **Add Subtask**: Click the plus icon to add a child task
- **Expand/Collapse**: Click the arrow icons to expand or collapse task branches

### Filtering and Sorting
- Use the filters sidebar to narrow down tasks by status, priority, or search text
- Sort tasks by different criteria using the sort options
- Clear all filters to see all tasks

### Export/Import
- **Export**: Click "Export" to download tasks in JSON, CSV, or Markdown format
- **Import**: Click "Import" to upload and import tasks from supported file formats
- Choose export options (include completed tasks, descriptions, labels)

## Database Schema

The system uses a single `tasks` table with the following structure:

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    deadline TIMESTAMP WITH TIME ZONE,
    parent_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    labels TEXT[] DEFAULT '{}',
    priority INTEGER DEFAULT 0
);
```

## Project Structure

```
planning/
├── src/
│   ├── components/          # React components
│   │   ├── TaskTree.tsx     # Hierarchical task display
│   │   ├── TaskForm.tsx     # Task creation/editing form
│   │   ├── TaskFilters.tsx  # Filtering and sorting
│   │   └── ExportImport.tsx # Data export/import
│   ├── services/            # Business logic
│   │   └── database.ts      # Database operations
│   ├── types/               # TypeScript definitions
│   │   └── task.ts          # Task-related types
│   ├── utils/               # Utility functions
│   │   └── hebrew.ts        # Hebrew/RTL utilities
│   └── App.tsx              # Main application component
├── database/
│   └── schema.sql           # Database schema
├── setup-database.sh        # Database setup script
└── README.md                # This file
```

## Hebrew/RTL Support

The system includes comprehensive Hebrew and RTL support:

- **Automatic Detection**: Detects Hebrew text and applies appropriate styling
- **Font Support**: Uses Noto Sans Hebrew font for proper Hebrew rendering
- **Direction Handling**: Automatically sets text direction (RTL/LTR)
- **Mixed Content**: Handles mixed Hebrew/English content properly
- **UI Adaptation**: Form fields and displays adapt to text direction

## Future Enhancements

- **Supabase Integration**: Migrate to hosted PostgreSQL backend
- **User Authentication**: Add user accounts and authentication
- **Collaboration**: Multi-user task sharing and collaboration
- **Mobile App**: React Native mobile application
- **Advanced Views**: Kanban board view, calendar view
- **Notifications**: Deadline reminders and task notifications
- **Templates**: Task templates for common workflows

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainer.