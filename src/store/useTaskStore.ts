import { create } from 'zustand';
import { Task, Project, ViewMode } from '../types';
import { isToday, isFuture } from 'date-fns';
import {
  generateSecureId,
  sanitizeText,
  sanitizeTags,
  validateTaskTitle,
  validateDescription,
  validateProjectName,
  rateLimiter,
  isValidUUID,
} from '../utils/security';

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  currentView: ViewMode;
  selectedProject: string | null;
  searchQuery: string;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateTask: (id: string, updates: Partial<Task>) => { success: boolean; error?: string };
  deleteTask: (id: string) => { success: boolean; error?: string };
  toggleTask: (id: string) => void;
  
  addProject: (project: Omit<Project, 'id' | 'taskCount'>) => { success: boolean; error?: string };
  updateProject: (id: string, updates: Partial<Project>) => { success: boolean; error?: string };
  deleteProject: (id: string) => { success: boolean; error?: string };
  
  setCurrentView: (view: ViewMode) => void;
  setSelectedProject: (projectId: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  getFilteredTasks: () => Task[];
}

const defaultProjects: Project[] = [
  { id: generateSecureId(), name: 'Inbox', color: '#38bdf8', icon: 'Inbox', taskCount: 0 },
  { id: generateSecureId(), name: 'Work', color: '#9E7FFF', icon: 'Briefcase', taskCount: 0 },
  { id: generateSecureId(), name: 'Personal', color: '#f472b6', icon: 'User', taskCount: 0 },
];

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  projects: defaultProjects,
  currentView: 'today',
  selectedProject: null,
  searchQuery: '',
  
  addTask: (task) => {
    // Rate limiting
    if (!rateLimiter.canPerformAction('addTask')) {
      return { success: false, error: 'Too many requests. Please wait a moment.' };
    }

    // Validate and sanitize title
    const titleValidation = validateTaskTitle(task.title);
    if (!titleValidation.valid) {
      return { success: false, error: titleValidation.error };
    }
    const sanitizedTitle = sanitizeText(task.title, 200);

    // Validate and sanitize description
    if (task.description) {
      const descValidation = validateDescription(task.description);
      if (!descValidation.valid) {
        return { success: false, error: descValidation.error };
      }
    }
    const sanitizedDescription = task.description ? sanitizeText(task.description, 1000) : undefined;

    // Sanitize tags
    const sanitizedTagsArray = sanitizeTags(task.tags);

    // Validate project exists
    const projectExists = get().projects.some(p => p.id === task.projectId);
    if (!projectExists) {
      return { success: false, error: 'Invalid project selected' };
    }

    try {
      const newTask: Task = {
        ...task,
        id: generateSecureId(),
        title: sanitizedTitle,
        description: sanitizedDescription,
        tags: sanitizedTagsArray,
        createdAt: new Date(),
      };

      set((state) => ({
        tasks: [newTask, ...state.tasks],
        projects: state.projects.map(p => 
          p.id === task.projectId ? { ...p, taskCount: p.taskCount + 1 } : p
        ),
      }));

      return { success: true };
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error: 'Failed to add task' };
    }
  },
  
  updateTask: (id, updates) => {
    // Validate ID
    if (!isValidUUID(id)) {
      return { success: false, error: 'Invalid task ID' };
    }

    // Rate limiting
    if (!rateLimiter.canPerformAction('updateTask')) {
      return { success: false, error: 'Too many requests. Please wait a moment.' };
    }

    const state = get();
    const oldTask = state.tasks.find(t => t.id === id);
    
    if (!oldTask) {
      return { success: false, error: 'Task not found' };
    }

    try {
      // Validate and sanitize updates
      const sanitizedUpdates: Partial<Task> = { ...updates };

      if (updates.title !== undefined) {
        const titleValidation = validateTaskTitle(updates.title);
        if (!titleValidation.valid) {
          return { success: false, error: titleValidation.error };
        }
        sanitizedUpdates.title = sanitizeText(updates.title, 200);
      }

      if (updates.description !== undefined) {
        const descValidation = validateDescription(updates.description);
        if (!descValidation.valid) {
          return { success: false, error: descValidation.error };
        }
        sanitizedUpdates.description = sanitizeText(updates.description, 1000);
      }

      if (updates.tags !== undefined) {
        sanitizedUpdates.tags = sanitizeTags(updates.tags);
      }

      if (updates.projectId !== undefined) {
        const projectExists = state.projects.some(p => p.id === updates.projectId);
        if (!projectExists) {
          return { success: false, error: 'Invalid project selected' };
        }
      }

      const newProjectId = sanitizedUpdates.projectId;
      
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...sanitizedUpdates } : task
        ),
        projects: oldTask && newProjectId && oldTask.projectId !== newProjectId
          ? state.projects.map(p => {
              if (p.id === oldTask.projectId) {
                return { ...p, taskCount: Math.max(0, p.taskCount - 1) };
              }
              if (p.id === newProjectId) {
                return { ...p, taskCount: p.taskCount + 1 };
              }
              return p;
            })
          : state.projects,
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: 'Failed to update task' };
    }
  },
  
  deleteTask: (id) => {
    // Validate ID
    if (!isValidUUID(id)) {
      return { success: false, error: 'Invalid task ID' };
    }

    // Rate limiting
    if (!rateLimiter.canPerformAction('deleteTask')) {
      return { success: false, error: 'Too many requests. Please wait a moment.' };
    }

    try {
      const task = get().tasks.find(t => t.id === id);
      
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id),
        projects: state.projects.map(p => 
          p.id === task?.projectId ? { ...p, taskCount: Math.max(0, p.taskCount - 1) } : p
        ),
      }));

      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: 'Failed to delete task' };
    }
  },
  
  toggleTask: (id) => {
    if (!isValidUUID(id)) return;

    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }));
  },
  
  addProject: (project) => {
    // Rate limiting
    if (!rateLimiter.canPerformAction('addProject')) {
      return { success: false, error: 'Too many requests. Please wait a moment.' };
    }

    // Validate project name
    const nameValidation = validateProjectName(project.name);
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error };
    }

    try {
      const sanitizedName = sanitizeText(project.name, 100);

      const newProject: Project = {
        ...project,
        id: generateSecureId(),
        name: sanitizedName,
        taskCount: 0,
      };

      set((state) => ({
        projects: [...state.projects, newProject],
      }));

      return { success: true };
    } catch (error) {
      console.error('Error adding project:', error);
      return { success: false, error: 'Failed to add project' };
    }
  },
  
  updateProject: (id, updates) => {
    if (!isValidUUID(id)) {
      return { success: false, error: 'Invalid project ID' };
    }

    try {
      const sanitizedUpdates: Partial<Project> = { ...updates };

      if (updates.name !== undefined) {
        const nameValidation = validateProjectName(updates.name);
        if (!nameValidation.valid) {
          return { success: false, error: nameValidation.error };
        }
        sanitizedUpdates.name = sanitizeText(updates.name, 100);
      }

      set((state) => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, ...sanitizedUpdates } : project
        ),
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating project:', error);
      return { success: false, error: 'Failed to update project' };
    }
  },
  
  deleteProject: (id) => {
    if (!isValidUUID(id)) {
      return { success: false, error: 'Invalid project ID' };
    }

    try {
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        tasks: state.tasks.filter(t => t.projectId !== id),
      }));

      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { success: false, error: 'Failed to delete project' };
    }
  },
  
  setCurrentView: (view) => set({ currentView: view, selectedProject: null }),
  setSelectedProject: (projectId) => {
    if (projectId && !isValidUUID(projectId)) return;
    set({ selectedProject: projectId, currentView: 'all' });
  },
  setSearchQuery: (query) => {
    const sanitizedQuery = sanitizeText(query, 200);
    set({ searchQuery: sanitizedQuery });
  },
  
  getFilteredTasks: () => {
    const { tasks, currentView, selectedProject, searchQuery } = get();
    
    let filtered = tasks;
    
    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery) ||
        task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Filter by project
    if (selectedProject) {
      filtered = filtered.filter(task => task.projectId === selectedProject);
    } else {
      // Filter by view
      switch (currentView) {
        case 'today':
          filtered = filtered.filter(task => 
            !task.completed && task.dueDate && isToday(task.dueDate)
          );
          break;
        case 'upcoming':
          filtered = filtered.filter(task => 
            !task.completed && task.dueDate && isFuture(task.dueDate)
          );
          break;
        case 'completed':
          filtered = filtered.filter(task => task.completed);
          break;
        case 'all':
          filtered = filtered.filter(task => !task.completed);
          break;
      }
    }
    
    return filtered;
  },
}));
