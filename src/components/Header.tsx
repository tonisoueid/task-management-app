import React from 'react';
import { Search, Plus, Bell, Settings } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';

interface HeaderProps {
  onAddTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddTask }) => {
  const { searchQuery, setSearchQuery } = useTaskStore();

  return (
    <header className="h-20 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
            <input
              type="text"
              placeholder="Search tasks, projects, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-6">
          <button 
            onClick={onAddTask}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
          
          <button className="p-3 hover:bg-surface rounded-xl transition-colors relative">
            <Bell className="w-5 h-5 text-textSecondary" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          
          <button className="p-3 hover:bg-surface rounded-xl transition-colors">
            <Settings className="w-5 h-5 text-textSecondary" />
          </button>
        </div>
      </div>
    </header>
  );
};
