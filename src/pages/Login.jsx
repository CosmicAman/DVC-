import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, googleLogin, googleSignup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, name);
      } else if (isAdmin) {
        await login(email, password, adminCode);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters');
          break;
        default:
          setError('Failed to authenticate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await googleSignup();
      } else {
        await googleLogin();
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setError('Google sign-in was cancelled');
          break;
        case 'auth/popup-blocked':
          setError('Google sign-in popup was blocked. Please allow popups for this site');
          break;
        case 'auth/cancelled-popup-request':
          setError('Google sign-in was cancelled');
          break;
        default:
          setError('Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="card-title text-center">
        {isAdmin ? 'Admin Login' : isSignup ? 'Sign Up' : 'Login'}
      </h2>

      {error && (
        <div className="error-message" style={{ 
          color: '#e53e3e', 
          backgroundColor: '#fff5f5', 
          padding: '0.75rem', 
          borderRadius: '4px', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
              disabled={loading}
              placeholder="Enter your full name"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
            disabled={loading}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
            disabled={loading}
            placeholder="Enter your password"
            minLength={6}
          />
        </div>

        {isAdmin && (
          <div className="form-group">
            <label className="form-label">Admin Code</label>
            <input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="form-input"
              required
              disabled={loading}
              placeholder="Enter admin code"
            />
          </div>
        )}

        <button 
          type="submit" 
          className="auth-button auth-button-primary" 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Processing...
            </>
          ) : isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>

      {!isAdmin && (
        <div className="mt-4">
          <button
            onClick={handleGoogleAuth}
            className="auth-button auth-button-secondary"
            disabled={loading}
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              style={{ width: '18px', height: '18px' }} 
            />
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : isSignup ? 'Sign up with Google' : 'Login with Google'}
          </button>
        </div>
      )}

      <div className="text-center mt-4">
        <div className="auth-links">
          {!isAdmin && (
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="auth-button auth-button-secondary"
              disabled={loading}
            >
              {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
          )}
          {!isSignup && (
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className="auth-button auth-button-secondary"
              disabled={loading}
            >
              {isAdmin ? 'Switch to Public Login' : 'Switch to Admin Login'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 