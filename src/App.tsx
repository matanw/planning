import { useState, useEffect } from 'react';
import type { Task, TaskTreeNode, TaskFilters, TaskSortOptions } from './types/task';
import { createStorageService, type IStorageService } from './services/storageService';
import TaskTree from './components/TaskTree';
import TaskForm from './components/TaskForm';
import TaskFiltersComponent from './components/TaskFilters';
import ExportImport from './components/ExportImport';
import DataManagement from './components/DataManagement';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTree, setTaskTree] = useState<TaskTreeNode[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortOptions, setSortOptions] = useState<TaskSortOptions>({
    field: 'created_at',
    direction: 'desc'
  });
  const [dbService, setDbService] = useState<IStorageService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Using browser storage - no database configuration needed

  useEffect(() => {
    initializeDatabase();
  }, []);

  useEffect(() => {
    if (dbService) {
      loadTasks();
    }
  }, [dbService, filters, sortOptions]);

  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      const service = createStorageService();
      await service.connect();
      await service.initializeSchema();
      setDbService(service);
      setError(null);
    } catch (err) {
      console.error('Storage initialization failed:', err);
      setError('Failed to initialize storage.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!dbService) return;

    try {
      const loadedTasks = await dbService.getTasksWithFilters(filters, sortOptions);
      setTasks(loadedTasks);
      buildTaskTree(loadedTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks');
    }
  };

  const buildTaskTree = (taskList: Task[]) => {
    const taskMap = new Map<number, TaskTreeNode>();
    const rootTasks: TaskTreeNode[] = [];

    // Create tree nodes
    taskList.forEach(task => {
      taskMap.set(task.id, {
        ...task,
        children: [],
        level: 0,
        isExpanded: true
      });
    });

    // Build hierarchy
    taskList.forEach(task => {
      const node = taskMap.get(task.id)!;
      if (task.parent_id) {
        const parent = taskMap.get(task.parent_id);
        if (parent) {
          parent.children.push(node);
          node.level = parent.level + 1;
        }
      } else {
        rootTasks.push(node);
      }
    });

    setTaskTree(rootTasks);
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!dbService) return;

    try {
      await dbService.createTask(taskData);
      await loadTasks();
      setIsFormOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (id: number, taskData: Partial<Task>) => {
    if (!dbService) return;

    try {
      await dbService.updateTask(id, taskData);
      await loadTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!dbService) return;

    try {
      await dbService.deleteTask(id);
      await loadTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const handleClearAllData = () => {
    // Clear all tasks from localStorage
    localStorage.removeItem('task_management_tasks');
    // Reload tasks (will show empty state)
    loadTasks();
  };

  const handleConfigureSupabase = () => {
    // This triggers the DataManagement component to open modal
    // The actual saving happens in the DataManagement component
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mx-auto mb-4 animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mx-auto blur-lg opacity-30"></div>
          </div>
          <h2 className="text-xl font-bold gradient-text mb-2">Personal Task Manager</h2>
          <p className="text-gray-600">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="bg-white/80 backdrop-blur-lg border border-red-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={initializeDatabase}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header */}
      <header className="glass-effect border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold gradient-text">
                          Personal Task Manager
                        </h1>
                        <p className="text-xs text-gray-600">Organize your goals, one task at a time</p>
                      </div>
                    </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleNewTask()}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Task</span>
              </button>
              <ExportImport dbService={dbService} onTasksUpdated={loadTasks} />
              <DataManagement
                onClearAllData={handleClearAllData}
                onConfigureSupabase={handleConfigureSupabase}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Modern Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TaskFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
                sortOptions={sortOptions}
                onSortChange={setSortOptions}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="card card-hover animate-fade-in">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>{tasks.length} tasks</span>
                        </div>
                </div>
              </div>
              <TaskTree
                tasks={taskTree}
                onTaskSelect={handleTaskSelect}
                onTaskDelete={handleDeleteTask}
                onNewSubtask={handleNewTask}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Task Form Modal */}
      {isFormOpen && (
        <TaskForm
          task={selectedTask}
          onSave={selectedTask ? 
            (data) => handleUpdateTask(selectedTask.id, data) : 
            handleCreateTask
          }
          onClose={() => {
            setIsFormOpen(false);
            setSelectedTask(null);
          }}
          allTasks={tasks}
        />
      )}
    </div>
  );
}

export default App
