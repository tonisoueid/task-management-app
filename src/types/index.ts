export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  projectId: string;
  createdAt: Date;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  taskCount: number;
}

export type ViewMode = 'today' | 'upcoming' | 'all' | 'completed';
