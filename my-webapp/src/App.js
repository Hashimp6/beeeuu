import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Home";
import RegisterPage from "./pages/auth/Register";
import LoginPage from "./pages/auth/Login";
import HomeLayout from "./pages/HomeScreen";
import OtpVerificationPage from "./pages/auth/Otp";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import CustomToaster from "./components/ToastComponent";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import StoreProfile from "./pages/user/StoreProfile";
import OrderDetails from "./pages/user/OrderDataCollection";
import AppointmentScheduler from "./pages/user/AppointmentShedule";
import StoreDashboard from "./pages/seller/StoreDashboard";
import NewStore from "./pages/NewStore";
import { useAuth } from "./context/UserContext";
import UserAppointmentsOrders from "./pages/user/AppointmentsAndOrders";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Auth Route Component (redirects authenticated users away from auth pages)
const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <CustomToaster />
      <Router>
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route path="/" element={<Welcome />} />
          <Route path="/storeprofile/:storeName" element={<StoreProfile />} />
          <Route path="/home"  element={ <HomeLayout />  } 
          />
          {/* Auth Routes - Only unauthenticated users can access */}
          <Route 
            path="/register" 
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/otp" 
            element={
              <AuthRoute>
                <OtpVerificationPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <AuthRoute>
                <ForgotPasswordPage />
              </AuthRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <AuthRoute>
                <ResetPasswordPage />
              </AuthRoute>
            } 
          />
          
          {/* Protected Routes - Only authenticated users can access */}
          
          <Route 
            path="/newStore" 
            element={
              <ProtectedRoute>
                <NewStore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order-details" 
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointmentShedule" 
            element={
              <ProtectedRoute>
                <AppointmentScheduler />
              </ProtectedRoute>
            } 
          />
                <Route 
            path="/appointmentOrOrder" 
            element={
              <ProtectedRoute>
                <UserAppointmentsOrders/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/store-dashboard" 
            element={
              <ProtectedRoute>
                <StoreDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;