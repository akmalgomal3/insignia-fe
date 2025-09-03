// src/services/taskService.ts
import api from './api';
import { Task } from '@/types/task';

export interface TaskCreateRequest {
  name: string;
  schedule: string;
  webhook_url: string;
  payload: object | null;
  max_retry: number;
  status: 'active' | 'inactive';
}

export interface TaskUpdateRequest {
  name?: string;
  schedule?: string;
  webhook_url?: string;
  payload?: object | null;
  max_retry?: number;
  status?: 'active' | 'inactive' | 'deleted';
}

// Create a new task
export const createTask = async (taskData: TaskCreateRequest): Promise<Task> => {
  try {
    const response = await api.post<Task>('/tasks/', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Get a task by ID
export const getTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await api.get<Task>(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId: string, taskData: TaskUpdateRequest): Promise<Task> => {
  try {
    const response = await api.put<Task>(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${taskId}`);
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

// List all tasks
export const listTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/tasks/');
    // Extract tasks array from response
    const tasks = response.data?.tasks || [];
    // Ensure we always return an array
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error('Error listing tasks:', error);
    // Return empty array on error to prevent breaking the UI
    return [];
  }
};

// Execute a task manually (if supported by backend)
export const executeTask = async (taskId: string): Promise<void> => {
  try {
    await api.post(`/tasks/${taskId}/execute`);
  } catch (error) {
    console.error(`Error executing task ${taskId}:`, error);
    throw error;
  }
};