import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TicketDashboard } from './components/TicketDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'tickets'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'tickets' && <TicketDashboard />}
      </main>
    </div>
  );
}

export default App;