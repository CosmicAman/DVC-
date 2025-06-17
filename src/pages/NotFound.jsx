import React from 'react';
import { useRouter } from '../context/RouterContext';
import '../styles/NotFound.css';

function NotFound() {
  const { navigate } = useRouter();

  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default NotFound; 