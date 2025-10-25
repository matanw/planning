// TypeScript interfaces and data models for the task management system

export type TaskStatus = 'not_started' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: Date;
  parent_id?: number;
  created_at: Date;
  updated_at: Date;
  labels: string[];
  priority: number; // 0-5 scale
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  deadline?: Date;
  parent_id?: number;
  labels?: string[];
  priority?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  deadline?: Date;
  parent_id?: number;
  labels?: string[];
  priority?: number;
}

export interface TaskTreeNode extends Task {
  children: TaskTreeNode[];
  level: number;
  isExpanded?: boolean;
}

export interface TaskFilters {
  status?: TaskStatus[];
  labels?: string[];
  priority?: number[];
  deadlineRange?: {
    start?: Date;
    end?: Date;
  };
  searchText?: string;
}

export interface TaskSortOptions {
  field: 'title' | 'status' | 'deadline' | 'priority' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'markdown';
  includeCompleted?: boolean;
  includeDescription?: boolean;
  includeLabels?: boolean;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

// Database connection configuration
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

// Utility types for Hebrew/RTL support
export interface HebrewTextOptions {
  isHebrew: boolean;
  direction: 'rtl' | 'ltr';
}

// Task statistics for dashboard
export interface TaskStats {
  total: number;
  notStarted: number;
  inProgress: number;
  done: number;
  overdue: number;
  dueSoon: number; // Due within 7 days
}
