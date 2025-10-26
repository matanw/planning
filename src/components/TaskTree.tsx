import React, { useState } from 'react';
import type { Task, TaskTreeNode } from '../types/task';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, Calendar, Tag } from 'lucide-react';
import { formatTextForDisplay, getTaskDirection } from '../utils/hebrew';
import { format } from 'date-fns';

interface TaskTreeProps {
  tasks: TaskTreeNode[];
  onTaskSelect: (task: Task) => void;
  onTaskDelete: (id: number) => void;
  onNewSubtask: (parentId: number) => void;
}

const TaskTree: React.FC<TaskTreeProps> = ({
  tasks,
  onTaskSelect,
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
      <div key={node.id} className="task-node animate-fade-in">
        <div
          className={`flex items-center p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 ${
            taskDirection === 'rtl' ? 'flex-row-reverse' : ''
          }`}
          style={{ paddingLeft: `${node.level * 32 + 24}px` }}
        >
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0 mr-3">
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(node.id)}
                className="w-6 h-6 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-blue-600" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-blue-600" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              {/* Priority Indicator */}
              {node.priority > 0 && (
                <div className={`priority-indicator priority-${node.priority}`}>
                  {node.priority}
                </div>
              )}

              {/* Title */}
              <h3
                className={`text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors duration-200 ${
                  titleDisplay.className
                }`}
                style={titleDisplay.style}
                onClick={() => onTaskSelect(node)}
              >
                {titleDisplay.text}
              </h3>

              {/* Status Badge */}
              <span className={`status-indicator ${
                node.status === 'done' ? 'status-done' :
                node.status === 'in_progress' ? 'status-in-progress' :
                'status-not-started'
              }`}>
                {node.status === 'done' && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                {node.status === 'in_progress' && <div className="w-3 h-3 mr-1 bg-blue-600 rounded-full animate-pulse"></div>}
                {node.status === 'not_started' && <div className="w-3 h-3 mr-1 bg-gray-400 rounded-full"></div>}
                {node.status.replace('_', ' ')}
              </span>
            </div>

            {/* Description Preview */}
            {descriptionDisplay && (
              <p
                className={`text-sm text-gray-600 mb-3 ${
                  descriptionDisplay.className
                }`}
                style={descriptionDisplay.style}
              >
                {descriptionDisplay.text}
              </p>
            )}

            {/* Metadata Row */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {/* Deadline */}
              {node.deadline && (
                <div className={`flex items-center ${
                  isOverdue(node.deadline) ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(node.deadline, 'MMM dd, yyyy')}
                  {isOverdue(node.deadline) && (
                    <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                      Overdue
                    </span>
                  )}
                </div>
              )}

              {/* Labels */}
              {node.labels.length > 0 && (
                <div className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  <div className="flex space-x-1">
                    {node.labels.slice(0, 3).map((label, index) => (
                      <span key={index} className="badge badge-info">
                        {label}
                      </span>
                    ))}
                    {node.labels.length > 3 && (
                      <span className="badge badge-gray">
                        +{node.labels.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {format(node.created_at, 'MMM dd')}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            <button
              onClick={() => onNewSubtask(node.id)}
              className="w-6 h-6 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Add subtask"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => onTaskSelect(node)}
              className="w-6 h-6 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Edit task"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task and all its subtasks?')) {
                  onTaskDelete(node.id);
                }
              }}
              className="w-6 h-6 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-600 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Delete task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="animate-slide-in">
            {node.children.map(child => renderTaskNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks found</h3>
        <p className="text-gray-500 mb-4">Create your first task to get started on your journey!</p>
        <button
          onClick={() => onNewSubtask()}
          className="btn-primary"
        >
          Create Your First Task
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {tasks.map(node => renderTaskNode(node))}
    </div>
  );
};

export default TaskTree;
