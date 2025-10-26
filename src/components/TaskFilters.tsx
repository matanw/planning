import React from 'react';
import type { TaskFilters, TaskSortOptions, TaskStatus } from '../types/task';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

interface TaskFiltersComponentProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  sortOptions: TaskSortOptions;
  onSortChange: (sort: TaskSortOptions) => void;
}

const TaskFiltersComponent: React.FC<TaskFiltersComponentProps> = ({
  filters,
  onFiltersChange,
  sortOptions,
  onSortChange
}) => {
  const handleStatusChange = (status: TaskStatus, checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status);
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined
    });
  };

  const handleSearchChange = (searchText: string) => {
    onFiltersChange({
      ...filters,
      searchText: searchText.trim() || undefined
    });
  };

  const handlePriorityChange = (priority: number, checked: boolean) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority);
    
    onFiltersChange({
      ...filters,
      priority: newPriorities.length > 0 ? newPriorities : undefined
    });
  };

  const handleSortFieldChange = (field: TaskSortOptions['field']) => {
    onSortChange({
      field,
      direction: sortOptions.field === field && sortOptions.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof TaskFilters];
    return value !== undefined && (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <div className="card card-hover animate-fade-in">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-md flex items-center justify-center mr-3">
                      <Filter className="w-3 h-3 text-blue-600" />
                    </div>
                    Filters & Sort
                  </h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      <div className="p-6 space-y-6">

        {/* Search */}
        <div className="form-group">
                  <label className="form-label">
                    Search Tasks
                  </label>
          <input
            type="text"
            value={filters.searchText || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="form-input"
            placeholder="Search by title or description..."
          />
        </div>

        {/* Status Filter */}
        <div className="form-group">
                  <label className="form-label">
                    Status
                  </label>
          <div className="space-y-3">
            {(['not_started', 'in_progress', 'done'] as TaskStatus[]).map(status => (
              <label key={status} className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status) || false}
                  onChange={(e) => handleStatusChange(status, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className={`ml-3 text-sm font-medium capitalize ${
                  status === 'done' ? 'text-green-700' :
                  status === 'in_progress' ? 'text-blue-700' :
                  'text-gray-700'
                }`}>
                  {status.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="form-group">
                  <label className="form-label">
                    Priority
                  </label>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(priority => (
              <label key={priority} className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.priority?.includes(priority) || false}
                  onChange={(e) => handlePriorityChange(priority, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div className={`ml-3 priority-indicator priority-${priority}`}>
                  {priority}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Priority {priority}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="form-group">
                  <label className="form-label">
                    Sort By
                  </label>
          <div className="space-y-2">
            {[
              { field: 'title' as const, label: 'Title', icon: '📝' },
              { field: 'status' as const, label: 'Status', icon: '📊' },
              { field: 'deadline' as const, label: 'Deadline', icon: '📅' },
              { field: 'priority' as const, label: 'Priority', icon: '⭐' },
              { field: 'created_at' as const, label: 'Created Date', icon: '🕒' },
              { field: 'updated_at' as const, label: 'Updated Date', icon: '🔄' }
            ].map(({ field, label, icon }) => (
              <button
                key={field}
                onClick={() => handleSortFieldChange(field)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  sortOptions.field === field
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">{icon}</span>
                  <span>{label}</span>
                </div>
                {sortOptions.field === field && (
                  sortOptions.direction === 'asc' ? (
                    <SortAsc className="w-4 h-4 text-blue-600" />
                  ) : (
                    <SortDesc className="w-4 h-4 text-blue-600" />
                  )
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <svg className="w-2 h-2 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Active Filters
                    </h4>
            <div className="space-y-2">
              {filters.status && filters.status.length > 0 && (
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Status:</span>
                  <div className="flex space-x-1">
                    {filters.status.map(s => (
                      <span key={s} className="badge badge-info">
                        {s.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {filters.priority && filters.priority.length > 0 && (
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Priority:</span>
                  <div className="flex space-x-1">
                    {filters.priority.map(p => (
                      <span key={p} className={`priority-indicator priority-${p}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {filters.searchText && (
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Search:</span>
                  <span className="badge badge-gray">"{filters.searchText}"</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFiltersComponent;
