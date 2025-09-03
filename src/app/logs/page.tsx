// src/app/logs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { listTaskLogs } from '@/services/taskLogService';
import { listTasks } from '@/services/taskService';
import { TaskLog, Task } from '@/types/task';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/components/context/toast-context';

export default function TaskLogsPage() {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logsData, tasksData] = await Promise.all([
          listTaskLogs(),
          listTasks()
        ]);
        setLogs(logsData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching task logs:', error);
        addToast('Failed to load task logs. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addToast]);

  useEffect(() => {
    let result = logs;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(log => 
        (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(log => log.status === statusFilter);
    }
    
    setFilteredLogs(result);
  }, [logs, searchTerm, statusFilter]);

  // Get task name by ID
  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? task.name : 'Unknown Task';
  };

  // Prepare table data
  const tableRows = filteredLogs.map(log => [
    getTaskName(log.task_id),
    format(new Date(log.execution_time), 'MMM d, yyyy h:mm a'),
    <StatusBadge key={log.id} status={log.status} />,
    log.retry_count,
    log.message || '-',
    <Link 
      key={log.id} 
      href={`/tasks/${log.task_id}`}
      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
    >
      View Task
    </Link>
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Logs</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search logs..."
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
              { value: 'success', label: 'Success' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No logs match your filters.' 
                : 'No logs found.'}
            </p>
          </div>
        ) : (
          <>
            <Table
              headers={['Task', 'Execution Time', 'Status', 'Retries', 'Message', 'Actions']}
              rows={tableRows}
            />
            {/* Pagination would go here in a real implementation */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLogs.length}</span> of{' '}
                <span className="font-medium">{filteredLogs.length}</span> results
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