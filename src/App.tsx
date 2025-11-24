import React, { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { AddTaskModal } from './components/AddTaskModal';

function App() {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onAddTask={() => setIsAddTaskModalOpen(true)} />
          <TaskList />
        </div>
        
        {/* Add Task Modal */}
        <AddTaskModal 
          isOpen={isAddTaskModalOpen} 
          onClose={() => setIsAddTaskModalOpen(false)} 
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
