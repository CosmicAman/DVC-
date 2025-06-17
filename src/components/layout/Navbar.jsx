import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <img 
            src="/dvclogo.jpeg" 
            alt="DVC Logo" 
            className="navbar-logo"
          />
          <span>DVC Quarter Management</span>
        </div>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <button onClick={() => navigate('/quarters')}>
                View Quarters
              </button>
              <button onClick={() => navigate('/bookings')}>
                Bookings
              </button>
              {user.role === 'admin' && (
                <button onClick={() => navigate('/admin')}>
                  Admin Panel
                </button>
              )}
              <button onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
} 