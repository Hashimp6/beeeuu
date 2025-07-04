import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Home";
import RegisterPage from "./pages/auth/Register";
import LoginPage from "./pages/auth/Login";
import HomeLayout from "./pages/HomeScreen";
import OtpVerificationPage from "./pages/auth/Otp";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import CustomToaster from "./components/ToastComponent";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import StoreProfile from "./pages/user/StoreProfile";

function App() {
  return (<>
    <CustomToaster />
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp" element={<OtpVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/storeprofile/:storeName" element={<StoreProfile />} />

        <Route path="/home" element={<HomeLayout />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
