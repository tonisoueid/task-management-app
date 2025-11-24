import React, { useState } from 'react';
import { X, Flag, Tag, FolderOpen, AlertCircle } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { DatePicker } from './DatePicker';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, projects } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [projectId, setProjectId] = useState('inbox');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const result = addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      projectId,
      dueDate: dueDate || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });

    if (!result.success) {
      setError(result.error || 'Failed to add task');
      return;
    }

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setProjectId('inbox');
    setDueDate(null);
    setTags('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-text">Add New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-textSecondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-error/10 border border-error/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
              <p className="text-smtext-error">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review project proposal"
              maxLength={200}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              autoFocus
            />
            <p className="text-xs text-textSecondary mt-1">{title.length}/200 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            />
            <p className="text-xs text-textSecondary mt-1">{description.length}/1000 characters</p>
          </div>

          {/* Grid Layout for Metadata */}
          <div className="grid grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <FolderOpen className="w-4 h-4 inline mr-1" />
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date and Tags */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Due Date
              </label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="Select due date"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="urgent, review, meeting"
                maxLength={200}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <p className="text-xs text-textSecondary mt-1">Separate with commas (max 10 tags)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-textSecondary hover:text-text hover:bg-background rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
