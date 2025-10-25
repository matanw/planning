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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters & Sort
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Tasks
        </label>
        <input
          type="text"
          value={filters.searchText || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by title or description..."
        />
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="space-y-2">
          {(['not_started', 'in_progress', 'done'] as TaskStatus[]).map(status => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.status?.includes(status) || false}
                onChange={(e) => handleStatusChange(status, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">
                {status.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(priority => (
            <label key={priority} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.priority?.includes(priority) || false}
                onChange={(e) => handlePriorityChange(priority, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {'!'.repeat(priority)} Priority {priority}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <div className="space-y-2">
          {[
            { field: 'title' as const, label: 'Title' },
            { field: 'status' as const, label: 'Status' },
            { field: 'deadline' as const, label: 'Deadline' },
            { field: 'priority' as const, label: 'Priority' },
            { field: 'created_at' as const, label: 'Created Date' },
            { field: 'updated_at' as const, label: 'Updated Date' }
          ].map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSortFieldChange(field)}
              className={`w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                sortOptions.field === field
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{label}</span>
              {sortOptions.field === field && (
                sortOptions.direction === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="space-y-1">
            {filters.status && filters.status.length > 0 && (
              <div className="text-xs text-gray-600">
                Status: {filters.status.map(s => s.replace('_', ' ')).join(', ')}
              </div>
            )}
            {filters.priority && filters.priority.length > 0 && (
              <div className="text-xs text-gray-600">
                Priority: {filters.priority.join(', ')}
              </div>
            )}
            {filters.searchText && (
              <div className="text-xs text-gray-600">
                Search: "{filters.searchText}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFiltersComponent;
