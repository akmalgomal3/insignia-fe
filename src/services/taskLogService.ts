// src/services/taskLogService.ts
import api from './api';
import { TaskLog } from '@/types/task';

// Create a new task log
export const createTaskLog = async (taskLogData: Partial<TaskLog>): Promise<TaskLog> => {
  try {
    const response = await api.post<TaskLog>('/task-logs/', taskLogData);
    return response.data;
  } catch (error) {
    console.error('Error creating task log:', error);
    throw error;
  }
};

// Get a task log by ID
export const getTaskLog = async (taskLogId: string): Promise<TaskLog> => {
  try {
    const response = await api.get<TaskLog>(`/task-logs/${taskLogId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task log ${taskLogId}:`, error);
    throw error;
  }
};

// Update a task log
export const updateTaskLog = async (taskLogId: string, taskLogData: Partial<TaskLog>): Promise<TaskLog> => {
  try {
    const response = await api.put<TaskLog>(`/task-logs/${taskLogId}`, taskLogData);
    return response.data;
  } catch (error) {
    console.error(`Error updating task log ${taskLogId}:`, error);
    throw error;
  }
};

// Delete a task log
export const deleteTaskLog = async (taskLogId: string): Promise<void> => {
  try {
    await api.delete(`/task-logs/${taskLogId}`);
  } catch (error) {
    console.error(`Error deleting task log ${taskLogId}:`, error);
    throw error;
  }
};

// List all task logs
export const listTaskLogs = async (): Promise<TaskLog[]> => {
  try {
    const response = await api.get('/task-logs/');
    // Extract logs array from response
    const logs = response.data?.task_logs || response.data || [];
    // Ensure we always return an array
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.error('Error listing task logs:', error);
    // Return empty array on error to prevent breaking the UI
    return [];
  }
};

// List task logs by task ID
export const listTaskLogsByTask = async (taskId: string): Promise<TaskLog[]> => {
  try {
    const response = await api.get(`/task-logs/task/${taskId}`);
    // Extract logs array from response
    const logs = response.data?.task_logs || response.data || [];
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.error(`Error listing task logs for task ${taskId}:`, error);
    throw error;
  }
};