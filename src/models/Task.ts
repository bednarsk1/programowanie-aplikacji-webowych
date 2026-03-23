export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  storyId: string;
  estimatedTime: number;
  status: TaskStatus;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}
