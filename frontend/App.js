import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";import AppNavigator from "./navigation/AppNavigator.js";
import { SocketProvider } from "./context/SocketContext.js";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        </SocketProvider>
    </AuthProvider>
  );
}