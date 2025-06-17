import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';
import Login from '../pages/Login';
import Bookings from '../pages/Bookings';
import NotFound from '../pages/NotFound';

const RouterContext = createContext();

const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.slice(1) || '/';
      setCurrentPath(path);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  const renderContent = () => {
    // Public routes
    if (!user) {
      return <Login />;
    }

    // Admin routes
    if (isAdmin) {
      switch (currentPath) {
        case '/admin':
          return <AdminDashboard />;
        default:
          return <AdminDashboard />;
      }
    }

    // Public user routes
    switch (currentPath) {
      case '/':
        return <Dashboard />;
      case '/bookings':
        return <Bookings />;
      default:
        return <NotFound />;
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {renderContent()}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export default RouterProvider; 