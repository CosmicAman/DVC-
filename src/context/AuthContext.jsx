import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from './RouterContext';
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { navigate } = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const userData = {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: user.email.includes('admin') ? 'admin' : 'public' // You might want to store this in Firestore
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        // Redirect to home page after successful login
        navigate('/');
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

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
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      
      // You can add additional user data to Firestore here if needed
      return true;
    } catch (error) {
      console.error('Google signup failed:', error);
      throw error;
    }
  };

  const login = async (email, password, adminCode = null) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check admin code if provided
      if (adminCode && adminCode !== 'YOUR_ADMIN_CODE') {
        await signOut(auth);
        throw new Error('Invalid admin code');
      }

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 