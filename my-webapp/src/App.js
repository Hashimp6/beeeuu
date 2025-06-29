import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;
