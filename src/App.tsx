import { useState, useEffect } from 'react';
import type { Task, TaskTreeNode, TaskFilters, TaskSortOptions } from './types/task';
import BrowserStorageService from './services/browserStorage';
import TaskTree from './components/TaskTree';
import TaskForm from './components/TaskForm';
import TaskFiltersComponent from './components/TaskFilters';
import ExportImport from './components/ExportImport';

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
  const [dbService, setDbService] = useState<BrowserStorageService | null>(null);
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
      const service = new BrowserStorageService();
      await service.connect();
      await service.initializeSchema();
      setDbService(service);
      setError(null);
    } catch (err) {
      console.error('Storage initialization failed:', err);
      setError('Failed to initialize browser storage.');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button
            onClick={initializeDatabase}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Personal Task Management
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => handleNewTask()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                New Task
              </button>
              <ExportImport dbService={dbService} onTasksUpdated={loadTasks} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <TaskFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              sortOptions={sortOptions}
              onSortChange={setSortOptions}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
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

      {/* Task Form Modal */}
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
