// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext.js";
import { NotificationProvider } from "./context/NotificationContext";
import AppNavigator from "./navigation/AppNavigator.js";
import linking from "./navigation/linkingConfig.js";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SocketProvider>
          <NavigationContainer linking={linking}>
            <AppNavigator />
          </NavigationContainer>
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}