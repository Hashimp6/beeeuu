import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Home";
import RegisterPage from "./pages/auth/Register";
import LoginPage from "./pages/auth/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
