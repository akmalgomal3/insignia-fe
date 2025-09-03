// src/app/tasks/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { getTask, updateTask, deleteTask } from '@/services/taskService';
import { listTaskLogsByTask } from '@/services/taskLogService';
import { Task, TaskLog } from '@/types/task';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useToast } from '@/components/context/toast-context';

export default function TaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { addToast } = useToast();
  
  const [task, setTask] = useState<Task | null>(null);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    schedule: '',
    webhook_url: '',
    payload: '',
    max_retry: 3,
    status: 'active' as 'active' | 'inactive' | 'deleted',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [taskData, logsData] = await Promise.all([
          getTask(taskId),
          listTaskLogsByTask(taskId)
        ]);
        
        setTask(taskData);
        setLogs(logsData);
        
        // Initialize form data with task data
        setFormData({
          name: taskData.name,
          schedule: taskData.schedule,
          webhook_url: taskData.webhook_url,
          payload: taskData.payload ? JSON.stringify(taskData.payload, null, 2) : '',
          max_retry: taskData.max_retry,
          status: taskData.status,
        });
      } catch (error) {
        console.error('Error fetching task details:', error);
        addToast('Failed to load task details. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchData();
    }
  }, [taskId, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_retry' ? parseInt(value, 10) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    
    if (!formData.schedule.trim()) {
      newErrors.schedule = 'Schedule (cron expression) is required';
    }
    
    if (!formData.webhook_url.trim()) {
      newErrors.webhook_url = 'Webhook URL is required';
    } else if (!formData.webhook_url.startsWith('https://discord.com/api/webhooks/')) {
      newErrors.webhook_url = 'Webhook URL must start with https://discord.com/api/webhooks/';
    }
    
    if (formData.max_retry < 0 || formData.max_retry > 10) {
      newErrors.max_retry = 'Max retry must be between 0 and 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Parse payload as JSON
      let payload = null;
      if (formData.payload.trim()) {
        try {
          payload = JSON.parse(formData.payload);
        } catch (parseError) {
          setErrors(prev => ({ ...prev, payload: 'Invalid JSON format' }));
          return;
        }
      }
      
      const updatedTask = await updateTask(taskId, {
        name: formData.name,
        schedule: formData.schedule,
        webhook_url: formData.webhook_url,
        payload,
        max_retry: formData.max_retry,
        status: formData.status,
      });
      
      setTask(updatedTask);
      setIsEditing(false);
      addToast('Task updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      addToast('Failed to update task. Please try again.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      addToast('Task deleted successfully!', 'success');
      router.push('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      addToast('Failed to delete task. Please try again.', 'error');
    }
  };

  const handleExecute = async () => {
    try {
      // Note: This assumes there's an execute endpoint in the backend
      // If not, this would need to be implemented differently
      await fetch(`/api/tasks/${taskId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      
      addToast('Task execution started!', 'success');
      
      // Refresh logs after execution
      try {
        const logsData = await listTaskLogsByTask(taskId);
        setLogs(logsData);
      } catch (error) {
        console.error('Error refreshing logs:', error);
      }
    } catch (error) {
      console.error('Error executing task:', error);
      addToast('Failed to execute task. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Task Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">The requested task could not be found.</p>
        <Button onClick={() => router.push('/tasks')}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  // Prepare logs table data
  const logsTableRows = logs.map(log => [
    format(new Date(log.execution_time), 'MMM d, yyyy h:mm a'),
    <StatusBadge key={log.id} status={log.status} />,
    log.retry_count,
    log.message || '-',
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Task' : task.name}
        </h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="secondary" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="secondary" 
                onClick={handleExecute}
              >
                Execute Now
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button 
                variant="danger" 
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Task Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter task name"
                  fullWidth
                />
              </div>
              
              <div>
                <Input
                  label="Schedule (Cron Expression)"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  error={errors.schedule}
                  placeholder="e.g., 0 9 * * *"
                  fullWidth
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <a 
                    href="https://crontab.guru/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Use cron generator
                  </a>
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="Discord Webhook URL"
                  name="webhook_url"
                  value={formData.webhook_url}
                  onChange={handleChange}
                  error={errors.webhook_url}
                  placeholder="https://discord.com/api/webhooks/..."
                  fullWidth
                />
              </div>
              
              <div className="md:col-span-2">
                <Textarea
                  label="Payload Template (JSON)"
                  name="payload"
                  value={formData.payload}
                  onChange={handleChange}
                  error={errors.payload}
                  placeholder='{"message": "Hello, World!"}'
                  rows={6}
                  fullWidth
                />
              </div>
              
              <div>
                <Input
                  label="Max Retry Count"
                  name="max_retry"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.max_retry}
                  onChange={handleChange}
                  error={errors.max_retry}
                  fullWidth
                />
              </div>
              
              <div>
                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'deleted', label: 'Deleted' },
                  ]}
                  fullWidth
                />
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Task Name</h3>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{task.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <div className="mt-1">
                  <StatusBadge status={task.status} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Schedule (Cron Expression)</h3>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{task.schedule}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Retry Count</h3>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">{task.max_retry}</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Discord Webhook URL</h3>
                <p className="mt-1 text-lg text-gray-900 dark:text-white break-all">{task.webhook_url}</p>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Payload Template</h3>
                <pre className="mt-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white overflow-x-auto">
                  {task.payload ? JSON.stringify(task.payload, null, 2) : 'No payload'}
                </pre>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">
                  {format(new Date(task.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">
                  {format(new Date(task.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Execution Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Execution Logs</h2>
        </div>
        <div className="p-6">
          {logs.length > 0 ? (
            <Table 
              headers={['Execution Time', 'Status', 'Retries', 'Message']}
              rows={logsTableRows}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No execution logs found for this task.
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
      >
        <p className="text-gray-500 dark:text-gray-400">
          Are you sure you want to delete the task &quot;{task.name}&quot;? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}