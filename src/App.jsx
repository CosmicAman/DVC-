import { RouterProvider } from './context/RouterContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useRouter } from './context/RouterContext';
import { useAuth } from './context/AuthContext';

// Import your page components here
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quarters from './pages/Quarters';
import Bookings from './pages/Bookings';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const { currentPath } = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  const renderContent = () => {
    // If user is not logged in and trying to access protected routes
    if (!user && currentPath !== '/login') {
      return <Login />;
    }

    // If user is logged in and trying to access login page
    if (user && currentPath === '/login') {
      return <Dashboard />;
    }

    switch (currentPath) {
      case '/':
        return user ? <Dashboard /> : <Login />;
      case '/login':
        return <Login />;
      case '/dashboard':
        return user ? <Dashboard /> : <Login />;
      case '/quarters':
        return user ? <Quarters /> : <Login />;
      case '/bookings':
        return user ? <Bookings /> : <Login />;
      case '/admin':
        return user?.role === 'admin' ? <AdminPanel /> : <Dashboard />;
      default:
        return user ? <Dashboard /> : <Login />;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;
