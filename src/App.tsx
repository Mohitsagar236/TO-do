import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">TaskMaster</h1>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;