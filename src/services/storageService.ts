// Storage service factory
// This file provides a unified interface that can work with either localStorage or Supabase

import BrowserStorageService from './browserStorage';
import SupabaseStorageService from './supabaseStorage';

// Define the interface that both storage services implement
export interface IStorageService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  createTask(taskData: any): Promise<any>;
  getTask(id: number): Promise<any>;
  updateTask(id: number, taskData: any): Promise<any>;
  deleteTask(id: number): Promise<boolean>;
  getAllTasks(): Promise<any[]>;
  getTasksWithFilters(filters: any, sortOptions?: any): Promise<any[]>;
  getRootTasks(): Promise<any[]>;
  getChildTasks(parentId: number): Promise<any[]>;
  initializeSchema(): Promise<void>;
}

// Create and return the appropriate storage service
export function createStorageService(): IStorageService {
  const storageType = import.meta.env.VITE_STORAGE_TYPE || 'local';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Use Supabase if configured and storage type is supabase
  if (storageType === 'supabase' && supabaseUrl && supabaseKey) {
    console.log('Using Supabase storage');
    return new SupabaseStorageService();
  }

  // Fall back to localStorage
  console.log('Using browser localStorage');
  return new BrowserStorageService();
}

export default createStorageService;

