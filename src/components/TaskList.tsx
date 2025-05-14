```tsx
// Previous TaskList.tsx content with these changes:

// 1. Update the stats grid to be responsive
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stats cards content */}
</div>

// 2. Make the filters section more mobile-friendly
<div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({taskStats.total})
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active ({taskStats.active})
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed ({taskStats.completed})
        </Button>
      </div>
    </div>
    
    <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
      <SortAsc className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as any)}
        className="w-full sm:w-auto rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
      >
        <option value="dueDate">Sort by Due Date</option>
        <option value="priority">Sort by Priority</option>
        <option value="created">Sort by Created</option>
      </select>
    </div>
  </div>
</div>

// 3. Update task card layout for better mobile display
<div className="flex flex-col sm:flex-row items-start gap-4">
  <button
    onClick={() => handleToggleTask(task.id)}
    className="flex-shrink-0 mt-1"
  >
    {/* Checkbox content */}
  </button>
  
  <div className="flex-grow min-w-0 w-full">
    <h3 className="text-lg font-medium dark:text-white truncate">
      {task.title}
    </h3>
    
    {task.description && (
      <p className="mt-1 text-gray-600 dark:text-gray-300 line-clamp-2">
        {task.description}
      </p>
    )}
    
    <div className="mt-3 flex flex-wrap gap-2">
      {/* Tags and metadata */}
    </div>
  </div>

  <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
    {/* Action buttons */}
  </div>
</div>
```