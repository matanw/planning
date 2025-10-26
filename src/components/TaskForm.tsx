import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '../types/task';
import { X, Calendar, Tag, FileText } from 'lucide-react';
import { analyzeText } from '../utils/hebrew';
import { format } from 'date-fns';

interface TaskFormProps {
  task?: Task | null;
  onSave: (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
  allTasks: Task[];
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onClose, allTasks }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'not_started' as TaskStatus,
    deadline: '',
    parent_id: undefined as number | undefined,
    labels: [] as string[],
    priority: 0
  });
  const [newLabel, setNewLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        deadline: task.deadline ? format(task.deadline, 'yyyy-MM-dd') : '',
        parent_id: task.parent_id,
        labels: task.labels || [],
        priority: task.priority || 0
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        parent_id: formData.parent_id || undefined
      };
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel();
    }
  };

  // Get available parent tasks (exclude current task and its descendants)
  const getAvailableParents = () => {
    if (!task) return allTasks.filter(t => !t.parent_id);
    
    // Exclude current task and its descendants
    const excludeIds = new Set([task.id]);
    const addDescendants = (parentId: number) => {
      allTasks.forEach(t => {
        if (t.parent_id === parentId) {
          excludeIds.add(t.id);
          addDescendants(t.id);
        }
      });
    };
    addDescendants(task.id);
    
    return allTasks.filter(t => !excludeIds.has(t.id) && !t.parent_id);
  };

  const titleAnalysis = analyzeText(formData.title);
  const descriptionAnalysis = formData.description ? analyzeText(formData.description) : null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {task ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <p className="text-xs text-gray-600">
                      {task ? 'Update your task details' : 'Add a new task to your list'}
                    </p>
                  </div>
                </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Title */}
          <div className="form-group">
                    <label className="form-label">
                      Title *
                    </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`form-input ${
                titleAnalysis.direction === 'rtl' ? 'text-right' : 'text-left'
              }`}
              style={{ direction: titleAnalysis.direction }}
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
                    <label className="form-label">
                      Description
                    </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`form-textarea ${
                descriptionAnalysis?.direction === 'rtl' ? 'text-right' : 'text-left'
              }`}
              style={{ direction: descriptionAnalysis?.direction || 'ltr' }}
              placeholder="Enter task description..."
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-6">
            <div className="form-group">
                      <label className="form-label">
                        Status
                      </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                className="form-select"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
                      <label className="form-label">
                        Priority
                      </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="form-select"
              >
                <option value={0}>None</option>
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
                <option value={4}>Very High</option>
                <option value={5}>Critical</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div className="form-group">
                    <label className="form-label">
                      Deadline
                    </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="form-input"
            />
          </div>

          {/* Parent Task */}
          <div className="form-group">
                    <label className="form-label">
                      Parent Task
                    </label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                parent_id: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              className="form-select"
            >
              <option value="">No parent (root task)</option>
              {getAvailableParents().map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.title}
                </option>
              ))}
            </select>
          </div>

          {/* Labels */}
          <div className="form-group">
                    <label className="form-label">
                      Labels
                    </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.labels.map((label, index) => (
                <span
                  key={index}
                  className="badge badge-info"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(label)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-3">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={handleKeyPress}
                className="form-input flex-1"
                placeholder="Add a label..."
              />
              <button
                type="button"
                onClick={handleAddLabel}
                className="btn-primary"
              >
                Add
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
