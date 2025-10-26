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
  // Check for Supabase credentials in localStorage first
  const localStorageUrl = localStorage.getItem('supabase_config_url');
  const localStorageKey = localStorage.getItem('supabase_config_key');
  
  // Then check environment variables
  const storageType = import.meta.env.VITE_STORAGE_TYPE || 'local';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorageUrl;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorageKey;

  // Use Supabase if configured (either via env or localStorage)
  if (storageType === 'supabase' && supabaseUrl && supabaseKey) {
    console.log('Using Supabase storage');
    return new SupabaseStorageService(supabaseUrl, supabaseKey);
  }

  // Fall back to localStorage
  console.log('Using browser localStorage');
  return new BrowserStorageService();
}

export default createStorageService;

