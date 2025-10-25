import React, { useState } from 'react';
import { Task, TaskTreeNode } from '../types/task';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { formatTextForDisplay, getTaskDirection } from '../utils/hebrew';
import { format } from 'date-fns';

interface TaskTreeProps {
  tasks: TaskTreeNode[];
  onTaskSelect: (task: Task) => void;
  onTaskUpdate: (id: number, data: Partial<Task>) => void;
  onTaskDelete: (id: number) => void;
  onNewSubtask: (parentId: number) => void;
}

const TaskTree: React.FC<TaskTreeProps> = ({
  tasks,
  onTaskSelect,
  onTaskUpdate,
  onTaskDelete,
  onNewSubtask
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const toggleExpanded = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-red-600';
    if (priority >= 2) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const isOverdue = (deadline?: Date) => {
    if (!deadline) return false;
    return new Date() > deadline;
  };

  const renderTaskNode = (node: TaskTreeNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const taskDirection = getTaskDirection(node);
    const titleDisplay = formatTextForDisplay(node.title);
    const descriptionDisplay = node.description ? formatTextForDisplay(node.description) : null;

    return (
      <div key={node.id} className="border-b border-gray-100 last:border-b-0">
        <div
          className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
            taskDirection === 'rtl' ? 'flex-row-reverse' : ''
          }`}
          style={{ paddingLeft: `${node.level * 24 + 16}px` }}
        >
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0 mr-2">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(node.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {/* Status Badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                {node.status.replace('_', ' ')}
              </span>

              {/* Priority Indicator */}
              {node.priority > 0 && (
                <span className={`text-sm font-medium ${getPriorityColor(node.priority)}`}>
                  {'!'.repeat(node.priority)}
                </span>
              )}

              {/* Title */}
              <h3
                className={`text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 ${
                  titleDisplay.className
                }`}
                style={titleDisplay.style}
                onClick={() => onTaskSelect(node)}
              >
                {titleDisplay.text}
              </h3>

              {/* Deadline */}
              {node.deadline && (
                <div className={`flex items-center text-xs ${
                  isOverdue(node.deadline) ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(node.deadline, 'MMM dd, yyyy')}
                </div>
              )}

              {/* Labels */}
              {node.labels.length > 0 && (
                <div className="flex items-center text-xs text-gray-500">
                  <Tag className="w-3 h-3 mr-1" />
                  {node.labels.slice(0, 2).join(', ')}
                  {node.labels.length > 2 && ` +${node.labels.length - 2}`}
                </div>
              )}
            </div>

            {/* Description Preview */}
            {descriptionDisplay && (
              <p
                className={`mt-1 text-xs text-gray-600 truncate ${
                  descriptionDisplay.className
                }`}
                style={descriptionDisplay.style}
              >
                {descriptionDisplay.text}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            <button
              onClick={() => onNewSubtask(node.id)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Add subtask"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onTaskSelect(node)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Edit task"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task and all its subtasks?')) {
                  onTaskDelete(node.id);
                }
              }}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTaskNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No tasks found. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tasks.map(node => renderTaskNode(node))}
    </div>
  );
};

export default TaskTree;
