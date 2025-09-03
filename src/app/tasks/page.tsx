// src/app/tasks/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { listTasks, deleteTask } from '@/services/taskService';
import { Task } from '@/types/task';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/components/context/toast-context';

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksData = await listTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        addToast('Failed to load tasks. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addToast]);

  useEffect(() => {
    let result = tasks;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(task => 
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter]);

  const handleDeleteTask = async (taskId: string, taskName: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      addToast(`Task "${taskName}" deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      addToast('Failed to delete task. Please try again later.', 'error');
    }
  };

  // Prepare table data
  const tableRows = filteredTasks.map(task => [
    task.name,
    task.schedule,
    <StatusBadge key={task.id} status={task.status} />,
    format(new Date(task.created_at), 'MMM d, yyyy'),
    <div key={task.id} className="flex space-x-2">
      <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
        View
      </Link>
      <button 
        onClick={() => handleDeleteTask(task.id, task.name)}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
      >
        Delete
      </button>
    </div>
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <Link href="/tasks/create">
          <Button>Create New Task</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'deleted', label: 'Deleted' },
            ]}
          />
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No tasks match your filters.' 
                : 'No tasks found.'}
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Link href="/tasks/create">
                <Button className="mt-4">Create Your First Task</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <Table
              headers={['Name', 'Schedule', 'Status', 'Created', 'Actions']}
              rows={tableRows}
            />
            {/* Pagination would go here in a real implementation */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTasks.length}</span> of{' '}
                <span className="font-medium">{filteredTasks.length}</span> results
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}