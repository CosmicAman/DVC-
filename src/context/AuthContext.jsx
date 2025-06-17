import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.isAdmin || false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const userData = {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: user.email.includes('admin') ? 'admin' : 'public',
          isAdmin: user.email.includes('admin')
        };
        setUser(userData);
        setIsAdmin(userData.isAdmin);
        localStorage.setItem('user', JSON.stringify(userData));
        // Redirect to home page after successful login
        window.location.hash = '/';
      } else {
        // User is signed out
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('user');
        window.location.hash = '/login';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with name
      await updateProfile(user, {
        displayName: name
      });

      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const googleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create user data object
      const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        role: 'public',
        isAdmin: false
      };

      // Update state and storage
      setUser(userData);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Google signup failed:', error);
      throw error;
    }
  };

  const login = (email, password) => {
    // For demo purposes, hardcoded admin credentials
    if (email === 'admin@dvc.com' && password === '1234') {
      const adminUser = {
        id: 'admin-1',
        email: 'admin@dvc.com',
        name: 'Admin User',
        role: 'admin',
        isAdmin: true
      };
      setUser(adminUser);
      setIsAdmin(true);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create user data object
      const userData = {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        role: 'public',
        isAdmin: false
      };

      // Update state and storage
      setUser(userData);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('user');
      window.location.hash = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      login, 
      signup, 
      googleLogin, 
      googleSignup,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 