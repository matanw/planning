import React, { useState } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import DatabaseService from '../services/database';
import { ExportOptions, ImportResult, Task } from '../types/task';

interface ExportImportProps {
  dbService: DatabaseService | null;
  onTasksUpdated: () => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ dbService, onTasksUpdated }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeCompleted: true,
    includeDescription: true,
    includeLabels: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const exportTasks = async () => {
    if (!dbService) return;

    setIsExporting(true);
    try {
      const tasks = await dbService.getAllTasks();
      const filteredTasks = exportOptions.includeCompleted 
        ? tasks 
        : tasks.filter(task => task.status !== 'done');

      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportOptions.format) {
        case 'json':
          content = JSON.stringify(filteredTasks, null, 2);
          filename = `tasks-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          content = convertToCSV(filteredTasks);
          filename = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;

        case 'markdown':
          content = convertToMarkdown(filteredTasks);
          filename = `tasks-${new Date().toISOString().split('T')[0]}.md`;
          mimeType = 'text/markdown';
          break;

        default:
          throw new Error('Unsupported export format');
      }

      downloadFile(content, filename, mimeType);
      setIsExportOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const importTasks = async (file: File) => {
    if (!dbService) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      let tasks: Task[];

      // Determine format based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      switch (extension) {
        case 'json':
          tasks = JSON.parse(content);
          break;
        case 'csv':
          tasks = parseCSV(content);
          break;
        case 'md':
          tasks = parseMarkdown(content);
          break;
        default:
          throw new Error('Unsupported file format');
      }

      // Validate tasks
      const validTasks = tasks.filter(task => 
        task.title && 
        typeof task.title === 'string' &&
        ['not_started', 'in_progress', 'done'].includes(task.status)
      );

      // Import valid tasks
      let importedCount = 0;
      const errors: string[] = [];

      for (const task of validTasks) {
        try {
          await dbService.createTask({
            title: task.title,
            description: task.description,
            status: task.status,
            deadline: task.deadline ? new Date(task.deadline) : undefined,
            parent_id: task.parent_id,
            labels: task.labels || [],
            priority: task.priority || 0
          });
          importedCount++;
        } catch (error) {
          errors.push(`Failed to import task "${task.title}": ${error}`);
        }
      }

      setImportResult({
        success: true,
        importedCount,
        errors
      });

      if (importedCount > 0) {
        onTasksUpdated();
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        importedCount: 0,
        errors: [`Import failed: ${error}`]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const convertToCSV = (tasks: Task[]): string => {
    const headers = ['Title', 'Description', 'Status', 'Deadline', 'Parent ID', 'Labels', 'Priority'];
    const rows = tasks.map(task => [
      task.title,
      task.description || '',
      task.status,
      task.deadline ? task.deadline.toISOString() : '',
      task.parent_id || '',
      task.labels.join(';'),
      task.priority
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const convertToMarkdown = (tasks: Task[]): string => {
    let content = `# Task Export\n\nGenerated on: ${new Date().toLocaleString()}\n\n`;
    
    const rootTasks = tasks.filter(task => !task.parent_id);
    
    const formatTask = (task: Task, level: number = 0): string => {
      const indent = '  '.repeat(level);
      const statusEmoji = {
        'not_started': '⏳',
        'in_progress': '🔄',
        'done': '✅'
      }[task.status];
      
      let taskText = `${indent}- ${statusEmoji} **${task.title}**`;
      
      if (exportOptions.includeDescription && task.description) {
        taskText += `\n${indent}  ${task.description}`;
      }
      
      if (exportOptions.includeLabels && task.labels.length > 0) {
        taskText += `\n${indent}  *Labels: ${task.labels.join(', ')}*`;
      }
      
      if (task.deadline) {
        taskText += `\n${indent}  *Deadline: ${task.deadline.toLocaleDateString()}*`;
      }
      
      taskText += '\n';
      
      // Add children
      const children = tasks.filter(t => t.parent_id === task.id);
      children.forEach(child => {
        taskText += formatTask(child, level + 1);
      });
      
      return taskText;
    };
    
    rootTasks.forEach(task => {
      content += formatTask(task);
    });
    
    return content;
  };

  const parseCSV = (content: string): Task[] => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const tasks: Task[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
        const task: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          switch (header.toLowerCase()) {
            case 'title':
              task.title = value;
              break;
            case 'description':
              task.description = value;
              break;
            case 'status':
              task.status = value;
              break;
            case 'deadline':
              task.deadline = value ? new Date(value) : undefined;
              break;
            case 'parent id':
              task.parent_id = value ? parseInt(value) : undefined;
              break;
            case 'labels':
              task.labels = value ? value.split(';') : [];
              break;
            case 'priority':
              task.priority = parseInt(value) || 0;
              break;
          }
        });
        
        if (task.title) {
          tasks.push(task);
        }
      }
    }
    
    return tasks;
  };

  const parseMarkdown = (content: string): Task[] => {
    // Simple markdown parser for task lists
    const lines = content.split('\n');
    const tasks: Task[] = [];
    const taskStack: { task: Task; level: number }[] = [];
    
    lines.forEach(line => {
      const match = line.match(/^(\s*)- (.+)$/);
      if (match) {
        const [, indent, content] = match;
        const level = indent.length / 2;
        
        // Extract status emoji and title
        const statusMatch = content.match(/^(⏳|🔄|✅)\s*\*\*(.+?)\*\*/);
        if (statusMatch) {
          const [, emoji, title] = statusMatch;
          const status = emoji === '⏳' ? 'not_started' : 
                       emoji === '🔄' ? 'in_progress' : 'done';
          
          const task: Task = {
            id: 0, // Will be set by database
            title,
            description: '',
            status: status as any,
            deadline: undefined,
            parent_id: undefined,
            created_at: new Date(),
            updated_at: new Date(),
            labels: [],
            priority: 0
          };
          
          // Find parent based on level
          while (taskStack.length > 0 && taskStack[taskStack.length - 1].level >= level) {
            taskStack.pop();
          }
          
          if (taskStack.length > 0) {
            task.parent_id = taskStack[taskStack.length - 1].task.id;
          }
          
          taskStack.push({ task, level });
          tasks.push(task);
        }
      }
    });
    
    return tasks;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <button
          onClick={() => setIsExportOpen(true)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </button>
        <button
          onClick={() => setIsImportOpen(true)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Upload className="w-4 h-4 mr-1" />
          Import
        </button>
      </div>

      {/* Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Export Tasks</h2>
              <button
                onClick={() => setIsExportOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'json', label: 'JSON', icon: FileCode },
                    { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
                    { value: 'markdown', label: 'Markdown', icon: FileText }
                  ].map(({ value, label, icon: Icon }) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        value={value}
                        checked={exportOptions.format === value}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                        className="mr-2"
                      />
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCompleted}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCompleted: e.target.checked }))}
                    className="mr-2"
                  />
                  Include completed tasks
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDescription}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeDescription: e.target.checked }))}
                    className="mr-2"
                  />
                  Include descriptions
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeLabels}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeLabels: e.target.checked }))}
                    className="mr-2"
                  />
                  Include labels
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsExportOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={exportTasks}
                  disabled={isExporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Import Tasks</h2>
              <button
                onClick={() => {
                  setIsImportOpen(false);
                  setImportResult(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".json,.csv,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      importTasks(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {importResult && (
                <div className={`p-4 rounded-md ${
                  importResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className="font-medium">
                    {importResult.success ? 'Import Successful' : 'Import Failed'}
                  </div>
                  <div className="text-sm mt-1">
                    Imported {importResult.importedCount} tasks
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="text-sm mt-2">
                      <div className="font-medium">Errors:</div>
                      <ul className="list-disc list-inside">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setIsImportOpen(false);
                    setImportResult(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportImport;
