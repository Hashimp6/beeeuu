// src/pages/Welcome.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-800 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center p-6"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to serchBy</h1>
        <p className="text-lg md:text-xl mb-6">
          Your powerful and seamless web experience starts here.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="border border-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-indigo-700 transition"
          >
            Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;
