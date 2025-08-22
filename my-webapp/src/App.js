import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import ChatApp from "./components/NewChat";
import { useEffect, useState } from "react";
import PrivacyPolicy from "./pages/policies/Policy";
import ReturnRefundPolicy from "./pages/policies/ReturnPolicy";
import ShippingPolicy from "./pages/policies/ShippingPolicy";
import TermsAndConditions from "./pages/policies/Terms";
import OfferReelPage from "./pages/user/Offers";
import PaymentStatus from "./components/Store/PaymentStatus";
import PaymentSuccess from "./pages/seller/payment/Success";
import PaymentFailed from "./pages/seller/payment/Failed";
import NotFound from "./pages/Error404";
import SerchByLandingPage from "./pages/Home";
import OrderReceipt from "./pages/user/OrderReciept";
import RestaurantQRGenerator from "./components/Store/GenerateQr";
import CustomerBookingPage from "./components/user/Reservation";
import DeliveryBoyScreen from "./pages/user/DeliveryBoy";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
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
  const { user, isAuthenticated } = useAuth();
  
  return (
    <>
      <CustomToaster />
      <Router>
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route path="/" element={<SerchByLandingPage/>} />
          <Route path="/shipping-policy" element={<ShippingPolicy/>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy/>} />
          <Route path="/terms" element={<TermsAndConditions/>} />
          <Route path="/return-policy" element={<ReturnRefundPolicy/>} />
          <Route path="/storeprofile/:storeName" element={<StoreProfile />} />
          <Route path="/store/:storeName" element={<StoreProfile />} />
          <Route path="/offers" element={<HomeLayout />} />
          <Route path="/offers/:offerId" element={<HomeLayout />} />
          <Route path="/Qr" element={<RestaurantQRGenerator/>} />
          <Route path="/Booking" element={<CustomerBookingPage/>} />
          <Route path="/Delivery" element={<DeliveryBoyScreen/>} />
          {/* Public Home Route - accessible to everyone */}
          <Route
            path="/home"
            element={
              // If authenticated and seller, show dashboard; otherwise show home layout
              isAuthenticated && user?.role === "seller"
                ? <StoreDashboard />
                : <HomeLayout />
            }
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
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order-details" 
            element={
           
                <OrderDetails />
 
            } 
          />
         <Route path="/receipt/:orderId" element={<OrderReceipt />} />
           <Route 
            path="/payment-success" 
            element={
              <ProtectedRoute>
                <PaymentStatus />
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
            path="/payment-success" 
            element={
              <ProtectedRoute>
                <PaymentSuccess/>
              </ProtectedRoute>
            } 
          />
            <Route 
            path="/payment-failed" 
            element={
              <ProtectedRoute>
                <PaymentFailed/>
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
           <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;