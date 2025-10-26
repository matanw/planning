// Browser-compatible storage service using localStorage
// This replaces the PostgreSQL service for client-side usage
import type { Task, CreateTaskData, UpdateTaskData, TaskFilters, TaskSortOptions } from '../types/task';

class BrowserStorageService {
  private storageKey = 'task_management_tasks';

  async connect(): Promise<void> {
    // No connection needed for localStorage
    console.log('Connected to browser storage');
  }

  async disconnect(): Promise<void> {
    // No disconnection needed for localStorage
  }

  private getTasks(): Task[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    
    try {
      const tasks = JSON.parse(stored);
      // Convert date strings back to Date objects
      return tasks.map((task: any) => ({
        ...task,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at)
      }));
    } catch (error) {
      console.error('Error parsing stored tasks:', error);
      return [];
    }
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    console.log('browserStorage.createTask called with:', taskData);
    const tasks = this.getTasks();
    const newTask: Task = {
      id: Date.now(), // Simple ID generation
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'not_started',
      deadline: taskData.deadline,
      parent_id: taskData.parent_id,
      created_at: new Date(),
      updated_at: new Date(),
      labels: taskData.labels || [],
      priority: taskData.priority || 0
    };

    console.log('Created new task:', newTask);
    tasks.push(newTask);
    this.saveTasks(tasks);
    console.log('Saved tasks, total count:', tasks.length);
    return newTask;
  }

  async getTask(id: number): Promise<Task | null> {
    const tasks = this.getTasks();
    return tasks.find(task => task.id === id) || null;
  }

  async updateTask(id: number, taskData: UpdateTaskData): Promise<Task | null> {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return null;

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...taskData,
      updated_at: new Date()
    };

    this.saveTasks(tasks);
    return tasks[taskIndex];
  }

  async deleteTask(id: number): Promise<boolean> {
    const tasks = this.getTasks();
    const initialLength = tasks.length;
    
    // Remove task and all its descendants
    const removeTaskAndDescendants = (taskId: number) => {
      const toRemove = tasks.filter(task => task.id === taskId);
      toRemove.forEach(task => {
        const index = tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          tasks.splice(index, 1);
        }
        // Recursively remove children
        const children = tasks.filter(t => t.parent_id === taskId);
        children.forEach(child => removeTaskAndDescendants(child.id));
      });
    };

    removeTaskAndDescendants(id);
    this.saveTasks(tasks);
    return tasks.length < initialLength;
  }

  async getAllTasks(): Promise<Task[]> {
    return this.getTasks();
  }

  async getTasksWithFilters(filters: TaskFilters, sortOptions?: TaskSortOptions): Promise<Task[]> {
    let tasks = this.getTasks();

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      tasks = tasks.filter(task => filters.status!.includes(task.status));
    }

    if (filters.labels && filters.labels.length > 0) {
      tasks = tasks.filter(task => 
        task.labels.some(label => filters.labels!.includes(label))
      );
    }

    if (filters.priority && filters.priority.length > 0) {
      tasks = tasks.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.deadlineRange) {
      if (filters.deadlineRange.start) {
        tasks = tasks.filter(task => 
          task.deadline && task.deadline >= filters.deadlineRange!.start!
        );
      }
      if (filters.deadlineRange.end) {
        tasks = tasks.filter(task => 
          task.deadline && task.deadline <= filters.deadlineRange!.end!
        );
      }
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
    const tasks = this.getTasks();
    return tasks.filter(task => !task.parent_id);
  }

  async getChildTasks(parentId: number): Promise<Task[]> {
    const tasks = this.getTasks();
    return tasks.filter(task => task.parent_id === parentId);
  }

  async initializeSchema(): Promise<void> {
    // Initialize with sample data if no tasks exist
    const tasks = this.getTasks();
    if (tasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: 1,
          title: 'Education',
          description: 'Learning and educational goals',
          status: 'in_progress',
          deadline: undefined,
          parent_id: undefined,
          created_at: new Date(),
          updated_at: new Date(),
          labels: ['learning', 'personal'],
          priority: 0
        },
        {
          id: 2,
          title: 'Halacha',
          description: 'Jewish law studies',
          status: 'not_started',
          deadline: undefined,
          parent_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          labels: ['religion', 'study'],
          priority: 0
        },
        {
          id: 3,
          title: 'Meat & Milk Discussion',
          description: 'Understanding the laws of mixing meat and milk',
          status: 'not_started',
          deadline: undefined,
          parent_id: 2,
          created_at: new Date(),
          updated_at: new Date(),
          labels: ['kashrut', 'halacha'],
          priority: 0
        },
        {
          id: 4,
          title: 'Finish source page TaaM Kaikar',
          description: 'Complete the source analysis for TaaM Kaikar',
          status: 'not_started',
          deadline: undefined,
          parent_id: 3,
          created_at: new Date(),
          updated_at: new Date(),
          labels: ['research', 'sources'],
          priority: 0
        },
        {
          id: 5,
          title: 'Finance',
          description: 'Financial planning and management',
          status: 'not_started',
          deadline: undefined,
          parent_id: undefined,
          created_at: new Date(),
          updated_at: new Date(),
          labels: ['money', 'planning'],
          priority: 0
        },
        {
          id: 6,
          title: 'Social Security',
          description: 'Social security related tasks',
          status: 'not_started',
          deadline: undefined,
          parent_id: 5,
          created_at: new Date(),
          updated_at: new Date(),
          labels: ['government', 'benefits'],
          priority: 0
        },
        {
          id: 7,
          title: 'Check unemployment situation',
          description: 'Verify current unemployment status and benefits',
          status: 'not_started',
          deadline: undefined,
          parent_id: 6,
          created_at: new Date(),
          updated_at: new Date(),
          labels: ['benefits', 'status'],
          priority: 0
        }
      ];

      this.saveTasks(sampleTasks);
      console.log('Initialized with sample data');
    }
  }
}

export default BrowserStorageService;
