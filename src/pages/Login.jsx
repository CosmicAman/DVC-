import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('public'); // 'public' or 'admin'
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, googleLogin, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        if (loginType === 'admin') {
          // Admin login
          if (email === 'admin@dvc.com' && password === '1234') {
            await login(email, password);
          } else {
            setError('Invalid admin credentials');
          }
        } else {
          // Public user login
          if (email === 'user@dvc.com' && password === '1234') {
            await login(email, password);
          } else {
            setError('Invalid credentials');
          }
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await signup(email, password, name);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="dvclogo.jpeg" alt="DVC Logo" className="login-logo" />
          <h1>Welcome to DVC</h1>
          <p className="login-subtitle">{isLogin ? 'Sign in to access your account' : 'Create a new account'}</p>
        </div>

        {isLogin && (
          <div className="login-type-selector">
            <button
              className={`login-type-btn ${loginType === 'public' ? 'active' : ''}`}
              onClick={() => setLoginType('public')}
            >
              <i className="fas fa-user"></i>
              Public Login
            </button>
            <button
              className={`login-type-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => setLoginType('admin')}
            >
              <i className="fas fa-shield-alt"></i>
              Admin Login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-user"></i>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isLogin ? (loginType === 'admin' ? 'admin@dvc.com' : 'user@dvc.com') : 'Enter your email'}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          <button type="submit" className="login-button">
            <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
            {isLogin ? (loginType === 'admin' ? 'Login as Admin' : 'Login as Public User') : 'Create Account'}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleLogin} className="google-login-button">
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            className="google-icon"
          />
          Continue with Google
        </button>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleAuthMode} className="toggle-button">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {isLogin && loginType === 'admin' && (
          <div className="admin-info">
            <i className="fas fa-info-circle"></i>
            <p>Admin Credentials:</p>
            <p>Email: admin@dvc.com</p>
            <p>Password: 1234</p>
          </div>
        )}
        {isLogin && loginType === 'public' && (
          <div className="public-info">
            <i className="fas fa-info-circle"></i>
            <p>Public User Credentials:</p>
            <p>Email: user@dvc.com</p>
            <p>Password: 1234</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 