// Supabase-based storage service
// This service uses Supabase as the backend database
import { createClient } from '@supabase/supabase-js';
import type { Task, CreateTaskData, UpdateTaskData, TaskFilters, TaskSortOptions } from '../types/task';
import type { SupabaseClient } from '@supabase/supabase-js';

interface SupabaseTask {
  id: number;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'done';
  deadline: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  labels: string[];
  priority: number;
}

class SupabaseStorageService {
  private supabase: SupabaseClient | null = null;

  async connect(): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Connected to Supabase');
  }

  async disconnect(): Promise<void> {
    // Supabase client doesn't need explicit disconnection
    this.supabase = null;
  }

  private fromSupabaseTask(supabaseTask: SupabaseTask): Task {
    return {
      id: supabaseTask.id,
      title: supabaseTask.title,
      description: supabaseTask.description || undefined,
      status: supabaseTask.status,
      deadline: supabaseTask.deadline ? new Date(supabaseTask.deadline) : undefined,
      parent_id: supabaseTask.parent_id || undefined,
      created_at: new Date(supabaseTask.created_at),
      updated_at: new Date(supabaseTask.updated_at),
      labels: supabaseTask.labels,
      priority: supabaseTask.priority
    };
  }

  async initializeSchema(): Promise<void> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    // Check if tasks exist
    const { data, error } = await this.supabase
      .from('tasks')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Error checking for existing tasks:', error);
      return;
    }

    // If no tasks exist, create sample data
    if (!data || data.length === 0) {
      const sampleTasks: SupabaseTask[] = [
        {
          id: 1,
          title: 'Education',
          description: 'Learning and educational goals',
          status: 'in_progress',
          deadline: null,
          parent_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          labels: ['learning', 'personal'],
          priority: 0
        },
        {
          id: 2,
          title: 'Halacha',
          description: 'Jewish law studies',
          status: 'not_started',
          deadline: null,
          parent_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          labels: ['religion', 'study'],
          priority: 0
        },
        {
          id: 3,
          title: 'Meat & Milk Discussion',
          description: 'Understanding the laws of mixing meat and milk',
          status: 'not_started',
          deadline: null,
          parent_id: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          labels: ['kashrut', 'halacha'],
          priority: 0
        },
        {
          id: 4,
          title: 'Finish source page TaaM Kaikar',
          description: 'Complete the source analysis for TaaM Kaikar',
          status: 'not_started',
          deadline: null,
          parent_id: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          labels: ['research', 'sources'],
          priority: 0
        },
        {
          id: 5,
          title: 'Finance',
          description: 'Financial planning and management',
          status: 'not_started',
          deadline: null,
          parent_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          labels: ['money', 'planning'],
          priority: 0
        },
        {
          id: 6,
          title: 'Social Security',
          description: 'Social security related tasks',
          status: 'not_started',
          deadline: null,
          parent_id: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          labels: ['government', 'benefits'],
          priority: 0
        },
        {
          id: 7,
          title: 'Check unemployment situation',
          description: 'Verify current unemployment status and benefits',
          status: 'not_started',
          deadline: null,
          parent_id: 6,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          labels: ['benefits', 'status'],
          priority: 0
        }
      ];

      const { error: insertError } = await this.supabase
        .from('tasks')
        .insert(sampleTasks);

      if (insertError) {
        console.error('Error inserting sample data:', insertError);
      } else {
        console.log('Initialized with sample data');
      }
    }
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    const now = new Date();
    const supabaseTask: Omit<SupabaseTask, 'id'> = {
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status || 'not_started',
      deadline: taskData.deadline ? taskData.deadline.toISOString() : null,
      parent_id: taskData.parent_id || null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      labels: taskData.labels || [],
      priority: taskData.priority || 0
    };

    const { data, error } = await this.supabase
      .from('tasks')
      .insert(supabaseTask)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return this.fromSupabaseTask(data);
  }

  async getTask(id: number): Promise<Task | null> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return this.fromSupabaseTask(data);
  }

  async updateTask(id: number, taskData: UpdateTaskData): Promise<Task | null> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    const updateData: Partial<SupabaseTask> = {
      updated_at: new Date().toISOString()
    };

    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description || null;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.deadline !== undefined) updateData.deadline = taskData.deadline ? taskData.deadline.toISOString() : null;
    if (taskData.parent_id !== undefined) updateData.parent_id = taskData.parent_id || null;
    if (taskData.labels !== undefined) updateData.labels = taskData.labels;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;

    const { data, error } = await this.supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return null;
    }

    return this.fromSupabaseTask(data);
  }

  async deleteTask(id: number): Promise<boolean> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    // Recursively delete task and all descendants
    const deleteTaskAndChildren = async (taskId: number): Promise<void> => {
      // Get children
      const { data: children } = await this.supabase!
        .from('tasks')
        .select('id')
        .eq('parent_id', taskId);

      if (children) {
        // Recursively delete children
        for (const child of children) {
          await deleteTaskAndChildren(child.id);
        }
      }

      // Delete the task itself
      await this.supabase!
        .from('tasks')
        .delete()
        .eq('id', taskId);
    };

    try {
      await deleteTaskAndChildren(id);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return data.map(task => this.fromSupabaseTask(task));
  }

  async getTasksWithFilters(filters: TaskFilters, sortOptions?: TaskSortOptions): Promise<Task[]> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    let query = this.supabase.from('tasks').select('*');

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters.deadlineRange) {
      if (filters.deadlineRange.start) {
        query = query.gte('deadline', filters.deadlineRange.start.toISOString());
      }
      if (filters.deadlineRange.end) {
        query = query.lte('deadline', filters.deadlineRange.end.toISOString());
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    let tasks = data.map(task => this.fromSupabaseTask(task));

    // Client-side filtering for labels and search text
    if (filters.labels && filters.labels.length > 0) {
      tasks = tasks.filter(task => 
        task.labels.some(label => filters.labels!.includes(label))
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (sortOptions) {
      tasks.sort((a, b) => {
        let aValue: any = a[sortOptions.field];
        let bValue: any = b[sortOptions.field];

        if (sortOptions.field === 'deadline' || sortOptions.field === 'created_at' || sortOptions.field === 'updated_at') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOptions.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return tasks;
  }

  async getRootTasks(): Promise<Task[]> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .is('parent_id', null);

    if (error) {
      throw new Error(`Failed to fetch root tasks: ${error.message}`);
    }

    return data.map(task => this.fromSupabaseTask(task));
  }

  async getChildTasks(parentId: number): Promise<Task[]> {
    if (!this.supabase) {
      throw new Error('Not connected to Supabase');
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('parent_id', parentId);

    if (error) {
      throw new Error(`Failed to fetch child tasks: ${error.message}`);
    }

    return data.map(task => this.fromSupabaseTask(task));
  }
}

export default SupabaseStorageService;

