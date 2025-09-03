// src/app/tasks/create/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { createTask, TaskCreateRequest } from '@/services/taskService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/context/toast-context';

export default function CreateTaskPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    schedule: '',
    webhook_url: '',
    payload: '',
    max_retry: 3,
    status: 'active' as 'active' | 'inactive',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Parse payload as JSON
      let payload = null;
      if (formData.payload.trim()) {
        try {
          payload = JSON.parse(formData.payload);
        } catch (parseError) {
          setErrors(prev => ({ ...prev, payload: 'Invalid JSON format' }));
          setLoading(false);
          return;
        }
      }
      
      const taskData: TaskCreateRequest = {
        name: formData.name,
        schedule: formData.schedule,
        webhook_url: formData.webhook_url,
        payload,
        max_retry: formData.max_retry,
        status: formData.status,
      };
      
      const newTask = await createTask(taskData);
      
      addToast('Task created successfully!', 'success');
      router.push('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      addToast('Failed to create task. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Task</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                ]}
                fullWidth
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={loading}
            >
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}