import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { app } from "./firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const signUp = async (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      console.error('Error signing up:', error);
    });
}

export const signIn = async (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
    .catch((error) => {
      console.error('Error signing in:', error);
    });
}

export const logOut = async () => {
  signOut(auth).then(() => {
  }).catch((error) => {
      console.error('Error signing out:', error);
  });
}

export const resetPassword = async (email) => {
  sendPasswordResetEmail(auth, email)
    .catch((error) => {
      console.error('Error sending password reset email:', error);
    });
}
