import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard, CheckSquare } from 'lucide-react';
import { Button } from './ui/Button';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <Button
        variant="outline"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white dark:bg-gray-800 shadow-md
        overflow-y-auto
      `}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            TaskMaster
          </h1>
          <nav className="space-y-2">
            <Link 
              to="/" 
              className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link 
              to="/tasks" 
              className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CheckSquare className="w-5 h-5 mr-3" />
              All Tasks
            </Link>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;