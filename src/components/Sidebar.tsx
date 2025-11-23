import React from 'react';
import { 
  Calendar, 
  CalendarClock, 
  CheckCircle2, 
  Inbox, 
  LayoutGrid,
  Plus,
  Briefcase,
  User,
  ShoppingCart,
  Hash
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { ViewMode } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Inbox,
  Briefcase,
  User,
  ShoppingCart,
  Hash,
};

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    selectedProject, 
    projects, 
    tasks,
    setCurrentView, 
    setSelectedProject 
  } = useTaskStore();

  const views = [
    { id: 'today' as ViewMode, name: 'Today', icon: Calendar, color: 'text-success' },
    { id: 'upcoming' as ViewMode, name: 'Upcoming', icon: CalendarClock, color: 'text-secondary' },
    { id: 'all' as ViewMode, name: 'All Tasks', icon: LayoutGrid, color: 'text-primary' },
    { id: 'completed' as ViewMode, name: 'Completed', icon: CheckCircle2, color: 'text-textSecondary' },
  ];

  const getTaskCount = (viewId: ViewMode) => {
    switch (viewId) {
      case 'today':
        return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
      case 'upcoming':
        return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) > new Date()).length;
      case 'all':
        return tasks.filter(t => !t.completed).length;
      case 'completed':
        return tasks.filter(t => t.completed).length;
      default:
        return 0;
    }
  };

  return (
    <aside className="w-80 bg-surface border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">TaskFlow</h1>
            <p className="text-xs text-textSecondary">Organize your life</p>
          </div>
        </div>
      </div>

      {/* Views */}
      <div className="p-4 space-y-1">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.id && !selectedProject;
          const count = getTaskCount(view.id);
          
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-textSecondary hover:bg-surface/50 hover:text-text'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : view.color}`} />
                <span className="font-medium">{view.name}</span>
              </div>
              {count > 0 && (
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  isActive ? 'bg-primary text-white' : 'bg-border text-textSecondary'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Projects */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wider">Projects</h2>
          <button className="p-1 hover:bg-surface/50 rounded-lg transition-colors">
            <Plus className="w-4 h-4 text-textSecondary" />
          </button>
        </div>
        
        <div className="space-y-1">
          {projects.map((project) => {
            const Icon = iconMap[project.icon] || Hash;
            const isActive = selectedProject === project.id;
            const projectTaskCount = tasks.filter(t => t.projectId === project.id && !t.completed).length;
            
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-textSecondary hover:bg-surface/50 hover:text-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{project.name}</span>
                </div>
                {projectTaskCount > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    isActive ? 'bg-primary text-white' : 'bg-border text-textSecondary'
                  }`}>
                    {projectTaskCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface/50 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-semibold">
            JD
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text">John Doe</p>
            <p className="text-xs text-textSecondary">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
