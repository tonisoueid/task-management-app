import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';

function App() {
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <TaskList />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
