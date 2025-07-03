import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SERVER_URL } from '../../config';
import { useNavigation } from "@react-navigation/native";
import Toast from 'react-native-toast-message';
import axios from "axios";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation();

  // Real-time validation states
  const [showNameError, setShowNameError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showConfirmPasswordError, setShowConfirmPasswordError] = useState(false);

  // Enhanced validation functions
  const validateName = (name) => {
    return name.trim().length >= 3;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Real-time validation handlers
  const handleNameChange = (text) => {
    setName(text);
    if (text.length > 0) {
      setShowNameError(!validateName(text));
    } else {
      setShowNameError(false);
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.length > 0) {
      setShowEmailError(!validateEmail(text));
    } else {
      setShowEmailError(false);
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.length > 0) {
      setShowPasswordError(!validatePassword(text));
    } else {
      setShowPasswordError(false);
    }
    
    // Also check confirm password if it has value
    if (confirmPassword.length > 0) {
      setShowConfirmPasswordError(text !== confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (text.length > 0) {
      setShowConfirmPasswordError(text !== password);
    } else {
      setShowConfirmPasswordError(false);
    }
  };

  const handleRegister = async () => {
    // Enhanced form validation with specific error messages
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Details',
        text2: 'Please fill in all fields.',
      });
      return;
    }

    // Validate name (minimum 3 characters)
    if (!validateName(name)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Name must be at least 3 characters long.',
      });
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    // Validate password length (minimum 6 characters)
    if (!validatePassword(password)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Password',
        text2: 'Password must be at least 6 characters long.',
      });
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match.',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("fine");

      // Send registration request
      const response = await axios.post(`${SERVER_URL}/users/register`, {
        name,
        email,
        password
      });

      // Check response data structure
      if (response.data && response.data.message) {
        console.log("OTP request successful");
        
        Toast.show({
          type: 'success',
          text1: 'Registration Successful!',
          text2: 'Please check your email for OTP verification.',
        });
        
        // Navigate to OTP verification with email
        navigation.navigate("otp", { email });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: 'Unexpected response from server.',
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.formWrapper}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/icon.png')}
                  style={styles.logo}
                />
              </View>

              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Create Account</Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#AAAAAA"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={handleNameChange}
                  />
                  {showNameError && (
                    <Text style={styles.errorText}>
                      Name must be at least 3 characters long
                    </Text>
                  )}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email address"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={handleEmailChange}
                  />
                  {showEmailError && (
                    <Text style={styles.errorText}>
                      Please enter a valid email address
                    </Text>
                  )}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor="#AAAAAA"
                    secureTextEntry
                    value={password}
                    onChangeText={handlePasswordChange}
                  />
                  {showPasswordError && (
                    <Text style={styles.errorText}>
                      Password must be at least 6 characters long
                    </Text>
                  )}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#AAAAAA"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                  />
                  {showConfirmPasswordError && (
                    <Text style={styles.errorText}>
                      Passwords do not match
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.registerButtonText}>
                      Create Account
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Login")}
                  >
                    <Text style={styles.signInText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  formWrapper: {
    width: "100%",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  
  logo: {
    width: 250,
    height: 90,
    resizeMode: 'contain',
  },
  logoText: {
    color: "#000000",
    fontSize: 32,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 2,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
  },
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  inputLabel: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    color: "#000000",
    padding: 0,
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#000000",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  footerText: {
    color: "#666666",
    fontSize: 14,
  },
  signInText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});

export default RegisterScreen;