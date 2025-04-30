import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
 
const AuthContext = createContext();
 
export const useAuth = () => useContext(AuthContext);
const auth = getAuth();
 
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

const storeUserToken = async (value) => {
  try {
    await AsyncStorage.setItem('@user_token', value)
  } catch (e) {
    console.error('Failed to save the data to the storage')
  }
}
 
export const getUserToken = async () => {
  try {
    const value = await AsyncStorage.getItem('@user_token')
    if(value !== null) {
      return value;
    }
  } catch(e) {
    console.error('Failed to fetch the data from storage');
  }
}

export const signUp = async (email, password) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      storeUserToken(user.uid);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

export const signIn =  async (email, password) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      storeUserToken(user.uid);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
}

export const logOut = async () => {
  signOut(auth).then(() => {
  }).catch((error) => {
  });
}
