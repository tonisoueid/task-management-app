import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { TaskItem } from './TaskItem';
import { Calendar, Inbox, CheckCircle2 } from 'lucide-react';

export const TaskList: React.FC = () => {
  const { currentView, selectedProject, projects, getFilteredTasks } = useTaskStore();
  const tasks = getFilteredTasks();

  const getTitle = () => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      return project?.name || 'Project';
    }
    
    switch (currentView) {
      case 'today':
        return 'Today';
      case 'upcoming':
        return 'Upcoming';
      case 'all':
        return 'All Tasks';
      case 'completed':
        return 'Completed';
      default:
        return 'Tasks';
    }
  };

  const getEmptyState = () => {
    const icons = {
      today: Calendar,
      upcoming: Calendar,
      all: Inbox,
      completed: CheckCircle2,
    };
    
    const Icon = selectedProject ? Inbox : icons[currentView];
    
    const messages = {
      today: "No tasks due today. Enjoy your free time!",
      upcoming: "No upcoming tasks. You're all caught up!",
      all: "No tasks yet. Create one to get started!",
      completed: "No completed tasks yet. Keep working!",
    };
    
    const message = selectedProject 
      ? "No tasks in this project yet." 
      : messages[currentView];

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-textSecondary" />
        </div>
        <h3 className="text-xl font-semibold text-text mb-2">All Clear!</h3>
        <p className="text-textSecondary max-w-md">{message}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-2">{getTitle()}</h2>
          <p className="text-textSecondary">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          getEmptyState()
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div 
                key={task.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TaskItem task={task} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
