export interface Task {
  id: string; // UUID
  name: string;
  schedule: string; // cron expression
  webhook_url: string;
  payload: object | null; // JSON object
  max_retry: number;
  status: 'active' | 'inactive' | 'deleted';
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  logs?: TaskLog[]; // Array of task logs (optional)
}

export interface TaskLog {
  id: string; // UUID
  task_id: string; // UUID
  execution_time: string; // ISO date string
  status: 'success' | 'failed';
  retry_count: number;
  message: string | null;
  created_at: string; // ISO date string
}