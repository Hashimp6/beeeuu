// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext.js";
import { NotificationProvider } from "./context/NotificationContext";
import AppNavigator from "./navigation/AppNavigator.js";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}