import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile as updateFirebaseProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '51194619678-r5fi7e8ce951mghmst77342hci4a22cf.apps.googleusercontent.com', 
  offlineAccess: true,
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get Firebase auth instance
  const auth = getAuth();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase user to app user structure
        const appUser = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber || '',
          address: '',
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          metadata: {
            creationTime: firebaseUser.metadata?.creationTime,
            lastSignInTime: firebaseUser.metadata?.lastSignInTime,
          },
          providerData: firebaseUser.providerData,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [auth]);

  // Email/Password Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      return { 
        success: true, 
        user: {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email,
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      
      let errorMessage = 'Login failed. Please try again.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Google Play Services is available (Android only)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the user's ID token
      const { idToken } = await GoogleSignin.signIn();
      
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;
      
      return { 
        success: true, 
        user: {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        }
      };
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setError(error.message);
      
      let errorMessage = 'Google Sign-In failed. Please try again.';
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email. Please use email/password login.';
      } else if (error.code === 'SIGN_IN_CANCELLED') {
        // User cancelled the sign-in flow
        return { success: false, error: 'Sign-in cancelled' };
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with Email/Password
  const signUp = async (email, password, name = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update profile with name if provided
      if (name) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: name
        });
      }
      
      return { 
        success: true, 
        user: {
          id: firebaseUser.uid,
          name: name || email.split('@')[0],
          email: firebaseUser.email,
        }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      
      let errorMessage = 'Sign up failed. Please try again.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // DEMO LOGIN - FIXED VERSION
  const loginWithDemo = async () => {
    const demoEmail = 'demo@rentify.com';
    const demoPassword = 'password123';
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting demo login...');
      
      // FIRST: Try to sign in with demo credentials
      try {
        console.log('Attempting sign in with demo credentials...');
        const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
        const firebaseUser = userCredential.user;
        console.log('Demo sign in successful!');
        
        return { 
          success: true, 
          user: {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Demo User',
            email: firebaseUser.email,
          }
        };
      } catch (signInError) {
        console.log('Sign in failed:', signInError.code, signInError.message);
        
        // If demo user doesn't exist, create one
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          console.log('Creating new demo user...');
          
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
            const firebaseUser = userCredential.user;
            
            // Update profile with demo name
            await updateFirebaseProfile(firebaseUser, {
              displayName: 'Demo User'
            });
            
            console.log('Demo user created successfully!');
            
            return { 
              success: true, 
              user: {
                id: firebaseUser.uid,
                name: 'Demo User',
                email: firebaseUser.email,
              }
            };
          } catch (createError) {
            console.error('Failed to create demo user:', createError);
            
            // If creation fails (e.g., email already exists but password is wrong),
            // fall back to original demo mode
            return createFallbackDemoUser();
          }
        } else {
          // For other errors, throw to be caught by outer catch
          throw signInError;
        }
      }
    } catch (error) {
      console.error('Demo login error:', error.code, error.message);
      setError(error.message);
      
      // Fall back to original demo mode if Firebase fails completely
      return createFallbackDemoUser();
    } finally {
      setLoading(false);
    }
  };

  // Fallback demo user creation (when Firebase is not available)
  const createFallbackDemoUser = () => {
    console.log('Creating fallback demo user (no Firebase)');
    
    const demoUser = {
      id: 'demo-1',
      uid: 'demo-1',
      name: 'Demo User',
      email: 'demo@rentify.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, Country',
      photoURL: null,
    };
    
    setUser(demoUser);
    
    return { 
      success: true, 
      user: demoUser,
      isFallback: true // Flag to indicate this is a fallback user
    };
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      
      // Only sign out from Firebase if user was logged in with Firebase
      if (user?.id && !user.id.startsWith('demo-')) {
        await signOut(auth);
        
        // Sign out from Google if signed in with Google
        if (await GoogleSignin.isSignedIn()) {
          await GoogleSignin.signOut();
        }
      }
      
      setUser(null);
      setError(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      
      return { success: false, error: 'Failed to logout. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Handle fallback demo user differently
      if (user?.id?.startsWith('demo-')) {
        setUser(prev => ({ ...prev, ...profileData }));
        return { success: true, isFallback: true };
      }
      
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      // Update Firebase profile
      const updates = {};
      if (profileData.name) {
        updates.displayName = profileData.name;
      }
      if (profileData.photoURL) {
        updates.photoURL = profileData.photoURL;
      }
      
      if (Object.keys(updates).length > 0) {
        await updateFirebaseProfile(currentUser, updates);
      }
      
      // Update email if changed
      if (profileData.email && profileData.email !== currentUser.email) {
        await updateEmail(currentUser, profileData.email);
      }
      
      // Update local user state
      setUser(prev => ({ ...prev, ...profileData }));
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security, please re-authenticate to update your email.';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateEmailAddress = async (newEmail) => {
    try {
      const currentUser = auth.currentUser;
      await updateEmail(currentUser, newEmail);
      
      // Update local state
      setUser(prev => ({ ...prev, email: newEmail }));
      
      return { success: true };
    } catch (error) {
      console.error('Update email error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update Password
  const updateUserPassword = async (newPassword) => {
    try {
      const currentUser = auth.currentUser;
      await updatePassword(currentUser, newPassword);
      
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.message };
    }
  };

  // Send Password Reset Email
  const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete Account
  const deleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;
      await currentUser.delete();
      
      setUser(null);
      setError(null);
      
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    return user !== null;
  };

  // Get current authentication state
  const getCurrentUser = () => {
    return auth.currentUser;
  };

  // Get ID token (useful for API calls)
  const getIdToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        return token;
      }
      return null;
    } catch (error) {
      console.error('Get ID token error:', error);
      return null;
    }
  };

  // Reload user data from Firebase
  const reloadUser = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.reload();
        
        // Update local state with fresh data
        const firebaseUser = auth.currentUser;
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber || '',
          address: '',
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
        
        return { success: true };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error) {
      console.error('Reload user error:', error);
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        loginWithGoogle,
        loginWithDemo,
        signUp,
        logout,
        updateProfile,
        updateEmail: updateEmailAddress,
        updatePassword: updateUserPassword,
        sendPasswordResetEmail: sendPasswordReset,
        deleteAccount,
        isLoggedIn,
        getCurrentUser,
        getIdToken,
        reloadUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};