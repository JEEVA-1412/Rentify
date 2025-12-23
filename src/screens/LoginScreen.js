import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, loginWithDemo, signUp } = useAuth();

  // Original handleLogin function - still works with Firebase now
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      // Navigation happens automatically via AuthContext state change
    } else {
      Alert.alert('Login Failed', result.error || 'Please try again');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    
    if (!result.success) {
      Alert.alert('Google Login Failed', result.error);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setEmail('demo@rentify.com');
    setPassword('password123');
    
    const result = await loginWithDemo();
    setIsLoading(false);
    
    if (!result.success) {
      Alert.alert('Demo Login Failed', result.error);
    }
  };

  const handleSignUp = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    Alert.alert(
      'Create Account',
      'Do you want to create a new account with these credentials?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Up',
          onPress: async () => {
            setIsLoading(true);
            const result = await signUp(email, password);
            setIsLoading(false);
            
            if (!result.success) {
              Alert.alert('Sign Up Failed', result.error);
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Rentify</Text>
          <Text style={styles.tagline}>Smart Equipment Rental</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Signing in...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.disabledButton]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.googleButton, isLoading && styles.disabledButton]}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signupButton, isLoading && styles.disabledButton]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                <Text style={styles.signupButtonText}>Create New Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoButton, isLoading && styles.disabledButton]}
                onPress={handleDemoLogin}
                disabled={isLoading}
              >
                <Text style={styles.demoButtonText}>Use Demo Account</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.disclaimer}>
            For demo purposes, any email and password will work if Firebase is not available.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ... (keep your existing styles, just add these new ones)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#DB4437',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disclaimer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default LoginScreen;