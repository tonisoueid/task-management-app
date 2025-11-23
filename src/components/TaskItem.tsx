import React, { useState } from 'react';
import { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { 
  Circle, 
  CheckCircle2, 
  Calendar, 
  Flag, 
  MoreHorizontal,
  Trash2,
  Edit,
  Tag
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask, projects } = useTaskStore();
  const [showMenu, setShowMenu] = useState(false);
  const project = projects.find(p => p.id === task.projectId);

  const priorityColors = {
    low: 'text-textSecondary',
    medium: 'text-warning',
    high: 'text-error',
  };

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const isDueDatePast = task.dueDate && isPast(task.dueDate) && !task.completed;

  return (
    <div className={`group relative bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all duration-200 ${
      task.completed ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id)}
          className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6 text-success" />
          ) : (
            <Circle className="w-6 h-6 text-textSecondary hover:text-primary transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-medium mb-1 ${
            task.completed ? 'line-through text-textSecondary' : 'text-text'
          }`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-textSecondary mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Project */}
            {project && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-lg">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-textSecondary">{project.name}</span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                isDueDatePast ? 'bg-error/10 text-error' : 'bg-background text-textSecondary'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDueDate(task.dueDate)}</span>
              </div>
            )}

            {/* Priority */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-lg">
              <Flag className={`w-3.5 h-3.5 ${priorityColors[task.priority]}`} />
              <span className="text-textSecondary capitalize">{task.priority}</span>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-lg">
                <Tag className="w-3.5 h-3.5 text-textSecondary" />
                <span className="text-textSecondary">{task.tags.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-background rounded-lg transition-all"
          >
            <MoreHorizontal className="w-5 h-5 text-textSecondary" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 w-48 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-scale-in">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors text-left">
                  <Edit className="w-4 h-4 text-textSecondary" />
                  <span className="text-sm text-text">Edit Task</span>
                </button>
                <button 
                  onClick={() => {
                    deleteTask(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error/10 transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4 text-error" />
                  <span className="text-sm text-error">Delete Task</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
