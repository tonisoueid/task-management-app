import { create } from 'zustand';
import { Task, Project, ViewMode } from '../types';
import { isToday, isFuture, isPast } from 'date-fns';

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  currentView: ViewMode;
  selectedProject: string | null;
  searchQuery: string;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  
  addProject: (project: Omit<Project, 'id' | 'taskCount'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  setCurrentView: (view: ViewMode) => void;
  setSelectedProject: (projectId: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  getFilteredTasks: () => Task[];
}

const defaultProjects: Project[] = [
  { id: 'inbox', name: 'Inbox', color: '#38bdf8', icon: 'Inbox', taskCount: 0 },
  { id: 'work', name: 'Work', color: '#9E7FFF', icon: 'Briefcase', taskCount: 0 },
  { id: 'personal', name: 'Personal', color: '#f472b6', icon: 'User', taskCount: 0 },
  { id: 'shopping', name: 'Shopping', color: '#10b981', icon: 'ShoppingCart', taskCount: 0 },
];

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Review project proposal',
    description: 'Go through the Q1 marketing proposal and provide feedback',
    completed: false,
    priority: 'high',
    dueDate: new Date(),
    projectId: 'work',
    createdAt: new Date(),
    tags: ['urgent', 'review'],
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    description: 'Set up weekly sync with the development team',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000),
    projectId: 'work',
    createdAt: new Date(),
    tags: ['meeting'],
  },
  {
    id: '3',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables',
    completed: false,
    priority: 'low',
    dueDate: new Date(Date.now() + 172800000),
    projectId: 'shopping',
    createdAt: new Date(),
    tags: ['errands'],
  },
  {
    id: '4',
    title: 'Finish quarterly report',
    completed: true,
    priority: 'high',
    dueDate: new Date(Date.now() - 86400000),
    projectId: 'work',
    createdAt: new Date(Date.now() - 172800000),
    tags: ['report'],
  },
  {
    id: '5',
    title: 'Call dentist for appointment',
    completed: false,
    priority: 'medium',
    projectId: 'personal',
    createdAt: new Date(),
    tags: ['health'],
  },
  {
    id: '6',
    title: 'Update portfolio website',
    description: 'Add recent projects and update bio section',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 259200000),
    projectId: 'personal',
    createdAt: new Date(),
    tags: ['development'],
  },
  {
    id: '7',
    title: 'Prepare presentation slides',
    description: 'Create slides for client pitch next week',
    completed: false,
    priority: 'high',
    dueDate: new Date(Date.now() + 345600000),
    projectId: 'work',
    createdAt: new Date(),
    tags: ['presentation', 'client'],
  },
  {
    id: '8',
    title: 'Read "Atomic Habits"',
    completed: false,
    priority: 'low',
    projectId: 'personal',
    createdAt: new Date(),
    tags: ['reading', 'self-improvement'],
  },
];

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: sampleTasks,
  projects: defaultProjects,
  currentView: 'today',
  selectedProject: null,
  searchQuery: '',
  
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({
      tasks: [newTask, ...state.tasks],
      projects: state.projects.map(p => 
        p.id === task.projectId ? { ...p, taskCount: p.taskCount + 1 } : p
      ),
    }));
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },
  
  deleteTask: (id) => {
    const task = get().tasks.find(t => t.id === id);
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== id),
      projects: state.projects.map(p => 
        p.id === task?.projectId ? { ...p, taskCount: Math.max(0, p.taskCount - 1) } : p
      ),
    }));
  },
  
  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }));
  },
  
  addProject: (project) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      taskCount: 0,
    };
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
  },
  
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map(project => 
        project.id === id ? { ...project, ...updates } : project
      ),
    }));
  },
  
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      tasks: state.tasks.filter(t => t.projectId !== id),
    }));
  },
  
  setCurrentView: (view) => set({ currentView: view, selectedProject: null }),
  setSelectedProject: (projectId) => set({ selectedProject: projectId, currentView: 'all' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getFilteredTasks: () => {
    const { tasks, currentView, selectedProject, searchQuery } = get();
    
    let filtered = tasks;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
