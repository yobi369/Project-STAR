import React from 'react';
import Dashboard from './components/Dashboard.tsx';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1f] font-sans text-gray-200">
      <Dashboard />
    </div>
  );
};

export default App;