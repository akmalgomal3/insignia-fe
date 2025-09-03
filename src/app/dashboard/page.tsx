// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Task, TaskLog } from '@/types/task';
import { listTasks } from '@/services/taskService';
import { listTaskLogs } from '@/services/taskLogService';
import { format } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/components/context/toast-context';

// Colors for charts
const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksData, logsData] = await Promise.all([
          listTasks(),
          listTaskLogs()
        ]);
        
        // Ensure we're working with arrays
        const validTasks = Array.isArray(tasksData) ? tasksData : [];
        const validLogs = Array.isArray(logsData) ? logsData : [];
        
        setTasks(validTasks);
        setLogs(validLogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        addToast('Failed to load dashboard data. Please try again later.', 'error');
        // Set empty arrays on error to prevent further issues
        setTasks([]);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addToast]);

  // Calculate summary statistics with safety checks
  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
  const activeTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === 'active').length : 0;
  const inactiveTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === 'inactive').length : 0;
  const failedExecutions = Array.isArray(logs) ? logs.filter(log => log.status === 'failed').length : 0;

  // Prepare execution trends data (last 7 days) with safety checks
  const executionData = [];
  const today = new Date();
  const validLogs = Array.isArray(logs) ? logs : [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const successCount = validLogs.filter(log => 
      log.status === 'success' && 
      log.execution_time && 
      log.execution_time.startsWith(dateStr)
    ).length;
    
    const failedCount = validLogs.filter(log => 
      log.status === 'failed' && 
      log.execution_time && 
      log.execution_time.startsWith(dateStr)
    ).length;
    
    executionData.push({
      date: format(date, 'MMM dd'),
      success: successCount,
      failed: failedCount
    });
  }

  // Prepare task status distribution data
  const deletedTasks = Math.max(0, totalTasks - activeTasks - inactiveTasks);
  const taskStatusData = [
    { name: 'Active', value: activeTasks },
    { name: 'Inactive', value: inactiveTasks },
    { name: 'Deleted', value: deletedTasks },
  ];

  // Prepare recent executions table data with safety checks
  const validTasks = Array.isArray(tasks) ? tasks : [];
  const recentExecutions = validLogs
    .slice(0, 5)
    .map(log => {
      const task = validTasks.find(t => t.id === log.task_id);
      return [
        task?.name || 'Unknown Task',
        log.execution_time ? format(new Date(log.execution_time), 'MMM d, yyyy h:mm a') : 'Unknown Time',
        <StatusBadge key={log.id} status={log.status} />,
        log.retry_count || 0,
        log.message || '-',
      ];
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link href="/tasks/create">
          <Button>Create New Task</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Total Tasks" 
          value={totalTasks} 
          description="All scheduled tasks"
        />
        <Card 
          title="Active Tasks" 
          value={activeTasks} 
          description="Currently running"
        />
        <Card 
          title="Inactive Tasks" 
          value={inactiveTasks} 
          description="Paused or disabled"
        />
        <Card 
          title="Failed Executions" 
          value={failedExecutions} 
          description="Last 7 days"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trends Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Execution Trends (Last 7 Days)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#10B981" name="Success" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Executions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Executions</h2>
        </div>
        <div className="p-6">
          {recentExecutions.length > 0 ? (
            <Table 
              headers={['Task', 'Execution Time', 'Status', 'Retries', 'Message']}
              rows={recentExecutions}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No execution logs found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}