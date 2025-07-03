import React, { useEffect, useState } from "react";
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
  Alert,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { SERVER_URL } from "../config";

const OtpVerificationScreen = () => {
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { verifyOTP, loading } = useAuth();
  
  // Get email from navigation params
  const { email } = route.params || {};

  useEffect(() => {
    if (!email) {
      Alert.alert("Error", "Email information is missing");
      navigation.navigate("Register");
    }
    console.log("OTP Verification for email:", email);
  }, [email, navigation]);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP code");
      return;
    }

    try {
      const result = await verifyOTP(email, otp);

      if (result.success) {
        console.log("OTP verification successful");
        // The AuthContext will automatically set the user and token
        // Navigation will be handled by AppNavigator once isAuthenticated becomes true
      } else {
        Alert.alert("Error", result.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert("Error", "Verification failed. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Email information is missing");
      return;
    }
    
    try {
      setResendLoading(true);
      
      const response = await axios.post(`${SERVER_URL}/users/resend-otp`, {
        email,
      });
    
      if (response.data && response.data.success) {
        Alert.alert("Success", "OTP has been resent to your email");
      } else {
        Alert.alert("Error", response.data?.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error.response?.data || error.message);
      // Prevent component unmounting due to navigation
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.contentContainer}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/icon.png')}
                style={styles.logo}
              />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                Please enter the 6-digit code sent to{"\n"}
                <Text style={styles.emailText}>{email}</Text>
              </Text>

              <View style={styles.otpInputWrapper}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="Enter OTP"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>

              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                  {resendLoading ? (
                    <ActivityIndicator size="small" color="#000000" />
                  ) : (
                    <Text style={styles.resendLinkText}>Resend</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 250,
    height: 90,
    resizeMode: 'contain',
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: "bold",
    color: "#000000",
  },
  otpInputWrapper: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 32,
  },
  otpInput: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    padding: 0,
    fontWeight: "500",
  },
  verifyButton: {
    backgroundColor: "#000000",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: "#666666",
  },
  resendLinkText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
  },
});
export default OtpVerificationScreen